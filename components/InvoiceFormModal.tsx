import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, InvoiceStatus, InvoiceItem, Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  invoiceToEdit: Invoice | null;
  products: Product[];
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, onAddInvoice, onUpdateInvoice, invoiceToEdit, products }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.UNPAID);
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);

  const availableProducts = useMemo(() => {
    const itemProductIds = new Set(items.map(item => item.productId));
    return products.filter(p => !itemProductIds.has(p.id));
  }, [products, items]);

  useEffect(() => {
    if (invoiceToEdit) {
      setCustomerName(invoiceToEdit.customerName);
      setCustomerPhone(invoiceToEdit.customerPhone);
      setDate(invoiceToEdit.date);
      setStatus(invoiceToEdit.status);
      setItems(invoiceToEdit.items);
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus(InvoiceStatus.UNPAID);
      setItems([]);
    }
  }, [invoiceToEdit, isOpen]);

  const handleAddItem = () => {
    if (!selectedProductId || currentQuantity <= 0) {
        showToast(t('errors.fillAllFields'), 'error');
        return;
    }
    const product = products.find(p => p.id === parseInt(selectedProductId, 10));
    if (!product || product.stock < currentQuantity) {
        showToast(t('errors.notEnoughStock'), 'error');
        return;
    }

    const newItem: InvoiceItem = {
        productId: product.id,
        quantity: currentQuantity,
        priceAtPurchase: product.price,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedProductId('');
    setCurrentQuantity(1);
  };
  
  const handleRemoveItem = (productId: number) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => total + (item.priceAtPurchase * item.quantity), 0);
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !date || items.length === 0) {
      showToast(t('errors.fillAllFields'), 'error');
      return;
    }
    
    const invoiceData = {
      customerName,
      customerPhone,
      date,
      status,
      items,
    };

    if (invoiceToEdit) {
      onUpdateInvoice({ ...invoiceData, id: invoiceToEdit.id, lastModified: new Date().toISOString() });
    } else {
      onAddInvoice(invoiceData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in-up flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
        <h3 className="text-xl font-bold mb-6 text-center">{invoiceToEdit ? t('invoices.modal.editTitle') : t('invoices.modal.addTitle')}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 flex-grow">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.customerNameLabel')}</label>
                <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white" placeholder={t('invoices.modal.customerNamePlaceholder')} required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.customerPhoneLabel')}</label>
                <input type="text" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white" placeholder={t('invoices.modal.customerPhonePlaceholder')}
                />
              </div>
          </div>

          {/* Item Selection */}
          <div className="pt-4 border-t border-dark-700">
             <h4 className="text-lg font-semibold mb-2">{t('invoices.modal.productsTitle')}</h4>
             <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label htmlFor="product" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.productLabel')}</label>
                    <select id="product" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                         className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white">
                         <option value="">{t('invoices.modal.selectProduct')}</option>
                         {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock} {t('addProduct.stock')})</option>)}
                    </select>
                </div>
                <div className="w-24">
                     <label htmlFor="quantity" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.quantityLabel')}</label>
                     <input type="number" id="quantity" min="1" value={currentQuantity} onChange={e => setCurrentQuantity(parseInt(e.target.value, 10))}
                        className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
                     />
                </div>
                <button type="button" onClick={handleAddItem} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md h-10">
                    {t('invoices.modal.addProductButton')}
                </button>
             </div>
          </div>
          
          {/* Item List */}
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-dark-900/50 rounded-md">
            {items.length === 0 ? <p className="text-center text-sm text-dark-500">{t('invoices.modal.noItems')}</p> : items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                    <div key={item.productId} className="flex justify-between items-center bg-dark-700 p-2 rounded">
                        <div>
                            <p className="font-semibold">{product?.name}</p>
                            <p className="text-xs text-dark-400">{item.quantity} x {item.priceAtPurchase.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <p className="font-mono text-secondary">{(item.quantity * item.priceAtPurchase).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}</p>
                           <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-400">&times;</button>
                        </div>
                    </div>
                )
            })}
          </div>

          {/* Invoice Details */}
          <div className="pt-4 border-t border-dark-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.dateLabel')}</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white [color-scheme:dark]" required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-dark-300 mb-1">{t('invoices.modal.statusLabel')}</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white"
              >
                  <option value={InvoiceStatus.UNPAID}>{t('invoices.status.unpaid')}</option>
                  <option value={InvoiceStatus.PAID}>{t('invoices.status.paid')}</option>
                  <option value={InvoiceStatus.OVERDUE}>{t('invoices.status.overdue')}</option>
              </select>
          </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-dark-700">
             <div>
                <span className="text-dark-300">{t('invoices.modal.total')}: </span>
                <span className="text-2xl font-bold text-primary">{totalAmount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' })}</span>
             </div>
             <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <button type="button" onClick={onClose} className="bg-dark-600 hover:bg-dark-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">{t('invoices.modal.cancelButton')}</button>
                <button type="submit" form="invoice-form" onClick={handleSubmit} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">{t('invoices.modal.saveButton')}</button>
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

export default InvoiceFormModal;