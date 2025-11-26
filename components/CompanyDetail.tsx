
import React, { useEffect, useState, useRef } from 'react';
import type { CompanyRecommendation, SDG } from '../types';
import { generateCompanyImage } from '../services/geminiService';
import RadarChartComponent from './RadarChartComponent';
import html2canvas from 'html2canvas';

interface CompanyDetailProps {
    company: CompanyRecommendation;
    userSdgs: SDG[];
    onBack: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, userSdgs, onBack }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchImage = async () => {
            if (!company.image_reference_sentence) return;
            
            setIsLoadingImage(true);
            // Pass company name for better prompt context
            const url = await generateCompanyImage(company.image_reference_sentence, company.corp_name);
            setImageUrl(url);
            setIsLoadingImage(false);
        };
        fetchImage();
    }, [company]);

    // Helper to split SNS text into main body and hashtags
    const formatSnsText = (text: string) => {
        if (!text) return { main: '', tags: '' };
        // Find the first occurrence of a hashtag to split content
        const match = text.match(/(\s|^)#/);
        if (match && match.index !== undefined) {
            return {
                main: text.substring(0, match.index).trim(),
                tags: text.substring(match.index).trim()
            };
        }
        return { main: text, tags: '' };
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `여울 - ${company.corp_name} 추천`,
                    text: `나의 가치관에 맞는 기업, ${company.corp_name}을 확인해보세요! #여울 #ESG투자`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            alert("공유하기 기능이 지원되지 않는 브라우저입니다. URL을 복사해주세요.");
        }
    };

    const handleDownload = async () => {
        if (contentRef.current) {
            try {
                const canvas = await html2canvas(contentRef.current, {
                    scale: 2, // High resolution
                    useCORS: true, // Allow cross-origin images if configured
                    backgroundColor: '#ffffff'
                });
                
                const link = document.createElement('a');
                link.download = `${company.corp_name}_ESG_Card.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error("Download failed:", error);
                alert("이미지 저장에 실패했습니다.");
            }
        }
    };

    const { main: snsMain, tags: snsTags } = formatSnsText(company.sns_promotion);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Main Card Container - Ref added here for download functionality */}
            <div ref={contentRef} className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[90vh] relative">
                
                {/* Floating Close Button - Hide when downloading */}
                <button 
                    onClick={onBack} 
                    className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    data-html2canvas-ignore="true"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left Panel: Visuals & Header (Dark Theme) */}
                <div className="lg:w-5/12 bg-slate-900 text-white p-6 lg:p-8 flex flex-col relative overflow-y-auto lg:overflow-visible custom-scrollbar">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col gap-6 h-full">
                        {/* 1. Header Section */}
                        <div className="shrink-0">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase mb-3 border border-blue-500/30">
                                Investment Focus
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">{company.corp_name}</h1>
                            <p className="text-xl text-blue-400 font-mono">{company.corp_code}</p>
                        </div>

                        {/* 2. SDG Value Alignment (Moved here) */}
                        {/* Height reduced to h-52 to pull image up */}
                        <div className="shrink-0">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                                SDG 가치 부합도
                            </h2>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-2 h-52 shadow-inner">
                                <RadarChartComponent 
                                    companyAlignment={company.sdg_alignment} 
                                    userSdgs={userSdgs}
                                    darkMode={true}
                                />
                            </div>
                        </div>

                        {/* 3. SDG Visual Snapshot */}
                        {/* Height increased to h-[500px] to make it more prominent and vertical */}
                        <div className="flex-1 min-h-[500px] shrink-0">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                SDG 비주얼 스냅샷
                            </h2>
                            <div className="w-full h-[500px] bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 group">
                                {isLoadingImage ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-sm text-slate-400 font-medium animate-pulse">Nano Banana 생성 중...</p>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img 
                                            src={imageUrl} 
                                            alt="AI Generated Visualization" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                        <p>이미지 생성 불가</p>
                                    </div>
                                )}
                            </div>
                            <p className="mt-4 text-xs text-slate-400 font-light leading-relaxed border-l-2 border-slate-700 pl-3 line-clamp-3">
                                <span className="font-semibold text-slate-300">Reference:</span> {company.image_reference_sentence}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Detailed Text Content (Light Theme) */}
                <div className="lg:w-7/12 bg-white p-8 lg:p-12 overflow-y-auto">
                    
                    <div className="max-w-2xl mx-auto space-y-10">
                        
                        {/* 1. SDG Insights */}
                        <section>
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                SDG 핵심 인사이트
                            </h2>
                            <div className="text-2xl font-medium text-gray-900 leading-snug">
                                {company.explanation}
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* 2. Impact Report */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">SDG 임팩트 리포트</h2>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap font-sans text-lg">
                                    {company.investment_report}
                                </p>
                            </div>
                        </section>

                        {/* 3. SNS Promotion */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">SNS 홍보 문구</h2>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
                                
                                <p className="text-indigo-900 text-lg font-medium whitespace-pre-wrap mb-6 relative z-10">
                                    "{snsMain}"
                                </p>
                                
                                {snsTags && (
                                    <div className="pt-4 border-t border-indigo-100/50">
                                        <p className="text-indigo-600 font-bold text-sm tracking-wide leading-relaxed">
                                            {snsTags}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Actions Row - Moved to bottom */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100" data-html2canvas-ignore="true">
                            <button 
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                공유하기
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                카드 다운로드
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default CompanyDetail;
