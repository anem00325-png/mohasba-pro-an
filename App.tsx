import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AccountingPage from './pages/AccountingPage';
import InvoicesPage from './pages/InvoicesPage';
import ProServicesPage from './pages/ProServicesPage';
import LoginPage from './pages/LoginPage';
import RegistrationGatePage from './pages/RegistrationGatePage';
import AdminPage from './pages/AdminPage';
import ToastContainer from './components/ToastContainer';
import SellProductModal from './components/SellProductModal';
import PrintableInvoiceModal from './components/PrintableInvoiceModal';
import { useToast } from './contexts/ToastContext';
import { Product, Transaction, Page, Invoice, Employee, TransactionType, ChartData, InvoiceStatus, Notification, InvoiceItem, InvoiceSettings } from './types';
import { useLanguage } from './contexts/LanguageContext';

const OWNER_EMAILS = ['anem00325@gmail.com', 'fatm00497@gmail.com'];
const TRIAL_DURATION_DAYS = 15;
const LOW_STOCK_THRESHOLD = 3;

// Function to get initial data from localStorage or return defaults
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
  }
  return defaultValue;
};

const App: React.FC = () => {
  const { t } = useLanguage();
  // State management
  const [userEmail, setUserEmail] = useState<string | null>(getInitialState('userEmail', null));
  const [isPro, setIsPro] = useState<boolean>(getInitialState('isPro', false));
  const [trialStartDate, setTrialStartDate] = useState<string | null>(getInitialState('trialStartDate', null));
  const [hasRegistered, setHasRegistered] = useState<boolean>(getInitialState('hasRegistered', false));

  const [activePage, setActivePage] = useState<Page>('home');
  const [products, setProducts] = useState<Product[]>(getInitialState('products', []));
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialState('transactions', []));
  const [invoices, setInvoices] = useState<Invoice[]>(getInitialState('invoices', []));
  const [employees, setEmployees] = useState<Employee[]>(getInitialState('employees', []));
  const [notifications, setNotifications] = useState<Notification[]>(getInitialState('notifications', []));
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(getInitialState('invoiceSettings', {
      logo: null,
      companyName: t('header.title'),
      companyAddress: t('print.sellerAddress'),
      companyEmail: t('print.sellerEmail')
  }));
  
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [personalAssistantResult, setPersonalAssistantResult] = useState<string | null>(null);

  // Modal States
  const [productToSell, setProductToSell] = useState<Product | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  
  const { showToast } = useToast();

  const isOwnerEmail = (email: string) => OWNER_EMAILS.includes(email.toLowerCase());

  // Derived state
  const isOwner = userEmail ? isOwnerEmail(userEmail) : false;
  const daysLeftInTrial = useMemo(() => {
    if (!trialStartDate) return 0;
    const start = new Date(trialStartDate).getTime();
    const now = new Date().getTime();
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DURATION_DAYS - daysPassed);
  }, [trialStartDate]);
  const isTrialActive = !!trialStartDate && daysLeftInTrial > 0;

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('userEmail', JSON.stringify(userEmail)); }, [userEmail]);
  useEffect(() => { localStorage.setItem('isPro', JSON.stringify(isPro)); }, [isPro]);
  useEffect(() => { localStorage.setItem('trialStartDate', JSON.stringify(trialStartDate)); }, [trialStartDate]);
  useEffect(() => { localStorage.setItem('hasRegistered', JSON.stringify(hasRegistered)); }, [hasRegistered]);
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings)); }, [invoiceSettings]);

  // Notification generation logic
  useEffect(() => {
    const newNotifications: Notification[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // Overdue invoices
    invoices.forEach(invoice => {
        const dueDate = new Date(invoice.date);
        if (invoice.status === InvoiceStatus.UNPAID && dueDate < today) {
            const id = `overdue-${invoice.id}`;
            if (!notifications.some(n => n.id === id)) {
                newNotifications.push({
                    id,
                    title: t('notifications.overdue.title'),
                    message: t('notifications.overdue.message', { name: invoice.customerName, id: invoice.id }),
                    date: new Date().toISOString(),
                    read: false,
                });
            }
        }
    });

    // Low stock
    products.forEach(product => {
        if (product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD) {
            const id = `lowstock-${product.id}`;
            if (!notifications.some(n => n.id === id)) {
                 newNotifications.push({
                    id,
                    title: t('notifications.lowStock.title'),
                    message: t('notifications.lowStock.message', { name: product.name, stock: product.stock }),
                    date: new Date().toISOString(),
                    read: false,
                });
            }
        }
    });

    if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev.filter(n => !newNotifications.some(nn => nn.id === n.id))]);
    }
  }, [invoices, products, t]);


  // Gemini AI setup
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  // Handlers
  const handleLogin = (email: string) => {
    setUserEmail(email);
    if (isOwnerEmail(email)) {
      setIsPro(true);
    }
  };

  const handleRegister = (email: string) => {
    handleLogin(email);
    setHasRegistered(true);
    if (!isOwnerEmail(email)) {
      setTrialStartDate(new Date().toISOString());
      showToast(t('toast.trialStarted', { days: TRIAL_DURATION_DAYS }), 'success');
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    setIsPro(false);
    setTrialStartDate(null);
    setActivePage('home');
  };

  const handleNavigate = (page: Page) => {
    const isProtected = page === 'accounting' || page === 'invoices';
    if (isProtected && !isPro && !isTrialActive && !isOwner) {
      showToast(t('toast.proFeature'), 'info');
      return;
    }
    setActivePage(page);
  };
  
  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
    showToast(t('toast.productAdded'), 'success');
  };
  
  const handleSellProduct = (product: Product, customerName: string, customerPhone: string) => {
      // 1. Create Invoice Item
      const invoiceItem: InvoiceItem = {
          productId: product.id,
          quantity: 1, // Selling one item at a time from home page
          priceAtPurchase: product.price
      };
      
      // 2. Create Invoice
      const newInvoice: Omit<Invoice, 'id'> = {
          customerName,
          customerPhone,
          items: [invoiceItem],
          date: new Date().toISOString().slice(0, 10),
          status: InvoiceStatus.PAID, // Assume immediate payment for direct sales
      };
      
      // Use handleAddInvoice to centralize logic
      handleAddInvoice(newInvoice);
      showToast(t('toast.saleAndInvoiceCreated', {productName: product.name}), 'success');
      setProductToSell(null); // Close modal
  };

  const handlePaySalary = (employee: Employee) => {
    const date = new Date();
    const newTransaction: Omit<Transaction, 'id'> = {
        description: t('payroll.payments.transactionDesc', {name: employee.name, month: date.toLocaleString(t('langCode'), { month: 'long' }) }),
        amount: employee.salary,
        type: TransactionType.EXPENSE,
        date: date.toISOString().slice(0,10),
    };
    handleAddTransaction(newTransaction);
    showToast(t('payroll.payments.toast', { name: employee.name }), 'success');
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now() };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const handleAddInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
      const newInvoice = { ...invoiceData, id: Date.now() };
      let totalAmount = 0;

      // Update product stock
      setProducts(prevProducts => {
          const updatedProducts = [...prevProducts];
          newInvoice.items.forEach(item => {
              const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
              if (productIndex !== -1) {
                  updatedProducts[productIndex].stock -= item.quantity;
                  totalAmount += item.priceAtPurchase * item.quantity;
              }
          });
          return updatedProducts;
      });
      
      // Add a single transaction for the whole invoice
      if (newInvoice.status === InvoiceStatus.PAID) {
        const newTransaction: Omit<Transaction, 'id'> = {
            description: t('transactions.invoiceSale', { id: newInvoice.id, name: newInvoice.customerName }),
            amount: totalAmount,
            type: TransactionType.INCOME,
            date: new Date().toISOString().slice(0, 10),
        };
        handleAddTransaction(newTransaction);
      }
      

      setInvoices(prev => [...prev, newInvoice]);
      showToast(t('toast.invoiceAdded'), 'success');
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
      showToast(t('toast.invoiceUpdated'), 'success');
  };
  
  const handleDeleteInvoice = (invoiceId: number) => {
      if (window.confirm(t('invoicesTable.deleteConfirm'))) {
          setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
          showToast(t('toast.invoiceDeleted'), 'success');
      }
  };

  const handleMergeCustomers = (): string => {
    const customerGroups: { [key: string]: { originalNames: { [name: string]: number }, invoiceIds: number[] } } = {};

    invoices.forEach(invoice => {
        const normalizedName = invoice.customerName.trim().toLowerCase();
        if (!customerGroups[normalizedName]) {
            customerGroups[normalizedName] = { originalNames: {}, invoiceIds: [] };
        }
        customerGroups[normalizedName].originalNames[invoice.customerName] = (customerGroups[normalizedName].originalNames[invoice.customerName] || 0) + 1;
        customerGroups[normalizedName].invoiceIds.push(invoice.id);
    });

    let updatedInvoices = [...invoices];
    let mergedCount = 0;
    let hasChanges = false;

    Object.values(customerGroups).forEach(group => {
        const uniqueNames = Object.keys(group.originalNames);
        if (uniqueNames.length > 1) {
            // Find the most frequent name variant to be the canonical one
            const canonicalName = uniqueNames.reduce((a, b) => group.originalNames[a] > group.originalNames[b] ? a : b);
            
            group.invoiceIds.forEach(id => {
                const index = updatedInvoices.findIndex(inv => inv.id === id);
                if (index !== -1 && updatedInvoices[index].customerName !== canonicalName) {
                    updatedInvoices[index] = { ...updatedInvoices[index], customerName: canonicalName, lastModified: new Date().toISOString() };
                    hasChanges = true;
                }
            });
            mergedCount++;
        }
    });

    if (hasChanges) {
        setInvoices(updatedInvoices);
        return t('settingsModal.merge.success', { count: mergedCount });
    } else {
        return t('settingsModal.merge.noDuplicates');
    }
  };

  const handleRunPersonalAssistant = async () => {
    setIsAssistantLoading(true);
    setPersonalAssistantResult(null);
    try {
        const dataContext = JSON.stringify({ transactions, invoices });
        const prompt = t('personalAssistant.prompt', { data: dataContext });

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING, description: "A brief, human-readable summary of the financial health and any issues found. Must be in Arabic." },
                actions: {
                    type: Type.ARRAY,
                    description: "A list of structured actions to be taken based on the analysis.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "Action type: 'OVERDUE_SOON', 'LARGE_EXPENSE', or 'REPEAT_CUSTOMER'." },
                            invoiceId: { type: Type.NUMBER },
                            transactionId: { type: Type.NUMBER },
                            customerName: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                        },
                    },
                },
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const result = JSON.parse(response.text);
        setPersonalAssistantResult(result.summary);

        const newNotifications: Notification[] = [];
        if (result.actions && Array.isArray(result.actions)) {
            result.actions.forEach((action: any) => {
                const id = `${action.type}-${action.invoiceId || action.transactionId || action.customerName}-${Date.now()}`;
                let notification: Notification | null = null;
                switch (action.type) {
                    case 'OVERDUE_SOON':
                        notification = {
                            id,
                            title: t('notification.overdueSoon.title'),
                            message: t('notification.overdueSoon.message', { name: action.customerName, id: action.invoiceId, amount: action.amount }),
                            date: new Date().toISOString(), read: false,
                        };
                        break;
                    case 'LARGE_EXPENSE':
                        notification = {
                            id,
                            title: t('notification.largeExpense.title'),
                            message: t('notification.largeExpense.message', { description: action.description, amount: action.amount }),
                            date: new Date().toISOString(), read: false,
                        };
                        break;
                    case 'REPEAT_CUSTOMER':
                         notification = {
                            id,
                            title: t('notification.repeatCustomer.title'),
                            message: t('notification.repeatCustomer.message', { name: action.customerName }),
                            date: new Date().toISOString(), read: false,
                        };
                        break;
                }
                if (notification) newNotifications.push(notification);
            });
        }
        
        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev.filter(n => !newNotifications.some(nn => nn.id === n.id))]);
            showToast(t('toast.analysisCompleteWithIssues', {count: newNotifications.length}), 'success');
        } else {
            showToast(t('toast.analysisComplete'), 'success');
        }

    } catch (error) {
        console.error("Personal Assistant error:", error);
        showToast(t('errors.aiError'), 'error');
        setPersonalAssistantResult(t('errors.aiError'));
    } finally {
        setIsAssistantLoading(false);
    }
  };

  const handleAnalyzeProject = async (description: string) => {
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const prompt = t('projectAnalysis.prompt', { description });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      setAnalysisResult(response.text);
    } catch (error) {
      console.error("Project analysis error:", error);
      setAnalysisResult(t('errors.aiError'));
      showToast(t('errors.aiError'), 'error');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // Data for dashboard and charts
  const dashboardStats = useMemo(() => {
    const totalIncome = transactions
      .filter(tx => tx.type === TransactionType.INCOME)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions
      .filter(tx => tx.type === TransactionType.EXPENSE)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const netProfit = totalIncome - totalExpense;
    return { totalIncome, netProfit };
  }, [transactions]);

  const chartData: ChartData[] = useMemo(() => {
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    transactions.forEach(tx => {
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (tx.type === TransactionType.INCOME) {
        monthlyData[month].income += tx.amount;
      } else {
        monthlyData[month].expense += tx.amount;
      }
    });
    return Object.entries(monthlyData)
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions]);

  // App lifecycle handlers
  
  const handleUpgrade = () => {
    setIsPro(true);
    setTrialStartDate(null); // End trial on upgrade
    showToast(t('toast.upgradedToPro'), 'success');
  };

  const resetAppData = () => {
    setProducts([]);
    setTransactions([]);
    setInvoices([]);
    setEmployees([]);
    setNotifications([]);
    setInvoiceSettings({
      logo: null,
      companyName: t('header.title'),
      companyAddress: t('print.sellerAddress'),
      companyEmail: t('print.sellerEmail')
    });
    showToast(t('toast.appReset'), 'success');
  };
  
  const handleMarkNotificationRead = (id: string | number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  // Render logic
  if (!userEmail) {
    if (!hasRegistered) {
      return <RegistrationGatePage onRegisterAndLogin={handleRegister} isOwnerEmail={isOwnerEmail} />;
    }
    return <LoginPage onLogin={handleLogin} isOwnerEmail={isOwnerEmail} />;
  }
  
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage 
            products={products}
            onAddProduct={handleAddProduct}
            onSellProduct={(product) => setProductToSell(product)}
            isPro={isPro}
            isTrialActive={isTrialActive}
            onNavigateToPro={() => setActivePage('pro-services')}
            daysLeft={daysLeftInTrial}
        />;
      case 'accounting':
        return <AccountingPage 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            chartData={chartData}
            dashboardStats={dashboardStats}
            employees={employees}
            setEmployees={setEmployees}
            onPaySalary={handlePaySalary}
        />;
      case 'invoices':
        return <InvoicesPage
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onPrintInvoice={(invoice) => setInvoiceToPrint(invoice)}
            products={products}
            invoiceSettings={invoiceSettings}
            setInvoiceSettings={setInvoiceSettings}
            onMergeCustomers={handleMergeCustomers}
        />;
      case 'pro-services':
        return <ProServicesPage 
            isPro={isPro}
            isOwner={isOwner}
            onUpgrade={handleUpgrade}
            onNavigateToAdmin={() => setActivePage('admin')}
            onAnalyzeProject={handleAnalyzeProject}
            isAnalysisLoading={isAnalysisLoading}
            analysisResult={analysisResult}
            onClearAnalysisResult={() => setAnalysisResult(null)}
            onRunPersonalAssistant={handleRunPersonalAssistant}
            isAssistantLoading={isAssistantLoading}
            assistantResult={personalAssistantResult}
            onClearAssistantResult={() => setPersonalAssistantResult(null)}
        />;
      case 'admin':
        return isOwner ? <AdminPage onClearData={(type) => {
            if (type === 'transactions') setTransactions([]);
            if (type === 'products') setProducts([]);
            if (type === 'invoices') setInvoices([]);
        }} onAppReset={resetAppData} /> : <HomePage 
            products={products}
            onAddProduct={handleAddProduct}
            onSellProduct={(product) => setProductToSell(product)}
            isPro={isPro}
            isTrialActive={isTrialActive}
            onNavigateToPro={() => setActivePage('pro-services')}
            daysLeft={daysLeftInTrial}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white" dir={useLanguage().language === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        isPro={isPro} 
        isTrialActive={isTrialActive}
        isOwner={isOwner} 
        userEmail={userEmail} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activePage={activePage} 
          notifications={notifications} 
          onMarkAsRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900 p-8">
          {renderPage()}
        </div>
      </main>
      <ToastContainer />
      {productToSell && (
        <SellProductModal
            isOpen={!!productToSell}
            onClose={() => setProductToSell(null)}
            product={productToSell}
            onConfirmSell={handleSellProduct}
        />
      )}
      {invoiceToPrint && (
        <PrintableInvoiceModal
            isOpen={!!invoiceToPrint}
            onClose={() => setInvoiceToPrint(null)}
            invoice={invoiceToPrint}
            products={products}
            invoiceSettings={invoiceSettings}
        />
      )}
    </div>
  );
};

export default App;