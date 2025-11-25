
import React from 'react';
import type { SDG } from './types';

// Placeholder SVG icons - In a real app, these would be detailed icons for each goal.
const SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}><rect width="100" height="100" rx="10" fill="currentColor" /></svg>
);
const Goal1Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal3Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal4Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal5Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal6Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal7Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal8Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal9Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal10Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal11Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal12Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal13Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal14Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal15Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal16Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;
const Goal17Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SvgIcon {...props} />;


export const SDG_LIST: SDG[] = [
  { id: 1, code: "G01", title: "빈곤 종식", color: "#E5243B", icon: Goal1Icon },
  { id: 2, code: "G02", title: "기아 종식", color: "#DDA63A", icon: Goal2Icon },
  { id: 3, code: "G03", title: "건강과 웰빙", color: "#4C9F38", icon: Goal3Icon },
  { id: 4, code: "G04", title: "양질의 교육", color: "#C5192D", icon: Goal4Icon },
  { id: 5, code: "G05", title: "성평등", color: "#FF3A21", icon: Goal5Icon },
  { id: 6, code: "G06", title: "깨끗한 물과 위생", color: "#26BDE2", icon: Goal6Icon },
  { id: 7, code: "G07", title: "깨끗한 에너지", color: "#FCC30B", icon: Goal7Icon },
  { id: 8, code: "G08", title: "좋은 일자리와 경제 성장", color: "#A21942", icon: Goal8Icon },
  { id: 9, code: "G09", title: "산업, 혁신, 사회기반시설", color: "#FD6925", icon: Goal9Icon },
  { id: 10, code: "G10", title: "불평등 감소", color: "#DD1367", icon: Goal10Icon },
  { id: 11, code: "G11", title: "지속가능한 도시와 공동체", color: "#FD9D24", icon: Goal11Icon },
  { id: 12, code: "G12", title: "책임감 있는 소비와 생산", color: "#BF8B2E", icon: Goal12Icon },
  { id: 13, code: "G13", title: "기후변화 대응", color: "#3F7E44", icon: Goal13Icon },
  { id: 14, code: "G14", title: "해양 생태계 보존", color: "#0A97D9", icon: Goal14Icon },
  { id: 15, code: "G15", title: "육상 생태계 보존", color: "#56C02B", icon: Goal15Icon },
  { id: 16, code: "G16", title: "평화, 정의, 제도", color: "#00689D", icon: Goal16Icon },
  { id: 17, code: "G17", title: "지구촌 협력", color: "#19486A", icon: Goal17Icon },
];
