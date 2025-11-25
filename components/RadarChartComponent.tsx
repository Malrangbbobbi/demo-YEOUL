
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SDG } from '../types';
import { SDG_LIST } from '../constants';

interface RadarChartComponentProps {
  companyAlignment: number[];
  userSdgs: SDG[];
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({ companyAlignment, userSdgs }) => {
  const userSdgIds = userSdgs.map(s => s.id);

  // Use only the selected SDGs for the chart
  const chartData = userSdgs.map(sdg => ({
    subject: sdg.title.split(' ')[0],
    company: companyAlignment[sdg.id - 1],
    user: 5, // User's preference is always max for the selected items
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
        <Radar name="기업 부합도" dataKey="company" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Radar name="나의 가치" dataKey="user" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
