import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Transaction, Wallet, TransactionType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Search, Calendar } from 'lucide-react';

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

  // Budget calculation (Mock: 30% of generic budget)
  const budgetTotal = 3000;
  const budgetUsedPercentage = Math.min((expense / budgetTotal) * 100, 100);

  // Prepare data for Pie Chart
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    // Only top 3 for donut
    return Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Weekly Data for Bar Chart
  const weeklyData = useMemo(() => {
    const days = ['1st Week', '2nd Week', '3rd Week', '4th Week'];
    // Mock distribution based on real data just for visual
    return days.map((day, idx) => ({
        name: day,
        income: income * (0.2 + idx * 0.1), 
        expense: expense * (0.1 + idx * 0.15)
    }));
  }, [income, expense]);

  return (
    <div className="space-y-8 pb-24">
      
      {/* 1. Hero Card - Emerald Gradient */}
      <div className="bg-gradient-to-br from-primary-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <p className="text-primary-100 text-sm font-medium mb-1 flex items-center gap-2">
                         <WalletIcon size={16} /> Total Balance
                      </p>
                      <h2 className="text-4xl font-bold tracking-tight">{totalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</h2>
                  </div>
                  <div className="text-right">
                      <p className="text-primary-100 text-sm mb-1">Total Expense</p>
                      <p className="text-xl font-semibold text-white flex items-center justify-end">
                          -{expense.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€
                      </p>
                  </div>
              </div>

              {/* Budget Progress */}
              <div className="bg-black/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                      <span>Monthly Budget</span>
                      <span>{budgetTotal}€</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-1000" 
                        style={{ width: `${budgetUsedPercentage}%` }}
                      ></div>
                  </div>
                  <p className="text-xs text-primary-100 mt-3 font-medium">
                      ✅ {Math.round(100 - budgetUsedPercentage)}% of your budget remaining. Looks good.
                  </p>
              </div>
          </div>
      </div>

      {/* 2. Quickly Analysis Row (Horizontal Scroll on Mobile) */}
      <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
               <h3 className="text-xl font-bold text-slate-800">Quickly Analysis</h3>
               <button className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-primary-500">
                   <Calendar size={20} />
               </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x">
              {/* Savings Donut Card */}
              <div className="min-w-[160px] bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col items-center snap-center">
                   <div className="w-24 h-24 relative mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{value: 70}, {value: 30}]}
                                    innerRadius={30}
                                    outerRadius={40}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#10b981" /> {/* Primary */}
                                    <Cell fill="#e2e8f0" /> {/* Slate 200 */}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-primary-600">
                            <WalletIcon size={20} />
                        </div>
                   </div>
                   <p className="text-slate-500 text-xs font-medium text-center">Savings</p>
                   <p className="text-slate-900 font-bold">On Goals</p>
              </div>

              {/* Revenue Card */}
              <div className="min-w-[200px] bg-emerald-50 rounded-[2rem] p-6 flex flex-col justify-center relative snap-center border border-emerald-100">
                   <p className="text-slate-500 text-sm mb-1">Revenue Last Week</p>
                   <p className="text-2xl font-bold text-slate-800 mb-4">+{income.toLocaleString()}€</p>
                   <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-white px-3 py-1.5 rounded-full w-fit">
                       <ArrowUpRight size={14} />
                       <span>4% vs last</span>
                   </div>
              </div>

              {/* Food Expense Card */}
              <div className="min-w-[200px] bg-white rounded-[2rem] p-6 flex flex-col justify-center snap-center shadow-sm border border-slate-100">
                   <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
                       <p className="text-slate-500 text-sm">Food & Drink</p>
                   </div>
                   <p className="text-2xl font-bold text-slate-800 mb-1">
                       -{expense > 0 ? (expense * 0.4).toFixed(0) : 0}€
                   </p>
                   <p className="text-xs text-slate-400">Highest category</p>
              </div>
          </div>
      </div>

      {/* 3. Main Chart Section */}
      <div className="bg-primary-50/50 rounded-[2.5rem] p-8 relative">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-700">April Expenses</h3>
              <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><Search size={18}/></button>
                  <button className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><Calendar size={18}/></button>
              </div>
          </div>
          
          <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barGap={8}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#94a3b8'}} 
                        dy={10}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="income" fill="#cbd5e1" radius={[4,4,4,4]} barSize={12} />
                      <Bar dataKey="expense" fill="#10b981" radius={[4,4,4,4]} barSize={12} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* 4. Transaction List */}
      <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">Transactions</h3>
          <div className="space-y-3">
              {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                            style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                          >
                              {t.category.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold text-slate-800 text-sm">{t.category}</p>
                              <p className="text-slate-400 text-xs">{new Date(t.date).toLocaleDateString()} • {t.description.substring(0, 15)}...</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className={`font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toFixed(2)}€
                          </p>
                          <p className="text-xs text-slate-400">{wallets.find(w => w.id === t.walletId)?.name}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

export default Dashboard;