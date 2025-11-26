
import { GoogleGenAI, Type } from "@google/genai";
import type { ModelOutput, RiskPreference, SdgScore, RawCompanyData, CompanyRecommendation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "mock-key" });

// Helper to format SDG ID to G-code (e.g., 1 -> "G01", 17 -> "G17")
const getGCode = (id: number) => `G${id.toString().padStart(2, '0')}`;

/**
 * Parses a single line of CSV/TSV data, handling quotes.
 */
const parseCSVLine = (line: string, delimiter: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
            values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return values;
};

/**
 * Fetches and parses the CSV data from the public folder.
 */
const fetchCompanyData = async (): Promise<RawCompanyData[]> => {
    try {
        const response = await fetch('/data.csv');
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) return [];

        // Detect delimiter (Tab or Comma) based on the header
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        const headers = firstLine.split(delimiter).map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = parseCSVLine(line, delimiter);
            const row: any = {};
            
            headers.forEach((header, index) => {
                const val = values[index];
                
                // FORCE STRING TYPE FOR CORP_CODE to preserve leading zeros (e.g., "036460")
                if (header === 'corp_code') {
                    row[header] = val ? val.trim() : '';
                } 
                // Try to convert to number if possible, otherwise keep as string
                else if (val !== undefined && val !== '' && !isNaN(Number(val))) {
                    row[header] = Number(val);
                } else {
                    row[header] = val || '';
                }
            });
            return row as RawCompanyData;
        });

    } catch (error) {
        console.error("Error loading company data:", error);
        return [];
    }
};

/**
 * Calculates a match score for a company based on user's selected SDGs and Risk Profile.
 */
const calculateScore = (company: RawCompanyData, userSdgScores: SdgScore[], riskPreference: RiskPreference): number => {
    let totalScore = 0;

    // 1. SDG Score
    userSdgScores.forEach(s => {
        const gCode = getGCode(s.sdgId);
        const mentions = (company[`${gCode}_mentions_per_1k_tokens`] as number) || 0;
        const sentiment = (company[`${gCode}_sent_mean`] as number) || 0;
        const userWeight = s.score; // 1 to 5

        // Formula: Mention Frequency * Sentiment * User Importance
        // We log-scale mentions to prevent outliers from dominating too much, or use raw if values are small (0-5 range).
        // Based on sample data, mentions are ~1.0-6.0.
        totalScore += (mentions * sentiment * userWeight);
    });

    // 2. Risk Profile Weighting
    let riskMultiplier = 1.0;
    const companyRisk = company.Risk_Tag; // '안전형', '중립형', '공격형'

    if (riskPreference === '안전형') {
        if (companyRisk === '안전형') riskMultiplier = 1.2;
        else if (companyRisk === '공격형') riskMultiplier = 0.8;
    } else if (riskPreference === '공격형') {
        if (companyRisk === '공격형') riskMultiplier = 1.2;
        else if (companyRisk === '안전형') riskMultiplier = 0.9;
    } else {
        // Neutral user
        if (companyRisk === '중립형') riskMultiplier = 1.1;
    }

    return totalScore * riskMultiplier;
};

export const getCompanyRecommendations = async (
    sdgScores: SdgScore[],
    riskPreference: RiskPreference
): Promise<ModelOutput> => {
    // 1. Load Data
    const rawData = await fetchCompanyData();
    
    if (rawData.length === 0) {
        throw new Error("데이터를 불러올 수 없습니다. data.csv 파일을 확인해주세요.");
    }

    // 2. Score Companies
    const scoredCompanies = rawData.map(company => {
        const score = calculateScore(company, sdgScores, riskPreference);
        
        // Identify the top SDG for this company among the user's choices
        // We look for the one with the highest contribution to the score (mentions * sentiment)
        let topSdgId = sdgScores[0].sdgId;
        let maxVal = -1;

        sdgScores.forEach(s => {
            const code = getGCode(s.sdgId);
            const val = ((company[`${code}_mentions_per_1k_tokens`] as number) || 0) * 
                        ((company[`${code}_sent_mean`] as number) || 0);
            if (val > maxVal) {
                maxVal = val;
                topSdgId = s.sdgId;
            }
        });

        return { ...company, score, topSdgId };
    }).sort((a, b) => b.score - a.score);

    // 3. Select Top 3
    const top3 = scoredCompanies.slice(0, 3);

    const recommendations: CompanyRecommendation[] = [];

    // 4. Generate Content with Gemini
    for (const company of top3) {
        const topGCode = getGCode(company.topSdgId);
        
        // Extract specific fields from the CSV row
        // Note: The CSV headers in your sample are exact, e.g., 'G01_reference_sentence'
        const rawReferenceSentence = company[`${topGCode}_reference_sentence`] as string;
        
        // Clean up the reference sentence if it has prefixes like "[TABLE p15 #13]"
        // A simple cleanup to remove bracketed prefixes
        const cleanReference = rawReferenceSentence ? rawReferenceSentence.replace(/^\[.*?\]/, '').trim() : "해당 분야에 대한 구체적인 활동 내역이 데이터에 없습니다.";

        // Construct Prompt
        const prompt = `
        Analyze the following company based on its ESG data for a Korean investment service.

        **Company**: ${company.company_name} (${company.corp_code})
        **Top SDG Activity**: ${cleanReference}
        **Investment Tag**: ${company.Risk_Tag}
        **Sentiment Score**: ${company[`${topGCode}_sent_mean`]}

        Please generate the following 3 fields in JSON format:
        1. "explanation": A concise 2-sentence summary explaining why this company is a good match for the user's interest in the selected SDG.
        2. "investment_report": A professional 3-4 sentence investment analysis paragraph. Mention the specific activity ("${cleanReference.substring(0, 30)}...") and its potential impact on the company's value. Use a formal, trustworthy tone (~할 것으로 전망됩니다).
        3. "sns_promotion": A catchy, viral-style Instagram caption promoting this company's good deeds. Use emojis and hashtags.

        Target Audience: Young investors interested in sustainable impact.
        Language: Korean.
        `;

        let generatedContent: any = {};
        
        if (API_KEY) {
            try {
                const result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                explanation: { type: Type.STRING },
                                investment_report: { type: Type.STRING },
                                sns_promotion: { type: Type.STRING }
                            }
                        }
                    }
                });
                generatedContent = JSON.parse(result.text || "{}");
            } catch (e) {
                console.error("Gemini Generation Error", e);
                // Fallback content if API fails
                generatedContent = {
                    explanation: `${company.company_name}은(는) 해당 지속가능발전목표 분야에서 두각을 나타내고 있습니다.`,
                    investment_report: "데이터 기반 분석 결과, 해당 기업은 ESG 경영을 통해 장기적인 가치 상승이 기대됩니다.",
                    sns_promotion: `지구를 생각하는 착한 기업 ${company.company_name}! 🌍✨ #ESG #투자 #지속가능성`
                };
            }
        }

        recommendations.push({
            corp_name: company.company_name,
            corp_code: company.corp_code, // Now this will be a string with leading zeros
            match_score: company.score,
            top_sdg: topGCode,
            explanation: generatedContent.explanation,
            investment_report: generatedContent.investment_report,
            sns_promotion: generatedContent.sns_promotion,
            image_reference_sentence: cleanReference,
            sdg_alignment: [] // Not strictly needed for the detail view request, can be empty or computed
        });
    }

    return { recommended_companies: recommendations };
};

export const generateCompanyImage = async (referenceSentence: string): Promise<string | null> => {
    if (!API_KEY) return null;

    try {
        // Create a visual prompt based on the reference sentence
        const imagePrompt = `A high-quality, futuristic, and cinematic 3D concept art visualizing this corporate activity: "${referenceSentence}". 
        The image should be inspiring, clean, and professional. 
        Style: Photorealistic, 8k resolution, soft lighting, sustainable technology theme. No text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // NANO BANANA
            contents: { parts: [{ text: imagePrompt }] },
        });

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};
