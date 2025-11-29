import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductsTableProps {
  products: Product[];
  onSellProduct: (product: Product) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onSellProduct }) => {
  const { t, language } = useLanguage();
  const sortedProducts = [...products].sort((a, b) => b.id - a.id);
  const currency = language === 'ar' ? 'EGP' : 'USD';

  return (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">{t('productsTable.title')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-right rtl:text-right">
          <thead className="border-b-2 border-dark-700 text-dark-400 uppercase text-sm">
            <tr>
              <th className="p-3 font-semibold text-right rtl:text-right">{t('productsTable.product')}</th>
              <th className="p-3 font-semibold text-center">{t('productsTable.stock')}</th>
              <th className="p-3 font-semibold text-left rtl:text-left">{t('productsTable.price')}</th>
              <th className="p-3 font-semibold text-left rtl:text-left">{t('productsTable.action')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-dark-500">{t('productsTable.noProducts')}</td>
              </tr>
            ) : (
              sortedProducts.map((p) => (
                <tr key={p.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-dark-400 text-center">{p.stock}</td>
                  <td className="p-3 font-mono font-semibold text-left rtl:text-left text-dark-200">
                    {p.price.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}
                  </td>
                  <td className="p-3 text-left rtl:text-left">
                    <button
                      onClick={() => onSellProduct(p)}
                      disabled={p.stock === 0}
                      className="bg-secondary hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded-md transition duration-300 text-xs disabled:bg-dark-600 disabled:cursor-not-allowed"
                    >
                      {t('productsTable.sellButton')}
                    </button>
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

export default React.memo(ProductsTable);