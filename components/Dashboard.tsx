import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, Wallet, TransactionType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';

interface DashboardProps {
  wallets: Wallet[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ wallets, transactions }) => {
  
  const totalBalance = useMemo(() => wallets.reduce((acc, w) => acc + w.balance, 0), [wallets]);
  
  const income = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0), 
  [transactions]);

  const expense = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0), 
  [transactions]);

  // Prepare data for Pie Chart (Expenses by Category)
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Prepare data for Bar Chart (Last 7 days)
  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    return days.map(dateStr => {
        const dailyIncome = transactions
            .filter(t => t.type === TransactionType.INCOME && t.date.startsWith(dateStr))
            .reduce((sum, t) => sum + t.amount, 0);
        const dailyExpense = transactions
            .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(dateStr))
            .reduce((sum, t) => sum + t.amount, 0);
        
        return {
            date: new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short' }),
            Ingresos: dailyIncome,
            Gastos: dailyExpense
        };
    });
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                    <WalletIcon size={20} />
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Balance Total</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalBalance.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <TrendingUp size={20} />
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Ingresos Totales</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">+{income.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <TrendingDown size={20} />
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Gastos Totales</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">-{expense.toFixed(2)} €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="Ingresos" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoría</h3>
            {categoryData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                     <Pie
                         data={categoryData}
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                     >
                         {categoryData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                         ))}
                     </Pie>
                     <Tooltip />
                     <Legend layout="vertical" verticalAlign="middle" align="right" />
                 </PieChart>
             </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    No hay gastos registrados
                </div>
            )}
           
        </div>
      </div>

      {/* Recent List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
             <h3 className="text-lg font-semibold text-gray-800">Últimos Movimientos</h3>
        </div>
        <div>
            {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-none transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}20` }}>
                            <span style={{ color: CATEGORY_COLORS[t.category] }} className="text-lg font-bold">
                                {t.category.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{t.description}</p>
                            <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <span className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-gray-800'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toFixed(2)} €
                    </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
