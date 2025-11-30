
import React, { useEffect, useState } from 'react';
import { generateCompanyVideo } from '../services/geminiService';
import type { CompanyRecommendation } from '../types';

interface CompanyIntroVideoProps {
  company: CompanyRecommendation;
  onComplete: () => void;
}

const loadingMessages = [
  "ESG 활동 시나리오를 작성하고 있습니다...",
  "AI 감독이 영상을 연출하고 있습니다...",
  "지속가능한 미래를 렌더링 중입니다...",
  "곧 영상이 시작됩니다..."
];

const CompanyIntroVideo: React.FC<CompanyIntroVideoProps> = ({ company, onComplete }) => {
  const [status, setStatus] = useState<'generating' | 'playing'>('generating');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Cycle loading messages
  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Start immediately on mount
  useEffect(() => {
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setStatus('generating');

    try {
      // API Key is assumed to be provided via process.env.API_KEY as per user instruction
      const url = await generateCompanyVideo(company.image_reference_sentence, company.corp_name);
      if (url) {
        setVideoUrl(url);
        setStatus('playing');
      } else {
        // If null returned (e.g. no key found in env), skip
        console.warn("No video URL returned, skipping.");
        onComplete();
      }
    } catch (e: any) {
      console.error("Video Generation Error", e);
      // On error, skip immediately to detail view so user isn't stuck
      onComplete();
    }
  };

  // Common Loading Background
  const renderBackground = () => (
    <div className="absolute inset-0 bg-black">
         <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover opacity-30 filter blur-sm animate-pulse"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
    </div>
  );

  if (status === 'generating') {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center text-white">
        {renderBackground()}
        <div className="relative z-10 flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
          
          <h2 className="text-3xl font-light mb-3 tracking-wide">{company.corp_name}</h2>
          <p className="text-xl font-medium animate-pulse text-blue-300 h-8">
            {loadingMessages[loadingMsgIndex]}
          </p>
          <p className="text-gray-500 text-sm mt-8 max-w-sm">
            Veo AI가 기업의 ESG 활동을 영상화하고 있습니다.
          </p>
          
          <button 
            onClick={onComplete}
            className="mt-12 text-gray-500 hover:text-white text-xs border border-gray-800 hover:border-gray-500 rounded-full px-4 py-2 transition-all"
          >
            기다리지 않고 건너뛰기
          </button>
        </div>
      </div>
    );
  }

  if (status === 'playing' && videoUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-fade-in">
        <video 
          src={videoUrl} 
          autoPlay 
          controls 
          className="w-full h-full object-contain"
          onEnded={onComplete}
        />
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 bg-black/50 hover:bg-black/80 text-white px-5 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 group"
        >
          <span>상세 화면으로 이동</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    );
  }

  return null;
};

export default CompanyIntroVideo;
