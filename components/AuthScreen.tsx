import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/storageService';
import { User } from '../types';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let user: User;
      if (isLogin) {
        user = loginUser(email, password);
      } else {
        if (!name) throw new Error('El nombre es obligatorio');
        user = registerUser(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="mb-8">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/30 mb-4">
                    K
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h1>
                <p className="text-gray-500 mt-2">
                    {isLogin ? 'Gestiona tus finanzas con inteligencia.' : 'Empieza a controlar tu dinero hoy mismo.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center space-x-2 animate-fade-in">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {!isLogin && (
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nombre completo"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                    <input 
                        type="email" 
                        placeholder="Correo electrónico"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                    <input 
                        type="password" 
                        placeholder="Contraseña"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-600/40 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                    {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-orange-600 font-semibold hover:underline"
                    >
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden text-white p-12">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            {/* Decorative Circles */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-10 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="bg-white/20 backdrop-blur-md inline-flex items-center space-x-2 px-4 py-2 rounded-full self-start border border-white/10">
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">AI Powered Finance</span>
                </div>

                <div>
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Toma el control de<br/>tu futuro financiero.
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <div className="w-6 h-6 rounded-full border-2 border-white" />
                            </div>
                            <div>
                                <p className="font-bold">Análisis de Gastos</p>
                                <p className="text-white/70 text-sm">Detecta patrones en tus compras automáticamente.</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm transform translate-x-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <div className="w-6 h-6 rounded bg-white" />
                            </div>
                            <div>
                                <p className="font-bold">Escaneo de Recibos</p>
                                <p className="text-white/70 text-sm">Gemini AI extrae los datos por ti.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;