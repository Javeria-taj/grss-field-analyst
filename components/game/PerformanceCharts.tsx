'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function PerformanceCharts({ telemetry }: { telemetry: any[] }) {
  if (!telemetry || telemetry.length === 0) return null;

  const data = telemetry.map(t => ({
    name: `Q${t.qIndex + 1}`,
    points: t.points,
    speed: Math.round(t.timeTaken * 10) / 10,
    correct: t.correct
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-sm" 
      style={{ width: '100%', height: 300, marginTop: 20 }}
    >
      <div className="font-orb" style={{ fontSize: '0.7rem', marginBottom: 15, color: 'var(--text2)' }}>
        MISSION TELEMETRY: POINTS PER QUESTION
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--text3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg2)', 
              borderColor: 'var(--border)', 
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text)'
            }} 
            itemStyle={{ color: 'var(--accent)' }}
          />
          <Bar dataKey="points" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.correct ? 'var(--accent2)' : 'var(--danger)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
