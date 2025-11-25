
import React from 'react';
import type { CompanyRecommendation, SurveyData, SDG } from '../types';
import { SDG_LIST } from '../constants';

const SdgChip: React.FC<{ sdg: SDG }> = ({ sdg }) => (
    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: sdg.color }}></div>
        <span className="text-sm font-medium text-gray-700">{sdg.title}</span>
    </div>
);

interface DashboardProps {
    recommendations: CompanyRecommendation[];
    surveyData: SurveyData;
    onSelectCompany: (company: CompanyRecommendation) => void;
    onRestart: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ recommendations, surveyData, onSelectCompany, onRestart }) => {
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">AI 추천 결과</h1>
                    <p className="text-lg text-gray-600 mt-2">당신의 가치관과 투자 성향에 맞는 기업입니다.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">나의 분석 요약</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex flex-wrap gap-2">
                            <span className="font-semibold">선택한 가치:</span>
                            {surveyData.selectedSdgs.map(sdg => (
                                <SdgChip key={sdg.id} sdg={sdg} />
                            ))}
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold">투자 성향:</span>
                            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{surveyData.riskPreference}</span>
                        </div>
                    </div>
                </div>

                <main>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendations.map((company, index) => {
                            const topSdg = SDG_LIST.find(s => s.code === company.top_sdg);
                            return (
                                <div key={company.corp_code} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-semibold text-blue-600">추천 순위 {index + 1}</p>
                                                <h3 className="text-2xl font-bold text-gray-900">{company.corp_name}</h3>
                                                <p className="text-sm text-gray-500">{company.corp_code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">매칭 점수</p>
                                                <p className="text-2xl font-bold text-blue-600">{company.match_score.toFixed(1)}점</p>
                                            </div>
                                        </div>
                                        
                                        {topSdg && (
                                            <div className="mb-4">
                                                <p className="text-sm font-semibold mb-2">주요 매칭 SDG</p>
                                                <div className="flex items-center p-3 rounded-lg" style={{backgroundColor: `${topSdg.color}20`}}>
                                                    <topSdg.icon className="w-8 h-8 mr-3" style={{color: topSdg.color}} />
                                                    <span className="font-bold text-gray-800">{topSdg.title}</span>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-gray-700 h-24 overflow-hidden text-ellipsis">{company.explanation}</p>
                                        
                                        <button
                                            onClick={() => onSelectCompany(company)}
                                            className="mt-4 w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition-colors duration-300"
                                        >
                                            자세히 보기
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
                
                <footer className="mt-12 text-center">
                    <button
                        onClick={onRestart}
                        className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-full hover:bg-gray-300 transition-colors duration-300"
                    >
                        다시 테스트하기
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
