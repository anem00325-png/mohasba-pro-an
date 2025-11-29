import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface IncomeExpenseChartProps {
    data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t, language } = useLanguage();
  const currency = language === 'ar' ? 'EGP' : 'USD';

  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-700/80 backdrop-blur-sm p-3 rounded-md border border-dark-600 shadow-lg">
        <p className="label text-dark-200 font-bold">{`${label}`}</p>
        <p className="text-secondary">{`${t('chart.income')}: ${payload[0].value.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}`}</p>
        <p className="text-danger">{`${t('chart.expenses')}: ${payload[1].value.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}`}</p>
      </div>
    );
  }
  return null;
};

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg" style={{ height: '400px' }}>
      <h3 className="text-xl font-bold mb-4">{t('chart.title')}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value/1000}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} />
          <Legend wrapperStyle={{ direction: 'ltr' }} />
          <Bar dataKey="income" fill="#10b981" name={t('chart.income')} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" name={t('chart.expenses')} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(IncomeExpenseChart);