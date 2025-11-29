import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import LogoGeneratorModal from '../components/LogoGeneratorModal';
import PersonalAssistantModal from '../components/PersonalAssistantModal';
import ProjectAnalysisModal from '../components/ProjectAnalysisModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface ProServicesPageProps {
    isPro: boolean;
    isOwner: boolean;
    onUpgrade: () => void;
    onNavigateToAdmin: () => void;
    onAnalyzeProject: (description: string) => void;
    isAnalysisLoading: boolean;
    analysisResult: string | null;
    onClearAnalysisResult: () => void;
    onRunPersonalAssistant: () => void;
    isAssistantLoading: boolean;
    assistantResult: string | null;
    onClearAssistantResult: () => void;
}

const ProServicesPage: React.FC<ProServicesPageProps> = ({ 
    isPro, isOwner, onUpgrade, onNavigateToAdmin,
    onAnalyzeProject, isAnalysisLoading, analysisResult, onClearAnalysisResult,
    onRunPersonalAssistant, isAssistantLoading, assistantResult, onClearAssistantResult
}) => {
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const { t } = useLanguage();
    const { showToast } = useToast();

    const handleProtectedAction = (action: () => void) => {
        if (isPro || isOwner) {
            action();
        } else {
            showToast(t('proServices.proFeatureAlert'), 'info');
        }
    };

    const UpgradeCard: React.FC = () => (
      <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 md:col-span-2 lg:col-span-1">
        <div className="bg-white/20 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 10v4m-2-2h4M5 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H5zM3 17a2 2 0 002 2h14a2 2 0 002-2v-1H3v1z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t('proServices.upgrade.title')}</h3>
        <p className="text-indigo-200 mb-6 flex-grow">
            {t('proServices.upgrade.description')}
        </p>
        <button 
          onClick={onUpgrade}
          className="w-full bg-white hover:bg-indigo-100 text-indigo-600 font-bold py-2.5 px-4 rounded-md transition duration-300"
        >
          {`${t('proServices.upgrade.button')} - $5`}
        </button>
      </div>
    );
    
    const SubscribedCard: React.FC = () => (
        <div className="bg-dark-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
             <div className="bg-green-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{t('proServices.subscribed.title')}</h3>
             <p className="text-dark-400 flex-grow">{t('proServices.subscribed.description')}</p>
        </div>
    );

    const OwnerCard: React.FC = () => (
        <div className="bg-dark-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center md:col-span-2 lg:col-span-1 border-2 border-yellow-500/50">
             <div className="bg-yellow-500/20 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414M19.778 4.222l-1.414 1.414M6.364 19.778l-1.414 1.414M12 18a6 6 0 100-12 6 6 0 000 12z" />
                </svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">{t('proServices.owner.title')}</h3>
             <p className="text-dark-400 mb-6 flex-grow">{t('proServices.owner.description')}</p>
             <button 
                onClick={onNavigateToAdmin}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-dark-900 font-bold py-2.5 px-4 rounded-md transition duration-300"
            >
                {t('proServices.owner.button')}
            </button>
        </div>
    );

    const renderFirstCard = () => {
        if (isOwner) return <OwnerCard />;
        if (isPro) return <SubscribedCard />;
        return <UpgradeCard />;
    }


    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('proServices.mainTitle')}</h2>
                <p className="mt-4 text-lg text-dark-400">{t('proServices.mainSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderFirstCard()}
                
                <ServiceCard 
                    title={t('proServices.personalAssistant.title')}
                    description={t('proServices.personalAssistant.description')}
                    icon={
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    actionText={t('proServices.personalAssistant.button')}
                    onActionClick={() => handleProtectedAction(() => setIsAssistantModalOpen(true))}
                />

                <ServiceCard 
                    title={t('proServices.logoGenerator.title')}
                    description={t('proServices.logoGenerator.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.455-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.455-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
                        </svg>
                    }
                    actionText={t('proServices.logoGenerator.button')}
                    onActionClick={() => handleProtectedAction(() => setIsLogoModalOpen(true))}
                />

                <ServiceCard 
                    title={t('proServices.projectAnalysis.title')}
                    description={t('proServices.projectAnalysis.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    actionText={t('proServices.projectAnalysis.button')}
                    onActionClick={() => handleProtectedAction(() => setIsAnalysisModalOpen(true))}
                />

                <ServiceCard 
                    title={t('proServices.pdfReports.title')}
                    description={t('proServices.pdfReports.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                        </svg>
                    }
                    actionText={t('proServices.comingSoon')}
                    onActionClick={() => showToast(t('proServices.comingSoonAlert'), 'info')}
                    isComingSoon={true}
                />
                
                 <ServiceCard 
                    title={t('proServices.financialAlerts.title')}
                    description={t('proServices.financialAlerts.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    }
                    actionText={t('proServices.comingSoon')}
                    onActionClick={() => showToast(t('proServices.comingSoonAlert'), 'info')}
                    isComingSoon={true}
                />
                
                <ServiceCard 
                    title={t('proServices.marketingCourse.title')}
                    description={t('proServices.marketingCourse.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.375 3.375 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    }
                    actionText={t('proServices.comingSoon')}
                    onActionClick={() => showToast(t('proServices.comingSoonAlert'), 'info')}
                    isComingSoon={true}
                />
                
                <ServiceCard 
                    title={t('proServices.ecommerceStore.title')}
                    description={t('proServices.ecommerceStore.description')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.858-6.491a1 1 0 00-.98-1.13H6.188L5.25 3H3.75" />
                        </svg>
                    }
                    actionText={t('proServices.comingSoon')}
                    onActionClick={() => showToast(t('proServices.comingSoonAlert'), 'info')}
                    isComingSoon={true}
                />

            </div>

            <LogoGeneratorModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} />
            <PersonalAssistantModal 
                isOpen={isAssistantModalOpen}
                onClose={() => {
                    setIsAssistantModalOpen(false);
                    onClearAssistantResult();
                }}
                onAnalyze={onRunPersonalAssistant}
                isLoading={isAssistantLoading}
                result={assistantResult}
            />
            <ProjectAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => {
                    setIsAnalysisModalOpen(false);
                    onClearAnalysisResult();
                }}
                onAnalyze={onAnalyzeProject}
                isLoading={isAnalysisLoading}
                result={analysisResult}
            />
        </>
    );
}

export default ProServicesPage;