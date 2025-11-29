import React, { useState } from 'react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  limitReached: boolean;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, limitReached }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limitReached) return;
    if (!name || !price || !stock || parseFloat(price) <= 0 || parseInt(stock, 10) < 0) {
        showToast(t('errors.fillAllFields'), 'error');
        return;
    }
    onAddProduct({
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });
    setName('');
    setPrice('');
    setStock('');
  };

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold mb-4">{t('addProduct.title')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-dark-300 mb-1">{t('addProduct.name')}</label>
          <input
            type="text"
            id="productName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary disabled:opacity-50"
            placeholder={t('addProduct.namePlaceholder')}
            disabled={limitReached}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-dark-300 mb-1">{t('addProduct.price')}</label>
              <input
                type="number"
                id="price"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary disabled:opacity-50"
                placeholder="0.00"
                disabled={limitReached}
              />
            </div>
             <div>
              <label htmlFor="stock" className="block text-sm font-medium text-dark-300 mb-1">{t('addProduct.stock')}</label>
              <input
                type="number"
                id="stock"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary disabled:opacity-50"
                placeholder="0"
                disabled={limitReached}
              />
            </div>
        </div>
        
        {limitReached && (
            <div className="text-center p-3 bg-yellow-500/10 text-yellow-400 rounded-md text-sm">
                {t('addProduct.limitReached.line1')} <br/>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast(t('addProduct.limitReached.line2Alert'), 'info'); }} className="font-bold underline">{t('addProduct.limitReached.line2Link')}</a> {t('addProduct.limitReached.line2Text')}
            </div>
        )}

        <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md transition duration-300 disabled:bg-dark-600 disabled:cursor-not-allowed" disabled={limitReached}>
          {t('addProduct.button')}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;