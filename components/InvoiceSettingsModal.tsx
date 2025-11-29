import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { InvoiceSettings } from '../types';

interface InvoiceSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: InvoiceSettings;
    setSettings: (settings: InvoiceSettings) => void;
    onMergeCustomers: () => string;
}

type SettingsTab = 'branding' | 'company' | 'dataTools';

const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({ isOpen, onClose, settings, setSettings, onMergeCustomers }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_SIZE_MB = 1;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
    const [localSettings, setLocalSettings] = useState<InvoiceSettings>(settings);

    useEffect(() => {
        if(isOpen) {
            setLocalSettings(settings);
            setActiveTab('branding'); // Reset to first tab on open
        }
    }, [isOpen, settings]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_SIZE_BYTES) {
                showToast(t('branding.logoSizeError', { size: MAX_SIZE_MB }), 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSettings = { ...localSettings, logo: reader.result as string };
                setLocalSettings(newSettings);
                setSettings(newSettings); // update immediately for logo
                showToast(t('branding.uploadLogo'), 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleRemoveLogo = () => {
        const newSettings = { ...localSettings, logo: null };
        setLocalSettings(newSettings);
        setSettings(newSettings); // update immediately for logo
        showToast(t('branding.removeLogo'), 'info');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({...prev, [name]: value}));
    };

    const handleSaveChanges = () => {
        setSettings(localSettings);
        showToast(t('toast.settingsSaved'), 'success');
        onClose();
    };

    const handleMerge = () => {
        if (window.confirm(t('settingsModal.merge.confirm'))) {
            const resultMessage = onMergeCustomers();
            showToast(resultMessage, 'success');
        }
    }

    if (!isOpen) return null;
    
    const renderBrandingTab = () => (
        <div className="flex flex-col items-center gap-6 p-4">
            <h4 className="text-lg font-bold">{t('branding.title')}</h4>
            <p className="text-dark-400 -mt-4 text-center text-sm">{t('branding.description')}</p>
            <div className="w-40 h-40 bg-dark-700 rounded-md flex items-center justify-center overflow-hidden border border-dark-600">
                {localSettings.logo ? (
                    <img src={localSettings.logo} alt={t('branding.logoPreview')} className="max-w-full max-h-full object-contain" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                />
                <button onClick={handleUploadClick} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                    {localSettings.logo ? t('branding.changeLogo') : t('branding.uploadLogo')}
                </button>
                {localSettings.logo && (
                     <button onClick={handleRemoveLogo} className="bg-dark-600 hover:bg-dark-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                        {t('branding.removeLogo')}
                    </button>
                )}
            </div>
        </div>
    );
    
    const renderCompanyInfoTab = () => (
         <div className="flex flex-col gap-4 p-4">
            <h4 className="text-lg font-bold">{t('settingsModal.company.title')}</h4>
            <p className="text-dark-400 -mt-4 text-sm">{t('settingsModal.company.description')}</p>
             <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-dark-300 mb-1">{t('settingsModal.company.name')}</label>
                <input type="text" id="companyName" name="companyName" value={localSettings.companyName} onChange={handleInputChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label htmlFor="companyAddress" className="block text-sm font-medium text-dark-300 mb-1">{t('settingsModal.company.address')}</label>
                <input type="text" id="companyAddress" name="companyAddress" value={localSettings.companyAddress} onChange={handleInputChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div>
                <label htmlFor="companyEmail" className="block text-sm font-medium text-dark-300 mb-1">{t('settingsModal.company.email')}</label>
                <input type="email" id="companyEmail" name="companyEmail" value={localSettings.companyEmail} onChange={handleInputChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
                />
              </div>
        </div>
    );
    
    const renderDataToolsTab = () => (
        <div className="flex flex-col items-center gap-6 p-4 text-center">
            <h4 className="text-lg font-bold">{t('settingsModal.merge.title')}</h4>
            <p className="text-dark-400 -mt-4 text-sm max-w-md">{t('settingsModal.merge.description')}</p>
            <button
                onClick={handleMerge}
                className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-md transition duration-300"
            >
                {t('settingsModal.merge.button')}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-2xl relative animate-fade-in-up flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
                <h3 className="text-xl font-bold mt-4 mb-2 text-center">{t('settingsModal.title')}</h3>
                
                <div className="border-b border-dark-700 px-6">
                    <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                        <button onClick={() => setActiveTab('branding')} className={`${activeTab === 'branding' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('settingsModal.tabs.branding')}</button>
                        <button onClick={() => setActiveTab('company')} className={`${activeTab === 'company' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('settingsModal.tabs.company')}</button>
                        <button onClick={() => setActiveTab('dataTools')} className={`${activeTab === 'dataTools' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('settingsModal.tabs.dataTools')}</button>
                    </nav>
                </div>

                <div className="p-6 flex-grow min-h-[300px]">
                    {activeTab === 'branding' && renderBrandingTab()}
                    {activeTab === 'company' && renderCompanyInfoTab()}
                    {activeTab === 'dataTools' && renderDataToolsTab()}
                </div>

                <div className="p-4 bg-dark-900/50 border-t border-dark-700 flex justify-end">
                     <button onClick={handleSaveChanges} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md transition duration-300">
                        {t('settingsModal.saveButton')}
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

export default InvoiceSettingsModal;