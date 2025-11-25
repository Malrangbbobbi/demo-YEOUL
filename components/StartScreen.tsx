
import React, { useState, useEffect } from 'react';
import { SDG_LIST } from '../constants';

const heroPhrases = [
  "당신의 가치가 세상을 바꾸는 투자로",
  "지속가능한 미래, 여울과 함께",
  "나의 신념에 맞는 기업을 찾다",
  "SDGs로 알아보는 나의 투자 성향",
  "의미 있는 투자의 첫 걸음"
];

const SDGIconBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => {
        const Sdg = SDG_LIST[i % 17];
        const size = Math.random() * 80 + 20;
        const animationDuration = Math.random() * 20 + 15;
        const animationDelay = Math.random() * 10;
        return (
          <Sdg.icon
            key={i}
            className="absolute text-gray-200/50"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `fade-float ${animationDuration}s ease-in-out ${animationDelay}s infinite`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fade-float {
          0%, 100% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};


const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % heroPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center bg-white overflow-hidden">
      <SDGIconBackground />
      <div className="relative z-10 flex flex-col items-center">
        <header className="mb-8 animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-bold text-blue-600">여울</h1>
          <p className="text-lg md:text-xl text-gray-600 mt-2">WEOL: WE Orient your Legacy</p>
        </header>

        <main className="mb-12 max-w-2xl">
          <div className="h-16 flex items-center justify-center mb-8 animate-fade-in">
             <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 transition-opacity duration-1000">
                {heroPhrases[phraseIndex]}
             </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left animate-fade-in-up">
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
              <h3 className="font-bold text-lg text-blue-600 mb-2">1. 가치관 선택</h3>
              <p className="text-gray-700">17개의 SDGs 중 당신이 중요하게 생각하는 가치 3가지를 선택하세요.</p>
            </div>
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
              <h3 className="font-bold text-lg text-blue-600 mb-2">2. 성향 분석</h3>
              <p className="text-gray-700">간단한 질문을 통해 당신의 투자 성향을 파악합니다.</p>
            </div>
            <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-200">
              <h3 className="font-bold text-lg text-blue-600 mb-2">3. 기업 추천</h3>
              <p className="text-gray-700">AI가 당신의 가치관과 성향에 맞는 기업 Top 3를 추천해 드립니다.</p>
            </div>
          </div>
        </main>

        <footer className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={onStart}
            className="px-12 py-4 bg-blue-600 text-white font-bold text-xl rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            여울 시작하기
          </button>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-in-out; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default StartScreen;
