import { Category, TransactionType, Wallet, Transaction } from './types';

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w1',
    name: 'Principal',
    balance: 2500.50,
    currency: 'EUR',
    color: 'bg-orange-500',
  },
  {
    id: 'w2',
    name: 'Ahorros',
    balance: 10000.00,
    currency: 'EUR',
    color: 'bg-blue-500',
  },
  {
    id: 'w3',
    name: 'Efectivo',
    balance: 120.00,
    currency: 'EUR',
    color: 'bg-green-500',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    walletId: 'w1',
    amount: 45.50,
    description: 'Compra semanal Mercadona',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    type: TransactionType.EXPENSE,
    category: Category.FOOD,
  },
  {
    id: 't2',
    walletId: 'w1',
    amount: 1200,
    description: 'Nómina Mensual',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    type: TransactionType.INCOME,
    category: Category.SALARY,
  },
  {
    id: 't3',
    walletId: 'w3',
    amount: 15.00,
    description: 'Cine y Palomitas',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: TransactionType.EXPENSE,
    category: Category.ENTERTAINMENT,
  },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#f97316', // Orange
  [Category.TRANSPORT]: '#3b82f6', // Blue
  [Category.HOUSING]: '#ef4444', // Red
  [Category.ENTERTAINMENT]: '#8b5cf6', // Purple
  [Category.SHOPPING]: '#ec4899', // Pink
  [Category.HEALTH]: '#10b981', // Emerald
  [Category.SALARY]: '#84cc16', // Lime
  [Category.INVESTMENT]: '#06b6d4', // Cyan
  [Category.OTHER]: '#6b7280', // Gray
};
