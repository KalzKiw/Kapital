export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum Category {
  FOOD = 'Alimentación',
  TRANSPORT = 'Transporte',
  HOUSING = 'Vivienda',
  ENTERTAINMENT = 'Entretenimiento',
  SHOPPING = 'Compras',
  HEALTH = 'Salud',
  SALARY = 'Salario',
  INVESTMENT = 'Inversión',
  OTHER = 'Otros',
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  category: Category;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  color: string; // Hex color or Tailwind class suffix
}

export interface ReceiptData {
  amount?: number;
  date?: string;
  merchant?: string;
  category?: Category;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, this would be hashed or handled by auth provider
  photoURL?: string;
  provider?: 'email' | 'google';
  hasSeenTutorial?: boolean;
}

export interface UserData {
  wallets: Wallet[];
  transactions: Transaction[];
}