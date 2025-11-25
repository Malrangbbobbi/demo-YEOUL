
import { GoogleGenAI, Type } from "@google/genai";
import type { ModelOutput, RiskPreference, SdgScore } from '../types';
import { SDG_LIST } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this environment, we assume it's set.
  console.warn("API_KEY is not set. Using a mock response.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const riskToFloat = (risk: RiskPreference): number => {
    switch (risk) {
        case '안전형': return 0.0;
        case '중립형': return 0.5;
        case '공격형': return 1.0;
        default: return 0.5;
    }
};

const getMockResponse = (): ModelOutput => {
    return {
        "recommended_companies": [
            {
                "corp_name": "클린에너지 솔루션",
                "corp_code": "CES001",
                "match_score": 92.5,
                "top_sdg": "G07",
                "explanation": "클린에너지 솔루션은 태양광 및 풍력 발전 기술에 대한 혁신적인 연구와 상용화에 앞장서고 있습니다. 특히, 에너지 효율을 극대화하는 스마트 그리드 시스템을 개발하여 지속 가능한 에너지 공급에 크게 기여하고 있습니다. 이는 사용자가 중요하게 생각하는 '깨끗한 에너지' 가치와 매우 높은 부합도를 보입니다.",
                "sdg_alignment": [2, 1, 3, 2, 1, 4, 5, 4, 5, 2, 4, 5, 4, 1, 3, 2, 4]
            },
            {
                "corp_name": "스마트팜 코리아",
                "corp_code": "SFK002",
                "match_score": 88.0,
                "top_sdg": "G02",
                "explanation": "스마트팜 코리아는 AI와 IoT 기술을 활용하여 농업 생산성을 획기적으로 개선하고 있습니다. 기후 변화에 대응하고 식량 안보에 기여하는 이들의 기술은 '기아 종식'이라는 인류 공통의 목표에 부합하며, 사용자의 가치관과도 일치합니다.",
                "sdg_alignment": [3, 5, 4, 3, 2, 2, 3, 5, 4, 1, 5, 4, 3, 1, 2, 3, 4]
            },
            {
                "corp_name": "에코 플라스틱",
                "corp_code": "ECP003",
                "match_score": 85.2,
                "top_sdg": "G12",
                "explanation": "에코 플라스틱은 폐플라스틱을 100% 재활용하여 새로운 제품을 만드는 혁신적인 기술을 보유하고 있습니다. 순환 경제를 구축하고 해양 오염을 줄이는 데 기여하며, '책임감 있는 소비와 생산'이라는 가치를 실현하는 대표적인 기업입니다.",
                "sdg_alignment": [1, 2, 3, 2, 3, 5, 3, 3, 4, 2, 4, 5, 5, 4, 3, 2, 3]
            }
        ]
    };
}


export const getCompanyRecommendations = async (
    sdgScores: SdgScore[],
    riskPreference: RiskPreference
): Promise<ModelOutput> => {
    if (!API_KEY) {
        console.log("Using mock data because API_KEY is not available.");
        return new Promise(resolve => setTimeout(() => resolve(getMockResponse()), 1500));
    }

    const fullSdgScores = Array(17).fill(0.0);
    sdgScores.forEach(item => {
        fullSdgScores[item.sdgId - 1] = item.score;
    });

    const userSdgPreferences = sdgScores.map(s => {
        const sdgInfo = SDG_LIST.find(sdg => sdg.id === s.sdgId);
        return `${sdgInfo?.title} (ID: ${sdgInfo?.code}, 중요도: ${s.score}/5)`;
    }).join(', ');
    
    const prompt = `
    당신은 ESG 및 SDGs 기반 금융 투자 전문가 AI입니다. 사용자의 가치관과 투자 성향을 바탕으로 한국 상장 기업 중 가장 적합한 3개 기업을 추천해야 합니다.
    
    **사용자 데이터:**
    1.  **중요하게 생각하는 SDGs:** ${userSdgPreferences}
    2.  **투자 위험 선호도:** ${riskPreference} (0.0: 안전형, 0.5: 중립형, 1.0: 공격형)

    **요구사항:**
    1.  제공된 사용자 데이터를 심층 분석하여, 해당 SDGs 가치 실현에 가장 부합하고 투자 성향에도 맞는 한국 기업 3개를 추천해주세요.
    2.  추천 기업은 가상의 기업이 아닌, 실제 기업처럼 보이도록 그럴듯한 이름과 사업 내용을 만들어주세요. (예: '그린테크', '휴먼케어 로보틱스')
    3.  각 기업에 대해 0점에서 100점 사이의 '매칭 점수(match_score)'를 부여하세요.
    4.  각 기업이 사용자가 선택한 SDG 중 어떤 가치와 가장 부합하는지 'top_sdg' 코드로 명시해주세요.
    5.  'explanation' 필드에는 왜 이 기업이 사용자에게 추천되었는지, 어떤 SDG 활동을 하는지 150자 내외로 구체적이고 설득력 있게 설명해주세요.
    6.  'sdg_alignment' 필드에는 17개 SDG 각각에 대해 해당 기업이 얼마나 부합하는지를 1~5점 척도로 평가한 점수 배열을 포함해주세요.
    7.  반드시 아래에 명시된 JSON 형식으로만 응답해주세요. 다른 설명은 추가하지 마세요.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        recommended_companies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              corp_name: { type: Type.STRING, description: "추천 기업명" },
              corp_code: { type: Type.STRING, description: "기업 고유 코드 (예: A005930)" },
              match_score: { type: Type.NUMBER, description: "사용자와의 적합도 점수 (0-100)" },
              top_sdg: { type: Type.STRING, description: "가장 부합하는 SDG 코드 (예: G01, G13)" },
              explanation: { type: Type.STRING, description: "추천 이유 및 기업의 SDG 활동 설명" },
              sdg_alignment: {
                type: Type.ARRAY,
                description: "17개 SDG 각각에 대한 기업의 부합도 점수 (1-5점) 배열",
                items: { type: Type.NUMBER }
              }
            },
            required: ["corp_name", "corp_code", "match_score", "top_sdg", "explanation", "sdg_alignment"],
          },
        },
      },
      required: ["recommended_companies"],
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as ModelOutput;
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        console.log("Falling back to mock response due to API error.");
        return getMockResponse();
    }
};

export const generateCompanyImage = async (prompt: string): Promise<string | null> => {
    if (!API_KEY) {
        console.warn("API_KEY is not available for image generation.");
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
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
