import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirmSell: (product: Product, customerName: string, customerPhone: string) => void;
}

const SellProductModal: React.FC<SellProductModalProps> = ({ isOpen, onClose, product, onConfirmSell }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      showToast(t('errors.fillAllFields'), 'error');
      return;
    }
    onConfirmSell(product, customerName, customerPhone);
    setCustomerName('');
    setCustomerPhone('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-md p-6 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
        <h3 className="text-xl font-bold mb-6 text-center">{t('sellModal.title', { name: product.name })}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-dark-300 mb-1">{t('sellModal.customerName')}</label>
            <input
              type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
              placeholder={t('invoices.modal.customerNamePlaceholder')} required
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-dark-300 mb-1">{t('sellModal.customerPhone')}</label>
            <input
              type="tel" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
              placeholder={t('invoices.modal.customerPhonePlaceholder')}
            />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md transition duration-300">
              {t('sellModal.confirmButton')}
            </button>
          </div>
        </form>
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

export default SellProductModal;