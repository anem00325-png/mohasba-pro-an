import React, { useState, useMemo } from 'react';
import { Invoice, Product, InvoiceSettings, InvoiceStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import InvoicesTable from '../components/InvoicesTable';
import InvoiceFormModal from '../components/InvoiceFormModal';
import InvoiceSettingsModal from '../components/InvoiceSettingsModal';
import InvoiceReturnModal from '../components/InvoiceReturnModal';

interface InvoicesPageProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: number) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  products: Product[];
  invoiceSettings: InvoiceSettings;
  setInvoiceSettings: (settings: InvoiceSettings) => void;
  onMergeCustomers: () => string;
}

const InvoicesPage: React.FC<InvoicesPageProps> = (props) => {
    const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
    const { t } = useLanguage();

    const openEditModal = (invoice: Invoice) => {
        setInvoiceToEdit(invoice);
        setIsInvoiceFormOpen(true);
    };

    const openAddModal = () => {
        setInvoiceToEdit(null);
        setIsInvoiceFormOpen(true);
    };
    
    const handleMarkAsOverdue = (invoiceId: number) => {
        const invoiceToUpdate = props.invoices.find(inv => inv.id === invoiceId);
        if (invoiceToUpdate) {
            props.onUpdateInvoice({ ...invoiceToUpdate, status: InvoiceStatus.OVERDUE, lastModified: new Date().toISOString() });
        }
    };

    const { recentInvoices, archivedInvoices } = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recent: Invoice[] = [];
        const archived: Invoice[] = [];
        
        props.invoices.forEach(invoice => {
            if (new Date(invoice.date) >= thirtyDaysAgo) {
                recent.push(invoice);
            } else {
                archived.push(invoice);
            }
        });
        
        return { recentInvoices: recent, archivedInvoices: archived };
    }, [props.invoices]);

    const specialCustomers = useMemo(() => {
        const customerCounts = props.invoices.reduce((acc, invoice) => {
            acc[invoice.customerName] = (acc[invoice.customerName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return new Set(Object.keys(customerCounts).filter(name => customerCounts[name] > 1));
    }, [props.invoices]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t('invoices.page.title')}</h2>
                    <p className="text-dark-400 mt-1">{t('invoices.searchPlaceholder')}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={openAddModal} className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                        {t('invoices.addButton')}
                    </button>
                     <button onClick={() => setIsReturnModalOpen(true)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                        {t('invoices.page.returnButton')}
                    </button>
                     <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-md transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">{t('invoices.page.recent')}</h3>
                {recentInvoices.length > 0 ? (
                     <InvoicesTable 
                        products={props.products} 
                        invoices={recentInvoices} 
                        onEdit={openEditModal} 
                        onDelete={props.onDeleteInvoice} 
                        onPrint={props.onPrintInvoice}
                        specialCustomers={specialCustomers} 
                        onMarkAsOverdue={handleMarkAsOverdue}
                     />
                ) : (
                    <p className="text-center p-6 text-dark-500">{t('invoices.noInvoices')}</p>
                )}
            </div>

            {archivedInvoices.length > 0 && (
                <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">{t('invoices.page.archived')}</h3>
                    <InvoicesTable 
                        products={props.products} 
                        invoices={archivedInvoices} 
                        onEdit={openEditModal} 
                        onDelete={props.onDeleteInvoice} 
                        onPrint={props.onPrintInvoice}
                        specialCustomers={specialCustomers} 
                        onMarkAsOverdue={handleMarkAsOverdue}
                    />
                </div>
            )}
            
            <InvoiceFormModal 
                isOpen={isInvoiceFormOpen} 
                onClose={() => setIsInvoiceFormOpen(false)} 
                onAddInvoice={props.onAddInvoice}
                onUpdateInvoice={props.onUpdateInvoice}
                invoiceToEdit={invoiceToEdit}
                products={props.products}
            />
            <InvoiceSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={props.invoiceSettings}
                setSettings={props.setInvoiceSettings}
                onMergeCustomers={props.onMergeCustomers}
            />
            <InvoiceReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                invoices={props.invoices}
                onInvoiceSelect={props.onPrintInvoice}
            />
        </div>
    );
};

export default InvoicesPage;