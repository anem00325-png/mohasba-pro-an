import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PersonalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  result: string | null;
}

const PersonalAssistantModal: React.FC<PersonalAssistantModalProps> = ({ isOpen, onClose, onAnalyze, isLoading, result }) => {
  const { t } = useLanguage();

  const handleAnalyzeClick = () => {
    if (!isLoading) {
      onAnalyze();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-10">&times;</button>
        <h3 className="text-xl font-bold mb-4 text-center">{t('personalAssistant.modalTitle')}</h3>
        
        <div className="flex-grow overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 min-h-[250px] flex flex-col justify-center">
            {isLoading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-dark-300">{t('personalAssistant.loading')}</p>
              </div>
            ) : result ? (
              <div className="text-right rtl:text-right">
                <h4 className="font-bold text-lg mb-4 text-center">{t('personalAssistant.resultTitle')}</h4>
                <div className="bg-dark-900/50 p-4 rounded-md whitespace-pre-wrap text-dark-200 text-sm leading-relaxed">
                    {result || t('personalAssistant.noIssues')}
                </div>
              </div>
            ) : (
              <div className="text-center text-dark-400 space-y-4">
                <div className="text-4xl">🤖</div>
                <p>{t('personalAssistant.description')}</p>
              </div>
            )}
        </div>
        
        <div className="pt-4 mt-4 border-t border-dark-700">
             <button onClick={handleAnalyzeClick} disabled={isLoading} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md transition duration-300 disabled:bg-dark-600 disabled:cursor-not-allowed">
               {isLoading ? t('personalAssistant.loading') : (result ? t('projectAnalysis.tryAgain') : t('personalAssistant.button'))}
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PersonalAssistantModal;
