import React from 'react';
import { Page, Notification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import NotificationsBell from './NotificationsBell';

interface HeaderProps {
  activePage: Page;
  notifications: Notification[];
  onMarkAsRead: (id: string | number) => void;
  onMarkAllRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, notifications, onMarkAsRead, onMarkAllRead }) => {
  const { t } = useLanguage();

  const pageTitles: Record<Page, string> = {
    home: t('nav.home'),
    accounting: t('nav.accounting'),
    invoices: t('nav.invoices'),
    'pro-services': t('nav.proServices'),
    admin: t('nav.admin'),
    login: 'Login',
    register: 'Register'
  };

  const title = pageTitles[activePage] || t('header.title');

  return (
    <header className="bg-dark-800 p-4 flex items-center justify-between rtl:border-b ltr:border-b border-dark-700">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="flex items-center space-x-4">
        <NotificationsBell 
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllRead={onMarkAllRead}
        />
      </div>
    </header>
  );
};

export default Header;