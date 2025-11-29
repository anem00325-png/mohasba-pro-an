import React from 'react';
import { Transaction, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionsTableProps {
  transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const { t, language } = useLanguage();
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currency = language === 'ar' ? 'EGP' : 'USD';

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">{t('transactionsTable.title')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-right rtl:text-right">
          <thead className="border-b-2 border-dark-700 text-dark-400 uppercase text-sm">
            <tr>
              <th className="p-3 font-semibold text-right rtl:text-right">{t('transactionsTable.description')}</th>
              <th className="p-3 font-semibold text-center">{t('transactionsTable.type')}</th>
              <th className="p-3 font-semibold text-center">{t('transactionsTable.date')}</th>
              <th className="p-3 font-semibold text-left rtl:text-left">{t('transactionsTable.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-dark-500">{t('transactionsTable.noTransactions')}</td>
              </tr>
            ) : (
              sortedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="p-3 font-medium">{tx.description}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tx.type === TransactionType.INCOME ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === TransactionType.INCOME ? t('addTransaction.income') : t('addTransaction.expense')}
                    </span>
                  </td>
                  <td className="p-3 text-dark-400 text-center">{tx.date}</td>
                  <td className={`p-3 font-mono font-semibold text-left rtl:text-left ${
                    tx.type === TransactionType.INCOME ? 'text-secondary' : 'text-danger'
                  }`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}
                    {tx.amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TransactionsTable);