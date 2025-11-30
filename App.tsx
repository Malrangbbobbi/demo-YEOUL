
import React, { useState, useCallback } from 'react';
import StartScreen from './components/StartScreen';
import SdgSelection from './components/SdgSelection';
import InvestmentSurvey from './components/InvestmentSurvey';
import Dashboard from './components/Dashboard';
import CompanyDetail from './components/CompanyDetail';
import CompanyIntroVideo from './components/CompanyIntroVideo'; // Import new component
import { getCompanyRecommendations } from './services/geminiService';
import type { AppStep, SurveyData, CompanyRecommendation, RiskPreference, SdgScore, SDG } from './types';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-medium">AI가 맞춤형 기업을 찾고 있습니다...</p>
    <p className="text-sm text-gray-600">잠시만 기다려주세요.</p>
  </div>
);

export default function App() {
  const [step, setStep] = useState<AppStep>('start');
  const [surveyData, setSurveyData] = useState<SurveyData>({
    selectedSdgs: [],
    sdgScores: [],
    riskPreference: null,
    investmentExperience: [],
    investmentPeriod: null,
  });
  const [recommendations, setRecommendations] = useState<CompanyRecommendation[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => setStep('sdg-select');

  const handleSdgSelectNext = (selectedSdgs: SDG[]) => {
    setSurveyData(prev => ({ ...prev, selectedSdgs }));
    setStep('sdg-score');
  };
  
  const handleSdgScoreNext = (scores: SdgScore[]) => {
    setSurveyData(prev => ({ ...prev, sdgScores: scores }));
    setStep('investment');
  }

  const handleSurveyComplete = useCallback(async (data: { riskPreference: RiskPreference; investmentExperience: string[]; investmentPeriod: string; }) => {
    const finalSurveyData = { ...surveyData, ...data };
    setSurveyData(finalSurveyData);
    setStep('loading');
    setError(null);

    try {
        const result = await getCompanyRecommendations(finalSurveyData.sdgScores, finalSurveyData.riskPreference!);
        if (result && result.recommended_companies) {
            setRecommendations(result.recommended_companies);
            setStep('dashboard');
        } else {
            throw new Error("결과를 받아오지 못했습니다.");
        }
    } catch (err) {
        setError("AI 모델 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setStep('investment'); // Or a dedicated error step
    }
  }, [surveyData]);


  const handleSelectCompany = (company: CompanyRecommendation) => {
    setSelectedCompany(company);
    // Go to video intro step first
    setStep('video-intro');
  };
  
  const handleVideoComplete = () => {
    setStep('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedCompany(null);
    setStep('dashboard');
  };

  const handleRestart = () => {
    setSurveyData({
      selectedSdgs: [],
      sdgScores: [],
      riskPreference: null,
      investmentExperience: [],
      investmentPeriod: null,
    });
    setRecommendations([]);
    setSelectedCompany(null);
    setError(null);
    setStep('start');
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return <StartScreen onStart={handleStart} />;
      case 'sdg-select':
        return <SdgSelection onNext={handleSdgSelectNext} />;
      case 'sdg-score':
        return <SdgSelection onNext={handleSdgScoreNext} selectedSdgsForScoring={surveyData.selectedSdgs} />;
      case 'investment':
        return <InvestmentSurvey onComplete={handleSurveyComplete} error={error} />;
      case 'loading':
        return <LoadingSpinner />;
      case 'dashboard':
        return <Dashboard recommendations={recommendations} surveyData={surveyData} onSelectCompany={handleSelectCompany} onRestart={handleRestart} />;
      case 'video-intro':
        return selectedCompany ? <CompanyIntroVideo company={selectedCompany} onComplete={handleVideoComplete} /> : <div/>;
      case 'detail':
        return selectedCompany ? <CompanyDetail company={selectedCompany} userSdgs={surveyData.selectedSdgs} onBack={handleBackToDashboard} /> : <div/>;
      default:
        return <StartScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {renderStep()}
    </div>
  );
}
