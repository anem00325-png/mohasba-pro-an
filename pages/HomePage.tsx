import React from 'react';
import { Product, ChartData } from '../types';
import AddProductForm from '../components/AddProductForm';
import ProductsTable from '../components/ProductsTable';
import { useLanguage } from '../contexts/LanguageContext';

interface HomePageProps {
    products: Product[];
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onSellProduct: (product: Product) => void;
    isPro: boolean;
    isTrialActive: boolean;
    onNavigateToPro: () => void;
    daysLeft: number;
}

const AdBanner: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-dark-700/50 border border-dark-600 rounded-lg p-4 mb-8 flex items-center justify-between text-dark-300">
            <div>
                <p className="font-semibold text-sm text-white">{t('adBanner.title')}</p>
                <p className="text-xs">{t('adBanner.subtitle')}</p>
            </div>
            <button
                onClick={onNavigate}
                className="bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-md transition duration-300 whitespace-nowrap flex-shrink-0 ml-4 rtl:ml-0 rtl:mr-4"
            >
                {t('adBanner.button')}
            </button>
        </div>
    );
};

const TrialBanner: React.FC<{daysLeft: number, onNavigate: () => void}> = ({daysLeft, onNavigate}) => {
    const { t } = useLanguage();
    return (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-4 rounded-lg mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="font-semibold">{t('homePage.trial.text', { days: daysLeft })}</p>
                    <p className="text-sm text-blue-400">{t('homePage.trial.subtitle')}</p>
                </div>
                 <button
                    onClick={onNavigate}
                    className="bg-primary hover:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md transition duration-300 whitespace-nowrap flex-shrink-0"
                >
                    {t('adBanner.button')}
                </button>
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ products, onAddProduct, onSellProduct, isPro, isTrialActive, onNavigateToPro, daysLeft }) => {
    const isFreeTier = !isPro && !isTrialActive;
    const limitReached = isFreeTier && products.length >= 7;

    return (
        <div className="space-y-8">
            {isFreeTier && <AdBanner onNavigate={onNavigateToPro} />}
            {isTrialActive && <TrialBanner daysLeft={daysLeft} onNavigate={onNavigateToPro} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ProductsTable products={products} onSellProduct={onSellProduct} />
                </div>
                <div>
                    <AddProductForm onAddProduct={onAddProduct} limitReached={limitReached} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;