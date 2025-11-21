import React, { useState, useEffect, useMemo, ErrorInfo, ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Wallet as WalletIcon, 
  Settings, 
  Plus, 
  CreditCard, 
  Trash2, 
  LogOut, 
  User as UserIcon, 
  AlertTriangle, 
  BarChart2, 
  Scan 
} from 'lucide-react';
import { Wallet, Transaction, TransactionType, Category, User } from './types';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import AuthScreen from './components/AuthScreen';
import TutorialModal from './components/TutorialModal';
import { getSessionUser, loadUserData, logoutUser, saveUserData, updateUser } from './services/storageService';

enum Tab {
  DASHBOARD = 'Dashboard',
  WALLETS = 'Carteras',
  SETTINGS = 'Ajustes',
  STATS = 'Stats'
}

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors w-full mt-4"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Persistence Safety Flag
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Temporary state for new wallet form
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setUser(sessionUser);
      const data = loadUserData(sessionUser.id);
      setWallets(data.wallets);
      setTransactions(data.transactions);
      setIsDataLoaded(true);
      if (sessionUser.hasSeenTutorial === false) {
        setIsTutorialOpen(true);
      }
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (user && isDataLoaded) {
      saveUserData(user.id, { wallets, transactions });
    }
  }, [wallets, transactions, user, isDataLoaded]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleLoginSuccess = (loggedInUser: User) => {
    const data = loadUserData(loggedInUser.id);
    setWallets(data.wallets);
    setTransactions(data.transactions);
    setIsDataLoaded(true);
    setUser(loggedInUser);

    if (loggedInUser.hasSeenTutorial === false) {
      setIsTutorialOpen(true);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsDataLoaded(false);
    setWallets([]);
    setTransactions([]);
    setActiveTab(Tab.DASHBOARD);
  };

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
      color: 'bg-slate-800',
    };

    setWallets([...wallets, newWallet]);
    setNewWalletName('');
    setNewWalletBalance('');
    setIsAddWalletModalOpen(false);
  };

  const handleDeleteWallet = (id: string) => {
    if (window.confirm('¿Borrar cartera?')) {
        setWallets(wallets.filter(w => w.id !== id));
        setTransactions(transactions.filter(t => t.walletId !== id));
    }
  }

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-primary-500 font-bold">Cargando...</div>;
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleLoginSuccess} />;
  }

  // Navigation Items
  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
      <button 
        onClick={() => setActiveTab(tab)} 
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${activeTab === tab ? 'text-primary-600' : 'text-gray-400'}`}
      >
          <Icon size={24} className={activeTab === tab ? 'fill-current' : ''} />
          {activeTab === tab && <div className="w-1 h-1 bg-primary-600 rounded-full mt-1"></div>}
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-[family-name:var(--font-inter)] pb-20 md:pb-0">
      
      {/* Mobile Navigation (Glassmorphism & Floating) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] z-40 p-2 flex justify-between items-center shadow-2xl shadow-slate-200/50 px-6">
        <NavItem tab={Tab.DASHBOARD} icon={LayoutDashboard} label="" />
        <NavItem tab={Tab.STATS} icon={BarChart2} label="" />
        
        {/* Center FAB */}
        <button 
            onClick={() => setIsTransactionModalOpen(true)}
            className="bg-primary-500 text-white w-14 h-14 rounded-full -mt-12 shadow-lg shadow-primary-500/40 flex items-center justify-center border-[6px] border-slate-50"
        >
            <Plus size={28} strokeWidth={3} />
        </button>

        <NavItem tab={Tab.WALLETS} icon={WalletIcon} label="" />
        <NavItem tab={Tab.SETTINGS} icon={UserIcon} label="" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 p-6">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">K</div>
          <span className="text-2xl font-bold text-slate-800">Kapital</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: Tab.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
            { id: Tab.WALLETS, icon: WalletIcon, label: 'My Wallets' },
            { id: Tab.STATS, icon: BarChart2, label: 'Analytics' },
            { id: Tab.SETTINGS, icon: Settings, label: 'Settings' },
          ].map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all font-bold ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
                <item.icon size={20} />
                <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
            <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="w-full bg-primary-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center space-x-2"
            >
                <Plus size={20} />
                <span>New Transaction</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    Hi, Welcome Back 
                    <span className="text-2xl animate-pulse">👋</span>
                </h1>
                <p className="text-slate-400 font-medium mt-1">Good Morning</p>
            </div>
            
            <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                     {user.photoURL ? (
                         <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                         <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">{user.name.charAt(0)}</div>
                     )}
                 </div>
            </div>
        </header>

        {activeTab === Tab.DASHBOARD && (
            <Dashboard wallets={wallets} transactions={sortedTransactions} />
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== Tab.DASHBOARD && activeTab !== Tab.WALLETS && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                     <Settings size={48} className="text-slate-200" />
                </div>
                <p>Sección en construcción</p>
                <button onClick={handleLogout} className="mt-4 text-red-500 font-bold hover:underline">Cerrar Sesión</button>
            </div>
        )}

        {activeTab === Tab.WALLETS && (
             <div className="space-y-6">
                 <button onClick={() => setIsAddWalletModalOpen(true)} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[2rem] text-slate-400 font-bold hover:border-primary-500 hover:text-primary-500 transition-colors">
                     + Crear nueva cartera
                 </button>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map(w => (
                        <div key={w.id} className={`relative p-6 rounded-[2.5rem] text-white overflow-hidden ${w.color || 'bg-slate-800'}`}>
                             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                             <div className="flex justify-between items-start mb-8">
                                 <CreditCard className="opacity-80" />
                                 <button onClick={() => handleDeleteWallet(w.id)}><Trash2 size={18} className="opacity-50 hover:opacity-100" /></button>
                             </div>
                             <p className="opacity-80 font-medium">{w.name}</p>
                             <p className="text-3xl font-bold">{w.balance.toFixed(2)}€</p>
                        </div>
                    ))}
                 </div>
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

      <TutorialModal 
        isOpen={isTutorialOpen}
        onClose={() => {
             setIsTutorialOpen(false);
             if(user) updateUser({...user, hasSeenTutorial: true});
        }}
      />

      {isAddWalletModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl">
                 <h2 className="text-xl font-bold mb-4">Nueva Cartera</h2>
                 <form onSubmit={handleAddWallet}>
                     <input 
                        autoFocus
                        value={newWalletName} 
                        onChange={e => setNewWalletName(e.target.value)} 
                        className="w-full bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100" 
                        placeholder="Nombre"
                    />
                     <input 
                        type="number"
                        value={newWalletBalance} 
                        onChange={e => setNewWalletBalance(e.target.value)} 
                        className="w-full bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100" 
                        placeholder="Saldo inicial"
                    />
                     <div className="flex gap-2">
                         <button type="button" onClick={() => setIsAddWalletModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500">Cancelar</button>
                         <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-primary-500 text-white">Crear</button>
                     </div>
                 </form>
             </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;