import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onLogin: (email: string) => void;
  isOwnerEmail: (email: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isOwnerEmail }) => {
  const [email, setEmail] = useState('');
  const { t } = useLanguage();
  const isOwner = email.trim() ? isOwnerEmail(email) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-800 shadow-2xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center space-x-3 rtl:space-x-reverse">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V5.25" />
                    <path d="M12 21a9 9 0 110-18 9 9 0 010 18z" stroke="none" fill="currentColor" opacity="0.1"/>
                </svg>
                <h1 className="text-3xl font-bold text-white">{t('header.title')}</h1>
            </div>
            <p className="text-dark-400">{t('login.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">{t('login.emailLabel')}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                placeholder={t('login.emailPlaceholder')}
              />
            </div>

            {isOwner && (
              <p className="text-center text-xs text-yellow-400 -mt-4 animate-fade-in">
                {t('login.ownerWelcome')}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105"
              >
                {t('login.button')}
              </button>
            </div>
          </form>
           <p className="text-center text-xs text-dark-500 pt-4">
            {t('login.note')}
          </p>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;