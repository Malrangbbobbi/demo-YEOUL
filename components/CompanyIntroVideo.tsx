import React, { useEffect, useState, useRef } from 'react';
import { generateCompanyVideo } from '../services/geminiService';
import type { CompanyRecommendation } from '../types';

interface CompanyIntroVideoProps {
  company: CompanyRecommendation;
  onComplete: () => void;
}

const loadingMessages = [
  "ESG 활동 시나리오를 작성하고 있습니다...",
  "AI 감독이 영상을 연출하고 있습니다...",
  "지속가능한 미래를 그리고 있습니다...",
  "Cinematic 렌더링을 진행 중입니다...",
  "곧 영상이 시작됩니다..."
];

const CompanyIntroVideo: React.FC<CompanyIntroVideoProps> = ({ company, onComplete }) => {
  const [status, setStatus] = useState<'checking-key' | 'generating' | 'playing' | 'error'>('checking-key');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cycle loading messages
  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Initial Check
  useEffect(() => {
    checkApiKeyAndStart();
  }, []);

  const checkApiKeyAndStart = async () => {
    try {
      // Check if user has selected a key (required for Veo)
      // We assume window.aistudio is available as per instructions
      // Using (window as any) to avoid conflict with global types that might declare aistudio with specific modifiers/types
      const aiStudio = (window as any).aistudio;
      
      let hasKey = false;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
         hasKey = await aiStudio.hasSelectedApiKey();
      }
      
      if (!hasKey) {
        // Wait for user to click the button in UI
        setStatus('checking-key');
      } else {
        startGeneration();
      }
    } catch (e) {
      console.error("Key check failed", e);
      // Fallback: try generating anyway, it might fail if env is missing
      startGeneration();
    }
  };

  const handleSelectKey = async () => {
    try {
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
        await aiStudio.openSelectKey();
      }
      // Assume success (race condition mitigation: proceed immediately)
      startGeneration();
    } catch (e) {
      console.error("Selection failed", e);
      setErrorMsg("API 키 선택 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const startGeneration = async () => {
    setStatus('generating');
    setErrorMsg(null);

    try {
      const url = await generateCompanyVideo(company.image_reference_sentence, company.corp_name);
      if (url) {
        setVideoUrl(url);
        setStatus('playing');
      } else {
        throw new Error("Video generation returned null");
      }
    } catch (e: any) {
      console.error("Video Generation Error", e);
      if (e.message && e.message.includes("Requested entity was not found")) {
         // Token issue potentially
         setErrorMsg("API 키 오류가 발생했습니다. 키를 다시 선택해주세요.");
         setStatus('checking-key');
      } else {
         // Generic error, maybe skip video
         console.warn("Skipping video due to error");
         onComplete();
      }
    }
  };

  if (status === 'checking-key') {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md text-center space-y-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Premium Video Feature
          </h2>
          <p className="text-gray-300">
            기업의 ESG 활동을 생생한 AI 비디오로 확인하시겠습니까?
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              * Veo 모델 사용을 위해 Paid API Key가 필요합니다.
            </span>
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSelectKey}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all transform hover:scale-105"
            >
              API Key 선택하고 영상 보기
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition-colors"
            >
              건너뛰기
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-blue-400">
              API 요금 정책 확인하기
            </a>
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
        </div>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center text-white">
        <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg')] bg-cover opacity-20 filter blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-8"></div>
          
          <h2 className="text-2xl font-light mb-2">{company.corp_name}</h2>
          <p className="text-xl font-medium animate-pulse text-blue-300">
            {loadingMessages[loadingMsgIndex]}
          </p>
          <p className="text-gray-500 text-sm mt-8 max-w-sm">
            Veo AI 모델이 시나리오에 맞춰 영상을 생성하고 있습니다. (약 1~2분 소요)
          </p>
          
          <button 
            onClick={onComplete}
            className="mt-12 text-gray-400 hover:text-white text-sm border border-gray-700 rounded-full px-4 py-2 hover:border-gray-500 transition-colors"
          >
            기다리지 않고 바로 상세 화면 보기
          </button>
        </div>
      </div>
    );
  }

  if (status === 'playing' && videoUrl) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <video 
          src={videoUrl} 
          autoPlay 
          controls 
          className="w-full h-full object-contain"
          onEnded={onComplete}
        />
        <button 
          onClick={onComplete}
          className="absolute top-8 right-8 bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black/80 transition-all backdrop-blur-sm border border-white/20"
        >
          상세 화면으로 이동 &rarr;
        </button>
      </div>
    );
  }

  return null;
};

export default CompanyIntroVideo;