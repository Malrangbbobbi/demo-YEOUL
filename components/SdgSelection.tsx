
import React, { useState, useEffect } from 'react';
import SdgCard from './SdgCard';
import { SDG_LIST } from '../constants';
import type { SDG, SdgScore } from '../types';

interface SdgSelectionProps {
    onNext: (data: any) => void;
    selectedSdgsForScoring?: SDG[];
}

const SdgSelection: React.FC<SdgSelectionProps> = ({ onNext, selectedSdgsForScoring }) => {
  const [selectedSdgs, setSelectedSdgs] = useState<SDG[]>([]);
  const [scores, setScores] = useState<SdgScore[]>([]);

  // 화면이 '점수 부여' 단계로 전환될 때 scores 상태를 초기화합니다.
  useEffect(() => {
    if (selectedSdgsForScoring && selectedSdgsForScoring.length > 0) {
      setScores(selectedSdgsForScoring.map(sdg => ({ sdgId: sdg.id, score: 3 })));
    }
  }, [selectedSdgsForScoring]);

  const handleSdgClick = (sdg: SDG) => {
    setSelectedSdgs(prev => {
      if (prev.some(s => s.id === sdg.id)) {
        return prev.filter(s => s.id !== sdg.id);
      }
      if (prev.length < 3) {
        return [...prev, sdg];
      }
      return prev;
    });
  };

  const handleScoreChange = (sdgId: number, value: number) => {
    setScores(prev => prev.map(s => s.sdgId === sdgId ? { ...s, score: value } : s));
  };
  
  const isSdgSelected = (sdg: SDG) => selectedSdgs.some(s => s.id === sdg.id);

  if (selectedSdgsForScoring) {
    // Scoring phase
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">중요도 점수 부여</h2>
            <p className="text-center text-gray-600 mt-2 mb-8">선택하신 가치에 1점(덜 중요)부터 5점(매우 중요)까지 점수를 부여해주세요.</p>
            
            <div className="space-y-8">
            {selectedSdgsForScoring.map(sdg => {
                const currentScore = scores.find(s => s.sdgId === sdg.id)?.score || 3;
                return (
                <div key={sdg.id} className="p-4 rounded-lg border-2" style={{borderColor: sdg.color}}>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                        <div className="flex items-center space-x-4">
                            <sdg.icon className="w-12 h-12 flex-shrink-0" style={{ color: sdg.color }} />
                            <h3 className="font-bold text-lg md:w-32 break-keep">{sdg.title}</h3>
                        </div>
                        
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center gap-2 sm:gap-4">
                                {[1, 2, 3, 4, 5].map((score) => (
                                    <button
                                        key={score}
                                        type="button"
                                        onClick={() => handleScoreChange(sdg.id, score)}
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg transition-all duration-200 flex items-center justify-center border-2 cursor-pointer ${
                                            currentScore === score
                                                ? 'text-white border-transparent shadow-md scale-110'
                                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        style={{
                                            backgroundColor: currentScore === score ? sdg.color : undefined,
                                        }}
                                        aria-label={`${sdg.title} 점수 ${score}점`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                                <span>덜 중요</span>
                                <span>매우 중요</span>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
            
            <div className="mt-10 text-center">
                <button
                    onClick={() => onNext(scores)}
                    className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                    다음
                </button>
            </div>
        </div>
      </div>
    );
  }

  // Selection phase
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">가치관 선택 (SDGs)</h2>
        <p className="text-center text-gray-600 mt-2 mb-8">가장 중요하게 생각하는 가치 3가지를 선택해주세요. ({selectedSdgs.length}/3)</p>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {SDG_LIST.map(sdg => (
            <SdgCard 
              key={sdg.id}
              sdg={sdg}
              isSelected={isSdgSelected(sdg)}
              onClick={() => handleSdgClick(sdg)}
              disabled={selectedSdgs.length >= 3 && !isSdgSelected(sdg)}
            />
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <button
            onClick={() => onNext(selectedSdgs)}
            disabled={selectedSdgs.length !== 3}
            className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default SdgSelection;
