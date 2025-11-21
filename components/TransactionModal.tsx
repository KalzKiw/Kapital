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
        // Reset form
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
      
      // Auto-select expense
      setType(TransactionType.EXPENSE);

    } catch (error) {
      console.error(error);
      alert("No se pudo analizar el recibo. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
      // Reset input so same file can be selected again if needed
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Nueva Transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* AI Scan Button */}
        <div className="px-6 pt-6 pb-2">
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-70"
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Analizando con Gemini AI...</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={20} />
                        <span>Escanear Recibo con IA</span>
                    </>
                )}
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
        </div>
        
        <div className="flex items-center justify-center my-2 text-xs text-gray-400 uppercase font-bold tracking-wider">
            <span>O rellenar manualmente</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          
          {/* Type Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === TransactionType.EXPENSE ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === TransactionType.INCOME ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Monto</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">€</span>
                <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-bold text-lg text-gray-800"
                placeholder="0.00"
                required
                />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: Café, Uber, Salario..."
            />
          </div>

          {/* Date & Wallet Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Fecha</label>
                <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
            </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Cartera</label>
                <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none"
                >
                {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
                </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none"
            >
              {Object.values(Category).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 mt-4"
          >
            Guardar Transacción
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
