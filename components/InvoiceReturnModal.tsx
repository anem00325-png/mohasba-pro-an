import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoiceReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoices: Invoice[];
    onInvoiceSelect: (invoice: Invoice) => void;
}

const InvoiceReturnModal: React.FC<InvoiceReturnModalProps> = ({ isOpen, onClose, invoices, onInvoiceSelect }) => {
    const { t, language } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return invoices.filter(invoice => 
            invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(invoice.id).includes(searchTerm)
        ).slice(0, 5); // Limit results for performance
    }, [invoices, searchTerm]);

    const handleSelect = (invoice: Invoice) => {
        onInvoiceSelect(invoice);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div 
                className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-xl p-6 relative animate-fade-in-up flex flex-col max-h-[70vh]" 
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
                <h3 className="text-xl font-bold mb-4 text-center">{t('returnModal.title')}</h3>
                
                <div className="relative w-full mb-4">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('returnModal.searchPlaceholder')}
                        className="w-full bg-dark-700 border border-dark-600 rounded-md pl-10 pr-4 py-2.5 text-white focus:ring-primary focus:border-primary"
                        autoFocus
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-dark-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {searchTerm.trim() && filteredInvoices.length > 0 && (
                         <p className="text-sm text-dark-400 mb-2 text-center">{t('returnModal.found', { count: filteredInvoices.length })}</p>
                    )}
                    {searchTerm.trim() && filteredInvoices.length === 0 && (
                        <p className="text-center p-6 text-dark-500">{t('returnModal.noResults')}</p>
                    )}
                    <div className="space-y-2">
                        {filteredInvoices.map(invoice => (
                            <div 
                                key={invoice.id}
                                onClick={() => handleSelect(invoice)}
                                className="bg-dark-700 p-3 rounded-md hover:bg-primary/20 border border-transparent hover:border-primary/50 cursor-pointer transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">#{invoice.id} - {invoice.customerName}</p>
                                        <p className="text-xs text-dark-400">{invoice.date}</p>
                                    </div>
                                    <span className="text-sm text-secondary font-mono">
                                         {invoice.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
                                            .toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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

export default InvoiceReturnModal;