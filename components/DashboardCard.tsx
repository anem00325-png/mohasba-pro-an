import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg flex items-center space-x-4 rtl:space-x-reverse">
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-dark-400">{title}</p>
        <p className="text-2xl font-bold text-left rtl:text-right">{value}</p>
      </div>
    </div>
  );
};

export default React.memo(DashboardCard);