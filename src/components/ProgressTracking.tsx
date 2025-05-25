import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, XAxis, Line } from 'recharts';

export const ProgressTracking: React.FC = () => {
  const [progressData, setProgressData] = useState([
    { date: '2023-01', emotional: 0, coping: 0, resilience: 0 },
    { date: '2023-02', emotional: 2, coping: 3, resilience: 1 },
    { date: '2023-03', emotional: 4, coping: 4, resilience: 3 }
  ]);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg text-neutral-900">Healing Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={progressData} width={600} height={300}>
          <XAxis dataKey="date" />
          <Line type="monotone" dataKey="emotional" stroke="#8884d8" name="Emotional Wellness" />
          <Line type="monotone" dataKey="coping" stroke="#82ca9d" name="Coping Strength" />
          <Line type="monotone" dataKey="resilience" stroke="#ffc658" name="Resilience" />
        </LineChart>
      </CardContent>
    </Card>
  );
};