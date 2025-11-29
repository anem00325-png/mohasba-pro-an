import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationsBellProps {
    notifications: Notification[];
    onMarkAsRead: (id: string | number) => void;
    onMarkAllRead: () => void;
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ notifications, onMarkAsRead, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const toggleDropdown = () => setIsOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="relative text-dark-300 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-danger ring-2 ring-dark-800 text-white text-xs font-bold flex items-center justify-center" style={{fontSize: '10px'}}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 -left-32 rtl:-right-32 rtl:left-auto w-80 bg-dark-800 rounded-lg shadow-lg border border-dark-700 z-50 animate-fade-in-up">
          <div className="p-3 flex justify-between items-center border-b border-dark-700">
            <h4 className="font-bold">{t('notifications.title')}</h4>
            {unreadCount > 0 && <button onClick={onMarkAllRead} className="text-xs text-primary hover:underline">{t('notifications.markAllRead')}</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-4 text-dark-500">{t('notifications.noNotifications')}</p>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div key={n.id} onClick={() => onMarkAsRead(n.id)} className={`p-3 border-b border-dark-700 hover:bg-dark-700/50 cursor-pointer ${!n.read ? 'bg-blue-500/10' : ''}`}>
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-dark-100">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-dark-400">{n.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-2 text-center border-t border-dark-700">
            <button className="text-sm text-primary hover:underline w-full">{t('notifications.viewAll')}</button>
          </div>
        </div>
      )}
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationsBell;