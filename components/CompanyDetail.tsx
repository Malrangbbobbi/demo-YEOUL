
import React, { useEffect, useState } from 'react';
import type { CompanyRecommendation, SDG } from '../types';
import { generateCompanyImage } from '../services/geminiService';

interface CompanyDetailProps {
    company: CompanyRecommendation;
    userSdgs: SDG[];
    onBack: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onBack }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

    useEffect(() => {
        const fetchImage = async () => {
            if (!company.image_reference_sentence) return;
            
            setIsLoadingImage(true);
            const url = await generateCompanyImage(company.image_reference_sentence);
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

    const { main: snsMain, tags: snsTags } = formatSnsText(company.sns_promotion);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[85vh] relative">
                
                {/* Close Button (Floating) */}
                <button 
                    onClick={onBack} 
                    className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Left Panel: Visuals & Header (Dark Theme) */}
                <div className="lg:w-5/12 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase mb-3 border border-blue-500/30">
                                Investment Focus
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">{company.corp_name}</h1>
                            <p className="text-xl text-blue-400 font-mono">{company.corp_code}</p>
                        </div>

                        {/* SDG Visual Snapshot */}
                        <div className="mt-auto">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                SDG 비주얼 스냅샷
                            </h2>
                            <div className="w-full aspect-square bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 group">
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

                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CompanyDetail;
