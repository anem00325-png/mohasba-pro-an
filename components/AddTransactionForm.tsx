import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || parseFloat(amount) <= 0) {
        showToast(t('errors.fillAllFields'), 'error');
        return;
    }
    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      date,
    });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">{t('addTransaction.title')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-1">{t('addTransaction.description')}</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
            placeholder={t('addTransaction.descriptionPlaceholder')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-dark-300 mb-1">{t('addTransaction.amount')}</label>
              <input
                type="number"
                id="amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
                placeholder="0.00"
              />
            </div>
             <div>
              <label htmlFor="date" className="block text-sm font-medium text-dark-300 mb-1">{t('addTransaction.date')}</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary [color-scheme:dark]"
              />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1">{t('addTransaction.type')}</label>
          <div className="flex space-x-4 rtl:space-x-reverse bg-dark-700 p-1 rounded-md">
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-1/2 p-2 rounded-md text-sm transition-colors ${type === TransactionType.INCOME ? 'bg-secondary text-white' : 'text-dark-300 hover:bg-dark-600'}`}>
              {t('addTransaction.income')}
            </button>
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-1/2 p-2 rounded-md text-sm transition-colors ${type === TransactionType.EXPENSE ? 'bg-danger text-white' : 'text-dark-300 hover:bg-dark-600'}`}>
              {t('addTransaction.expense')}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md transition duration-300">
          {t('addTransaction.button')}
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;