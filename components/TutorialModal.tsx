import React, { useState } from 'react';
import { X, ArrowRight, Check, LayoutDashboard, Wallet, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Bienvenido a Kapital",
    description: "Tu nuevo centro de mando financiero. Controla tus gastos e ingresos de forma visual y sencilla.",
    icon: <LayoutDashboard size={48} className="text-primary-500" />,
  },
  {
    title: "Gestiona tus Carteras",
    description: "Empiezas con una cartera Principal. Puedes crear más carteras para organizar tus ahorros, efectivo o cuentas bancarias.",
    icon: <Wallet size={48} className="text-blue-500" />,
  },
  {
    title: "Poder de la IA",
    description: "Olvídate de escribir. Sube una foto de tus tickets o facturas y nuestra IA detectará el monto, la categoría y la fecha automáticamente.",
    icon: <Sparkles size={48} className="text-purple-500" />,
  }
];

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-sm font-bold z-10"
        >
          Saltar
        </button>

        {/* Progress Bar */}
        <div className="flex h-1.5 bg-slate-100 mx-8 mt-8 rounded-full overflow-hidden">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`flex-1 transition-all duration-500 ${
                index <= currentStep ? 'bg-primary-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="p-8 text-center min-h-[450px] flex flex-col justify-center items-center">
          <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mb-8 animate-[bounce_3s_infinite]">
            {steps[currentStep].icon}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4 transition-all duration-300">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-slate-500 text-lg leading-relaxed mb-8 transition-all duration-300">
            {steps[currentStep].description}
          </p>

          <div className="flex space-x-3 w-full mt-auto">
             {currentStep > 0 && (
                 <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                 >
                     Atrás
                 </button>
             )}
            <button 
              onClick={handleNext}
              className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Empezar' : 'Siguiente'}</span>
              {currentStep === steps.length - 1 ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;