import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardCard from '../components/DashboardCard';

interface AdminPageProps {
  onClearData: (type: 'transactions' | 'products' | 'invoices') => void;
  onAppReset: () => void;
}

// Simulated data for demonstration
interface AdminUser {
    id: number;
    email: string;
    isPro: boolean;
    joinDate: string;
}

const initialUsers: AdminUser[] = [
    { id: 1, email: 'user1@example.com', isPro: true, joinDate: '2023-10-15' },
    { id: 2, email: 'user2@example.com', isPro: false, joinDate: '2023-11-01' },
    { id: 3, email: 'user3@example.com', isPro: false, joinDate: '2023-11-05' },
    { id: 4, email: 'user4@example.com', isPro: true, joinDate: '2023-11-20' },
    { id: 5, email: 'user5@example.com', isPro: false, joinDate: '2023-12-02' },
];

const recentPayments = [
    { id: 'txn_1', email: 'user1@example.com', amount: 5, date: '2023-11-15' },
    { id: 'txn_2', email: 'user4@example.com', amount: 5, date: '2023-11-20' },
    { id: 'txn_3', email: 'newpro@example.com', amount: 5, date: '2023-12-01' },
];

const AdminPage: React.FC<AdminPageProps> = ({ onClearData, onAppReset }) => {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);

    const handleClearTransactions = () => {
        if (confirm(t('admin.clearTransactionsConfirm'))) {
            onClearData('transactions');
        }
    }
    
    const handleClearProducts = () => {
        if (confirm(t('admin.clearProductsConfirm'))) {
            onClearData('products');
        }
    }

    const handleTogglePro = (userId: number) => {
        setUsers(users.map(u => u.id === userId ? { ...u, isPro: !u.isPro } : u));
    }

    const handleDeleteUser = (userId: number) => {
        if (confirm(t('admin.users.deleteConfirm'))) {
            setUsers(users.filter(u => u.id !== userId));
        }
    }

    const proSubscribers = users.filter(u => u.isPro).length;
    const estimatedMRR = proSubscribers * 5;

    const formatCurrency = (amount: number) => {
        const currency = 'USD'; // Admin panel uses USD for consistency
        return amount.toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
    };

    return (
        <div className="space-y-8">
            <div className="bg-dark-800 rounded-lg p-6 shadow-lg border-l-4 border-yellow-500">
                <h2 className="text-2xl font-bold text-white">{t('admin.title')} 👑</h2>
                <p className="text-dark-400 mt-1">{t('admin.subtitle')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <DashboardCard 
                    title={t('admin.stats.totalUsers')}
                    value={users.length.toString()} 
                    colorClass="bg-blue-500/20"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                 <DashboardCard 
                    title={t('admin.stats.proSubscribers')}
                    value={proSubscribers.toString()} 
                    colorClass="bg-green-500/20"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                 <DashboardCard 
                    title={t('admin.stats.mrr')}
                    value={formatCurrency(estimatedMRR)} 
                    colorClass="bg-indigo-500/20"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management */}
                <div className="lg:col-span-2 bg-dark-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{t('admin.users.title')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-dark-300">
                            <thead className="text-xs text-dark-400 uppercase bg-dark-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('admin.users.user')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.users.status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('admin.users.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                                        <td className="px-6 py-4 font-medium text-dark-100 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isPro ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {user.isPro ? t('admin.users.pro') : t('admin.users.free')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 rtl:space-x-reverse whitespace-nowrap">
                                            <button onClick={() => handleTogglePro(user.id)} className={`font-medium text-xs py-1 px-2 rounded ${user.isPro ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                                {user.isPro ? t('admin.users.revokePro') : t('admin.users.makePro')}
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-xs py-1 px-2 rounded bg-red-600 hover:bg-red-700 text-white">{t('admin.users.delete')}</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* App Settings */}
                <div className="bg-dark-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{t('admin.dataManagement.title')}</h3>
                    <p className="text-dark-400 mb-6 text-sm">{t('admin.dataManagement.description')}</p>
                    <div className="space-y-4">
                        <button onClick={handleClearTransactions} className="w-full bg-danger/80 hover:bg-danger text-white font-bold py-2.5 px-4 rounded-md transition duration-300">{t('admin.clearTransactions')}</button>
                        <button onClick={handleClearProducts} className="w-full bg-danger/80 hover:bg-danger text-white font-bold py-2.5 px-4 rounded-md transition duration-300">{t('admin.clearProducts')}</button>
                        <button onClick={onAppReset} className="w-full bg-yellow-500/80 hover:bg-yellow-500 text-dark-900 font-bold py-2.5 px-4 rounded-md transition duration-300">{t('admin.appReset')}</button>
                    </div>
                </div>
            </div>

             {/* Recent Payments */}
            <div className="bg-dark-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">{t('admin.payments.title')}</h3>
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left rtl:text-right text-dark-300">
                        <thead className="text-xs text-dark-400 uppercase bg-dark-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('admin.payments.user')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payments.amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('admin.payments.date')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.map(payment => (
                                <tr key={payment.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                                    <td className="px-6 py-4 font-medium text-dark-100 whitespace-nowrap">{payment.email}</td>
                                    <td className="px-6 py-4 font-mono text-secondary">{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4">{payment.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminPage;
