import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { TransactionType, Category, Wallet, ReceiptData } from '../types';
import { analyzeReceipt } from '../services/geminiService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    type: TransactionType;
    category: Category;
    walletId: string;
    date: string;
  }) => void;
  wallets: Wallet[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, wallets }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(isOpen) {
        setAmount('');
        setDescription('');
        setCategory(Category.FOOD);
        setDate(new Date().toISOString().split('T')[0]);
        setType(TransactionType.EXPENSE);
        setIsAnalyzing(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !walletId) return;

    onSubmit({
      amount: parseFloat(amount),
      description: description || (type === TransactionType.INCOME ? 'Ingreso' : 'Gasto'),
      type,
      category,
      walletId,
      date,
    });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const data: ReceiptData = await analyzeReceipt(file);
      if (data.amount) setAmount(data.amount.toString());
      if (data.merchant) setDescription(data.merchant);
      if (data.category) setCategory(data.category);
      if (data.date) setDate(data.date.split('T')[0]);
      setType(TransactionType.EXPENSE);
    } catch (error) {
      console.error(error);
      alert("No se pudo analizar el recibo. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-end md:items-center justify-center z-50 md:p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Nueva Transacción</h2>
          <button onClick={onClose} className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* AI Button */}
        <div className="px-8">
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 disabled:opacity-70"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                <span>{isAnalyzing ? 'Analizando...' : 'Escanear Ticket con IA'}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
        
        <div className="flex items-center justify-center my-4 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            <span>- O manual -</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
          
          {/* Switcher */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                type === TransactionType.EXPENSE ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                type === TransactionType.INCOME ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">€</span>
                <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-2xl font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="0.00"
                    required
                />
            </div>
          </div>

          {/* Inputs */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-medium"
            placeholder="Descripción (Ej: Cena)"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-600 font-medium"
            />
            <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none text-slate-600 font-medium"
            >
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none text-slate-600 font-medium"
          >
              {Object.values(Category).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 mt-4"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;