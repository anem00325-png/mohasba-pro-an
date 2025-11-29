import React from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isPro: boolean;
  isTrialActive: boolean;
  isOwner: boolean;
  userEmail: string;
  onLogout: () => void;
}

const NavLink: React.FC<{
    page: Page,
    activePage: Page,
    onNavigate: (page: Page) => void,
    children: React.ReactNode
}> = ({ page, activePage, onNavigate, children }) => {
    const isActive = activePage === page;
    const classes = `flex items-center w-full px-4 py-3 text-right rtl:text-right rounded-lg transition-colors duration-200 ${
        isActive
            ? 'bg-primary text-white'
            : 'text-dark-300 hover:bg-dark-700 hover:text-white'
    }`;
    return (
        <button onClick={() => onNavigate(page)} className={classes}>
            {children}
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isPro, isTrialActive, isOwner, userEmail, onLogout }) => {
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    return (
        <aside className="w-64 bg-dark-900 text-white flex flex-col p-4 space-y-2 rtl:border-l ltr:border-r border-dark-700">
            <div className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V5.25" />
                    <path d="M12 21a9 9 0 110-18 9 9 0 010 18z" stroke="none" fill="currentColor" opacity="0.1"/>
                </svg>
                <h1 className="text-xl font-bold">{t('header.title')}</h1>
            </div>

            <nav className="flex-grow space-y-2">
                <NavLink page="home" activePage={activePage} onNavigate={onNavigate}>
                    <span className="font-semibold">{t('nav.home')}</span>
                </NavLink>
                <NavLink page="accounting" activePage={activePage} onNavigate={onNavigate}>
                    <span className="font-semibold">{t('nav.accounting')}</span>
                    {!isPro && !isTrialActive && <span className="text-xs bg-danger text-white font-bold px-2 py-0.5 rounded-full mx-2">{t('nav.proTag')}</span>}
                    {!isPro && isTrialActive && <span className="text-xs bg-yellow-500 text-dark-900 font-bold px-2 py-0.5 rounded-full mx-2">{t('nav.trialTag')}</span>}
                </NavLink>
                <NavLink page="invoices" activePage={activePage} onNavigate={onNavigate}>
                    <span className="font-semibold">{t('nav.invoices')}</span>
                    {!isPro && !isTrialActive && <span className="text-xs bg-danger text-white font-bold px-2 py-0.5 rounded-full mx-2">{t('nav.proTag')}</span>}
                    {!isPro && isTrialActive && <span className="text-xs bg-yellow-500 text-dark-900 font-bold px-2 py-0.5 rounded-full mx-2">{t('nav.trialTag')}</span>}
                </NavLink>
                <NavLink page="pro-services" activePage={activePage} onNavigate={onNavigate}>
                     <span className="font-semibold">{t('nav.proServices')} ✨</span>
                </NavLink>
                {isOwner && (
                    <NavLink page="admin" activePage={activePage} onNavigate={onNavigate}>
                        <span className="font-semibold">{t('nav.admin')} 👑</span>
                    </NavLink>
                )}
            </nav>

            <div className="pt-4 border-t border-dark-700">
                 <div className="px-4 py-2 mb-2">
                    <p className="text-xs text-dark-400">{t('sidebar.loggedInAs')}</p>
                    <p className="text-sm font-medium truncate">{userEmail}</p>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="flex items-center justify-center w-full px-4 py-3 text-dark-300 hover:bg-dark-700 hover:text-white rounded-lg transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h-3.24m.208-6.88a18.022 18.022 0 01-3.243-5.62M18 10a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    <span className="font-semibold">{language === 'ar' ? 'English' : 'العربية'}</span>
                </button>

                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-3 text-dark-300 hover:bg-dark-700 hover:text-white rounded-lg transition-colors duration-200"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-semibold">{t('sidebar.logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;