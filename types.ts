// Fix: Import React types to resolve 'Cannot find namespace React' error.
import type * as React from 'react';

export interface SDG {
  id: number;
  code: string;
  title: string;
  color: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface SdgScore {
  sdgId: number;
  score: number;
}

export type RiskPreference = '안전형' | '중립형' | '공격형';

export interface SurveyData {
  selectedSdgs: SDG[];
  sdgScores: SdgScore[];
  riskPreference: RiskPreference | null;
  investmentExperience: string[];
  investmentPeriod: string | null;
}

export interface CompanyRecommendation {
  corp_name: string;
  corp_code: string;
  match_score: number;
  top_sdg: string;
  explanation: string;
  sdg_alignment: number[];
}

export interface ModelOutput {
  recommended_companies: CompanyRecommendation[];
}

export type AppStep = 'start' | 'sdg-select' | 'sdg-score' | 'investment' | 'loading' | 'dashboard' | 'detail';