import React, { useState } from 'react';
import { loginUser, registerUser, loginWithGoogleMock } from '../services/storageService';
import { User } from '../types';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Sparkles, CloudLightning } from 'lucide-react';

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

  const handleGoogleLogin = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular popup
      const user = loginWithGoogleMock();
      onAuthSuccess(user);
      setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-[family-name:var(--font-inter)]">
      <div className="bg-white w-full max-w-5xl rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[650px]">
        
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
                        K
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">Kapital</span>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                </h1>
                <p className="text-slate-500">
                    {isLogin ? 'Tus finanzas, simplificadas y sincronizadas.' : 'Únete a Kapital y toma el control hoy.'}
                </p>
            </div>

            {/* Google Button */}
            <button 
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center space-x-3 border border-slate-200 py-3.5 rounded-2xl hover:bg-slate-50 transition-colors mb-6 group"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span className="text-slate-700 font-medium group-hover:text-slate-900">Continuar con Google</span>
            </button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-semibold">O con email</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center space-x-2 animate-fade-in border border-red-100">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {!isLogin && (
                    <div className="relative group">
                        <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nombre completo"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                        type="email" 
                        placeholder="Correo electrónico"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                        type="password" 
                        placeholder="Contraseña"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-3.5 rounded-2xl font-bold shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/40 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                <p className="text-slate-500 text-sm">
                    {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
                    >
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="hidden md:block w-1/2 bg-primary-600 relative overflow-hidden text-white p-12">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="bg-white/20 backdrop-blur-md inline-flex items-center space-x-2 px-4 py-2 rounded-full self-start border border-white/10">
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">AI Powered Finance</span>
                </div>

                <div className="space-y-8">
                    <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                        Gestiona.<br/>Sincroniza.<br/>Crece.
                    </h2>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                         <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center space-x-3">
                                 <div className="p-2 bg-green-400/20 rounded-xl text-green-300">
                                     <CloudLightning size={20} />
                                 </div>
                                 <div>
                                     <p className="font-bold">Sincronización Cloud</p>
                                     <p className="text-xs text-white/60">Datos seguros y accesibles</p>
                                 </div>
                             </div>
                             <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                         </div>
                         <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-green-400 w-3/4 rounded-full"></div>
                         </div>
                    </div>

                     <div className="flex -space-x-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-600 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {i === 3 ? '+' : <UserIcon size={14} />}
                            </div>
                        ))}
                        <div className="pl-6 flex items-center">
                            <span className="text-sm font-medium text-white/90">Únete a miles de usuarios</span>
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