import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet as WalletIcon, 
  Settings, 
  Plus, 
  CreditCard,
  Trash2
} from 'lucide-react';
import { Wallet, Transaction, TransactionType, Category } from './types';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';

enum Tab {
  DASHBOARD = 'Dashboard',
  WALLETS = 'Carteras',
  SETTINGS = 'Ajustes'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);

  // Temporary state for new wallet form
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  // Sorting transactions by date descending
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleAddTransaction = (data: {
    amount: number;
    description: string;
    type: TransactionType;
    category: Category;
    walletId: string;
    date: string;
  }) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...data,
    };

    setTransactions([newTransaction, ...transactions]);

    // Update Wallet Balance
    setWallets(prevWallets => prevWallets.map(w => {
      if (w.id === data.walletId) {
        const adjustment = data.type === TransactionType.INCOME ? data.amount : -data.amount;
        return { ...w, balance: w.balance + adjustment };
      }
      return w;
    }));
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName) return;

    const newWallet: Wallet = {
      id: Date.now().toString(),
      name: newWalletName,
      balance: parseFloat(newWalletBalance) || 0,
      currency: 'EUR',
      color: 'bg-gray-800', // Default color for now
    };

    setWallets([...wallets, newWallet]);
    setNewWalletName('');
    setNewWalletBalance('');
    setIsAddWalletModalOpen(false);
  };

  const handleDeleteWallet = (id: string) => {
    if (window.confirm('¿Estás seguro de borrar esta cartera y sus transacciones?')) {
        setWallets(wallets.filter(w => w.id !== id));
        setTransactions(transactions.filter(t => t.walletId !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Navigation (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-6 py-3 flex justify-between items-center shadow-lg">
        <button onClick={() => setActiveTab(Tab.DASHBOARD)} className={`flex flex-col items-center ${activeTab === Tab.DASHBOARD ? 'text-orange-500' : 'text-gray-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium mt-1">Inicio</span>
        </button>
        
        {/* Floating Action Button Center */}
        <button 
            onClick={() => setIsTransactionModalOpen(true)}
            className="bg-orange-500 text-white p-4 rounded-full -mt-8 shadow-lg shadow-orange-500/40 border-4 border-gray-50"
        >
            <Plus size={24} />
        </button>

        <button onClick={() => setActiveTab(Tab.WALLETS)} className={`flex flex-col items-center ${activeTab === Tab.WALLETS ? 'text-orange-500' : 'text-gray-400'}`}>
          <WalletIcon size={24} />
          <span className="text-[10px] font-medium mt-1">Carteras</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
            K
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Kapital</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === Tab.DASHBOARD ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
             onClick={() => setActiveTab(Tab.WALLETS)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === Tab.WALLETS ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <WalletIcon size={20} />
            <span>Mis Carteras</span>
          </button>
          <button 
             onClick={() => setActiveTab(Tab.SETTINGS)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === Tab.SETTINGS ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            <span>Ajustes</span>
          </button>
        </nav>

        <div className="p-4">
            <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
            >
                <Plus size={20} />
                <span>Nueva Operación</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{activeTab}</h1>
                <p className="text-gray-500 mt-1">
                    {activeTab === Tab.DASHBOARD && `Bienvenido de nuevo. Tienes ${wallets.length} carteras activas.`}
                    {activeTab === Tab.WALLETS && 'Gestiona tus cuentas y efectivo.'}
                </p>
            </div>
            <div className="hidden md:block">
                {/* User profile placeholder */}
                <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm"></div>
            </div>
        </header>

        {activeTab === Tab.DASHBOARD && (
            <Dashboard wallets={wallets} transactions={sortedTransactions} />
        )}

        {activeTab === Tab.WALLETS && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add Wallet Card */}
                    <button 
                        onClick={() => setIsAddWalletModalOpen(true)}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors min-h-[200px]"
                    >
                        <Plus size={32} className="mb-2" />
                        <span className="font-medium">Crear Nueva Cartera</span>
                    </button>

                    {wallets.map(wallet => (
                        <div key={wallet.id} className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group ${wallet.color}`}>
                             {/* Background Pattern Decoration */}
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all"></div>
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <CreditCard size={24} />
                                </div>
                                <button onClick={() => handleDeleteWallet(wallet.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/20 rounded-full">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="relative z-10 mt-8">
                                <p className="text-white/80 text-sm font-medium mb-1">{wallet.name}</p>
                                <h3 className="text-3xl font-bold">{wallet.balance.toFixed(2)} {wallet.currency}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Wallet Transactions List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Historial Completo</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {sortedTransactions.map(t => {
                            const walletName = wallets.find(w => w.id === t.walletId)?.name || 'Cartera eliminada';
                            return (
                                <div key={t.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-800">{t.description}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{walletName}</span>
                                            <span>•</span>
                                            <span>{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-500'}`}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toFixed(2)} €
                                    </span>
                                </div>
                            );
                        })}
                         {sortedTransactions.length === 0 && (
                             <div className="p-8 text-center text-gray-400">
                                 No hay transacciones registradas.
                             </div>
                         )}
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === Tab.SETTINGS && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Configuración</h2>
                <p className="text-gray-500 mt-2">Esta sección está en construcción.</p>
                <p className="text-sm text-gray-400 mt-4">Kapital v1.0.0</p>
            </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleAddTransaction}
        wallets={wallets}
      />

      {/* Add Wallet Modal (Simple Inline) */}
      {isAddWalletModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Cartera</h2>
                <form onSubmit={handleAddWallet} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nombre</label>
                        <input 
                            autoFocus
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newWalletName}
                            onChange={e => setNewWalletName(e.target.value)}
                            placeholder="Ej: Ahorros Viaje"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Saldo Inicial</label>
                        <input 
                            type="number"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newWalletBalance}
                            onChange={e => setNewWalletBalance(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex space-x-3 mt-6">
                        <button type="button" onClick={() => setIsAddWalletModalOpen(false)} className="flex-1 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600">Crear</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
