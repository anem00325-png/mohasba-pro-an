// types.ts

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export type Page = 'home' | 'accounting' | 'invoices' | 'pro-services' | 'admin' | 'login' | 'register';

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE',
}

export interface InvoiceItem {
  productId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface Invoice {
  id: number;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  date: string; // Due date
  status: InvoiceStatus;
  lastModified?: string;
}

export interface Employee {
    id: number;
    name: string;
    position: string;
    salary: number;
    joinDate: string; // YYYY-MM-DD
}

export enum PayrollStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
}

export interface PayrollRecord {
    id: number;
    employeeId: number;
    employeeName: string;
    month: number; // 1-12
    year: number;
    baseSalary: number;
    bonus: number;
    deductions: number;
    netPay: number;
    status: PayrollStatus;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
}

export interface InvoiceSettings {
  logo: string | null;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
}
