
import React, { useState } from 'react';
import type { RiskPreference } from '../types';

interface InvestmentSurveyProps {
  onComplete: (data: { riskPreference: RiskPreference; investmentExperience: string[]; investmentPeriod: string; }) => void;
  error: string | null;
}

const riskOptions: { value: RiskPreference; label: string; description: string }[] = [
  { value: '안전형', label: '안전형', description: '원금 손실 위험을 최소화하고, 안정적인 수익을 추구합니다.' },
  { value: '중립형', label: '중립형', description: '어느 정도의 위험을 감수하며, 안정성과 수익성의 균형을 맞춥니다.' },
  { value: '공격형', label: '공격형', description: '높은 수익을 위해 높은 위험을 감수할 수 있습니다.' },
];

const experienceOptions = ['주식', '펀드', '채권', '부동산', '암호화폐', '경험 없음'];
const periodOptions = ['1년 미만', '1~3년', '3~5년', '5년 이상'];

const InvestmentSurvey: React.FC<InvestmentSurveyProps> = ({ onComplete, error }) => {
  const [riskPreference, setRiskPreference] = useState<RiskPreference | null>(null);
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [investmentPeriod, setInvestmentPeriod] = useState<string | null>(null);

  const handleExperienceChange = (experience: string) => {
    setInvestmentExperience(prev =>
      prev.includes(experience)
        ? prev.filter(item => item !== experience)
        : [...prev, experience]
    );
  };

  const handleSubmit = () => {
    if (riskPreference && investmentPeriod && investmentExperience.length > 0) {
      onComplete({ riskPreference, investmentExperience, investmentPeriod });
    } else {
      alert('모든 질문에 답변해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">투자 성향 분석</h2>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{error}</p></div>}

        <div className="space-y-10">
          {/* Question 1: Risk Preference (for AI Model) */}
          <div>
            <label className="block text-lg font-semibold text-gray-800">
              1. 고객님의 투자수익·투자위험에 대한 태도는 어떻습니까?
              <span className="ml-2 text-sm font-normal text-blue-600">(AI 추천에 사용됩니다)</span>
            </label>
            <div className="mt-4 space-y-3">
              {riskOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => setRiskPreference(option.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${riskPreference === option.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-400'}`}
                >
                  <p className="font-bold">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Question 2: Investment Experience */}
          <div>
            <label className="block text-lg font-semibold text-gray-800">
              2. 투자 경험이 있는 상품을 모두 선택해주세요.
              <span className="ml-2 text-sm font-normal text-gray-500">(참고용)</span>
            </label>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {experienceOptions.map(option => (
                <div
                  key={option}
                  onClick={() => handleExperienceChange(option)}
                  className={`p-3 border rounded-md text-center cursor-pointer transition-colors ${investmentExperience.includes(option) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: Investment Period */}
          <div>
            <label className="block text-lg font-semibold text-gray-800">
              3. 투자가능 기간은 어느정도 되십니까?
              <span className="ml-2 text-sm font-normal text-gray-500">(참고용)</span>
            </label>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {periodOptions.map(option => (
                <div
                  key={option}
                  onClick={() => setInvestmentPeriod(option)}
                  className={`p-3 border rounded-md text-center cursor-pointer transition-colors ${investmentPeriod === option ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={handleSubmit}
            disabled={!riskPreference || !investmentPeriod || investmentExperience.length === 0}
            className="px-10 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            결과 확인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSurvey;
