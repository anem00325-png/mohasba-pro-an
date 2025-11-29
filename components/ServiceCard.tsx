
import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onActionClick: () => void;
  isComingSoon?: boolean;
}

// FIX: Set default for isComingSoon to false
const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, actionText, onActionClick, isComingSoon = false }) => {
  return (
    <div className="bg-dark-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
      <div className="bg-dark-700 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-dark-400 mb-6 flex-grow">{description}</p>
      <button 
        onClick={onActionClick}
        className={`w-full font-bold py-2.5 px-4 rounded-md transition duration-300 ${
          isComingSoon 
            ? 'bg-dark-600 cursor-not-allowed text-dark-400' 
            : 'bg-primary hover:bg-blue-600 text-white'
        }`}
        disabled={isComingSoon}
      >
        {actionText}
      </button>
    </div>
  );
};

export default ServiceCard;
