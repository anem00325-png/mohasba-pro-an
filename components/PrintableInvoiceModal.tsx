import React from 'react';
import { Invoice, InvoiceStatus, Product, InvoiceSettings } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  products: Product[];
  invoiceSettings: InvoiceSettings;
}

const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({ isOpen, onClose, invoice, products, invoiceSettings }) => {
  const { t, language } = useLanguage();
  const currency = language === 'ar' ? 'EGP' : 'USD';

  if (!isOpen) return null;

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return t('invoices.status.paid');
      case InvoiceStatus.UNPAID: return t('invoices.status.unpaid');
      case InvoiceStatus.OVERDUE: return t('invoices.status.overdue');
    }
  };

  const grandTotal = invoice.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 print:hidden" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-4xl relative animate-fade-in-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-4 border-b border-dark-700 flex justify-between items-center">
             <h3 className="text-lg font-bold">{t('print.invoiceTitle')}</h3>
             <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                    {t('print.printButton')}
                </button>
                 <button onClick={() => window.print()} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                    {t('print.exportPdfButton')}
                </button>
                <button onClick={onClose} className="text-dark-400 hover:text-white text-2xl">&times;</button>
             </div>
        </div>

        <div className="overflow-y-auto p-4">
            <div id="invoice-to-print" className="bg-white text-black p-10 rounded-md min-h-[70vh] font-sans">
                {/* Header */}
                <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {invoiceSettings.logo ? (
                             <img src={invoiceSettings.logo} alt="Company Logo" className="h-12 w-auto max-w-[150px] object-contain" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75V5.25" />
                                <path d="M12 21a9 9 0 110-18 9 9 0 010 18z" stroke="none" fill="currentColor" opacity="0.1"/>
                            </svg>
                        )}

                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{invoiceSettings.companyName || t('header.title')}</h1>
                            <p className="text-gray-500 text-sm">{invoiceSettings.companyAddress}</p>
                            <p className="text-gray-500 text-sm">{invoiceSettings.companyEmail}</p>
                        </div>
                    </div>
                    <div className="text-right rtl:text-left">
                        <h2 className="text-3xl uppercase font-bold text-gray-700">{t('print.invoiceTitle')}</h2>
                        <p className="text-gray-500 mt-2">{t('print.invoice')} {invoice.id}</p>
                        <p className="text-gray-500">{t('print.date')}: {invoice.date}</p>
                    </div>
                </header>

                {/* Client Info */}
                <section className="grid grid-cols-2 gap-8 my-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('print.clientInfoTitle')}</h3>
                        <p className="text-lg font-bold text-gray-800">{invoice.customerName}</p>
                        {invoice.customerPhone && <p className="text-gray-600">{t('print.phone')}: {invoice.customerPhone}</p>}
                    </div>
                    <div className="text-right rtl:text-left">
                         <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('print.dueDate')}</h3>
                         <p className="text-lg font-bold text-gray-800">{invoice.date}</p>
                    </div>
                </section>

                {/* Items Table */}
                <section className="mb-8">
                  <table className="w-full text-left rtl:text-right">
                      <thead>
                          <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                              <th className="p-3 font-semibold w-12 text-center">{t('print.itemNumber')}</th>
                              <th className="p-3 font-semibold">{t('print.item')}</th>
                              <th className="p-3 font-semibold text-center">{t('print.quantity')}</th>
                              <th className="p-3 font-semibold text-right rtl:text-left">{t('print.price')}</th>
                              <th className="p-3 font-semibold text-right rtl:text-left">{t('print.total')}</th>
                          </tr>
                      </thead>
                      <tbody className="text-gray-700">
                          {invoice.items.map((item, index) => {
                              const product = products.find(p => p.id === item.productId);
                              return (
                                  <tr key={item.productId} className="border-b border-gray-200">
                                      <td className="p-3 text-center">{index + 1}</td>
                                      <td className="p-3 font-medium">{product?.name || `Product #${item.productId}`}</td>
                                      <td className="p-3 text-center">{item.quantity}</td>
                                      <td className="p-3 text-right rtl:text-left">{item.priceAtPurchase.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}</td>
                                      <td className="p-3 text-right rtl:text-left font-semibold">{(item.priceAtPurchase * item.quantity).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
                </section>
                
                {/* Summary */}
                <section className="flex justify-end rtl:justify-start mb-8">
                    <div className="w-full max-w-xs text-gray-700">
                        <div className="flex justify-between py-2 border-b">
                            <span>{t('print.subtotal')}</span>
                            <span>{grandTotal.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-lg bg-gray-100 px-2 rounded-md">
                            <span>{t('print.grandTotal')}</span>
                            <span>{grandTotal.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}</span>
                        </div>
                    </div>
                </section>
                
                {/* Footer/Notes */}
                <footer className="border-t-2 border-gray-200 pt-6 text-center text-gray-500 text-sm">
                    <h4 className="font-semibold mb-2">{t('print.notesTitle')}</h4>
                    <p>{t('print.notesContent')}</p>
                </footer>
            </div>
        </div>
      </div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #invoice-to-print, #invoice-to-print * {
                visibility: visible;
            }
            #invoice-to-print {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                padding: 20px;
                margin: 0;
                border-radius: 0;
                box-shadow: none;
                border: none;
            }
            .print\\:hidden {
                display: none;
            }
        }
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

export default PrintableInvoiceModal;