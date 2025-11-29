import React, { useState, useMemo, useRef } from 'react';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionsTable from '../components/TransactionsTable';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import DashboardCard from '../components/DashboardCard';
import EmployeesTable from '../components/EmployeesTable';
import EmployeeFormModal from '../components/EmployeeFormModal';
import PayrollSummary from '../components/PayrollSummary';
import { Transaction, ChartData, Employee, TransactionType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface AccountingPageProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  chartData: ChartData[];
  dashboardStats: { totalIncome: number; netProfit: number };
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onPaySalary: (employee: Employee) => void;
}

type AccountingTab = 'dashboard' | 'transactions' | 'payroll';


// Payroll Tab Component (extracted from former PayrollPage)
const PayrollTab: React.FC<{ 
    employees: Employee[]; 
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>; 
    transactions: Transaction[]; 
    onPaySalary: (employee: Employee) => void;
}> = ({ employees, setEmployees, transactions, onPaySalary }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const { showToast } = useToast();
    const { t } = useLanguage();

    const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
        const newEmployee = { ...employee, id: Date.now() };
        setEmployees(prev => [...prev, newEmployee]);
        showToast(t('toast.employeeAdded'), 'success');
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        showToast(t('toast.employeeUpdated'), 'success');
    };

    const handleDeleteEmployee = (employeeId: number) => {
        if (window.confirm(t('employees.deleteConfirm'))) {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
            showToast(t('toast.employeeDeleted'), 'success');
        }
    };

    const openEditModal = (employee: Employee) => {
        setEmployeeToEdit(employee);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEmployeeToEdit(null);
        setIsModalOpen(true);
    };

    const monthlyPayroll = useMemo(() => {
        return employees.reduce((total, emp) => total + emp.salary, 0);
    }, [employees]);

    return (
        <div className="space-y-8">
            <PayrollSummary totalEmployees={employees.length} monthlyPayroll={monthlyPayroll} />
            <div className="bg-dark-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{t('employees.title')}</h3>
                    <button onClick={openAddModal} className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                        {t('employees.addButton')}
                    </button>
                </div>
                {employees.length > 0 ? (
                    <EmployeesTable employees={employees} onEdit={openEditModal} onDelete={handleDeleteEmployee} />
                ) : (
                    <p className="text-center p-6 text-dark-500">{t('employees.noEmployees')}</p>
                )}
            </div>
            <EmployeeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                employeeToEdit={employeeToEdit}
            />
        </div>
    );
};


const AccountingPage: React.FC<AccountingPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AccountingTab>('dashboard');
    const { t, language } = useLanguage();
    
    const formatCurrency = (amount: number) => {
        const currency = language === 'ar' ? 'EGP' : 'USD';
        return amount.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
    };
    
    const renderTabs = () => (
        <div className="mb-6 border-b border-dark-700">
            <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('accounting.tabs.dashboard')}</button>
                <button onClick={() => setActiveTab('transactions')} className={`${activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('accounting.tabs.transactions')}</button>
                <button onClick={() => setActiveTab('payroll')} className={`${activeTab === 'payroll' ? 'border-primary text-primary' : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('accounting.tabs.payroll')}</button>
            </nav>
        </div>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard 
                                title={t('dashboard.totalIncome')}
                                value={formatCurrency(props.dashboardStats.totalIncome)} 
                                colorClass="bg-green-500/20"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                            />
                            <DashboardCard 
                                title={t('dashboard.netProfit')}
                                value={formatCurrency(props.dashboardStats.netProfit)} 
                                colorClass={props.dashboardStats.netProfit >= 0 ? 'bg-blue-500/20' : 'bg-yellow-500/20'}
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${props.dashboardStats.netProfit >= 0 ? 'text-blue-400' : 'text-yellow-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            />
                        </div>
                        <IncomeExpenseChart data={props.chartData} />
                    </div>
                );
            case 'transactions':
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <TransactionsTable transactions={props.transactions} />
                        </div>
                        <div>
                            <AddTransactionForm onAddTransaction={props.onAddTransaction} />
                        </div>
                    </div>
                 );
            case 'payroll':
                 return <PayrollTab 
                    employees={props.employees} 
                    setEmployees={props.setEmployees} 
                    transactions={props.transactions} 
                    onPaySalary={props.onPaySalary}
                />;
        }
    }


    return (
        <div className="space-y-8">
            {renderTabs()}
            {renderContent()}
        </div>
    );
};

export default AccountingPage;