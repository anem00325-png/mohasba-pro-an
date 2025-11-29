
import React from 'react';
import DashboardCard from './DashboardCard';
import { useLanguage } from '../contexts/LanguageContext';

interface PayrollSummaryProps {
  totalEmployees: number;
  monthlyPayroll: number;
}

const PayrollSummary: React.FC<PayrollSummaryProps> = ({ totalEmployees, monthlyPayroll }) => {
  const { t, language } = useLanguage();
  
  const formatCurrency = (amount: number) => {
    const currency = language === 'ar' ? 'EGP' : 'USD';
    return amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard 
        title={t('dashboard.totalEmployees')}
        value={totalEmployees.toString()} 
        colorClass="bg-blue-500/20"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />
      <DashboardCard 
        title={t('dashboard.monthlyPayroll')}
        value={formatCurrency(monthlyPayroll)} 
        colorClass="bg-indigo-500/20"
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
      />
    </div>
  );
};

export default PayrollSummary;
