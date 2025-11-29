import React from 'react';
import { Invoice, InvoiceStatus, Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoicesTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: number) => void;
  onPrint: (invoice: Invoice) => void;
  specialCustomers: Set<string>;
  products: Product[];
  onMarkAsOverdue: (invoiceId: number) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, onEdit, onDelete, onPrint, specialCustomers, products, onMarkAsOverdue }) => {
  const { t, language } = useLanguage();
  const sortedInvoices = [...invoices].sort((a, b) => b.id - a.id);
  const currency = language === 'ar' ? 'EGP' : 'USD';

  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-500/20 text-green-400';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-500/20 text-red-400';
      case InvoiceStatus.UNPAID:
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };
  
  const getStatusText = (status: InvoiceStatus) => {
      switch (status) {
          case InvoiceStatus.PAID: return t('invoices.status.paid');
          case InvoiceStatus.UNPAID: return t('invoices.status.unpaid');
          case InvoiceStatus.OVERDUE: return t('invoices.status.overdue');
      }
  }
  
  const calculateTotal = (invoice: Invoice) => {
      return invoice.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-right rtl:text-right">
        <thead className="border-b-2 border-dark-700 text-dark-400 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold text-right rtl:text-right">{t('invoicesTable.invoiceId')}</th>
            <th className="p-3 font-semibold text-right rtl:text-right">{t('invoicesTable.customer')}</th>
            <th className="p-3 font-semibold text-center">{t('invoicesTable.customerPhone')}</th>
            <th className="p-3 font-semibold text-center">{t('invoicesTable.date')}</th>
            <th className="p-3 font-semibold text-center">{t('invoicesTable.status')}</th>
            <th className="p-3 font-semibold text-center">{t('invoices.customerStatus')}</th>
            <th className="p-3 font-semibold text-center">{t('invoicesTable.amount')}</th>
            <th className="p-3 font-semibold text-left rtl:text-left">{t('invoicesTable.actions')}</th>
          </tr>
        </thead>
        <tbody className="text-dark-200">
          {sortedInvoices.map((invoice) => {
            const isSpecial = specialCustomers.has(invoice.customerName);
            return (
              <tr key={invoice.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                <td className="p-3 font-mono">#{invoice.id}</td>
                <td className="p-3 font-medium">{invoice.customerName}</td>
                <td className="p-3 text-dark-400 text-center">{invoice.customerPhone || '-'}</td>
                <td className="p-3 text-dark-400 text-center">
                  <span>{invoice.date}</span>
                  {invoice.lastModified && (
                    <span className="block text-xs text-dark-500 mt-1">
                      ({t('invoicesTable.edited')}: {invoice.lastModified.substring(0, 10)})
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="p-3 text-center">
                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isSpecial ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {isSpecial ? t('invoices.status.returning') : t('invoices.status.new')}
                  </span>
                </td>
                <td className="p-3 font-mono font-semibold text-center text-secondary">
                  {calculateTotal(invoice).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency })}
                </td>
                <td className="p-3 text-left rtl:text-left space-x-2 rtl:space-x-reverse whitespace-nowrap">
                  <button onClick={() => onPrint(invoice)} className="text-green-400 hover:text-green-300 transition-colors text-xs font-bold">{t('invoicesTable.print')}</button>
                  <button onClick={() => onEdit(invoice)} className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold">{t('invoicesTable.edit')}</button>
                  {invoice.status !== InvoiceStatus.PAID && (
                    <button onClick={() => onMarkAsOverdue(invoice.id)} className="text-yellow-400 hover:text-yellow-300 transition-colors text-xs font-bold">{t('invoicesTable.markOverdue')}</button>
                  )}
                  <button onClick={() => onDelete(invoice.id)} className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold">{t('invoicesTable.delete')}</button>
                </td>
              </tr>
            )}
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(InvoicesTable);