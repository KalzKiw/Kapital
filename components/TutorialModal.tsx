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
    icon: <LayoutDashboard size={48} className="text-orange-500" />,
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Skip Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium z-10"
        >
          Saltar
        </button>

        {/* Progress Bar */}
        <div className="flex h-1 bg-gray-100">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`flex-1 transition-colors duration-300 ${
                index <= currentStep ? 'bg-orange-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
          {/* Animated Icon Container */}
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 animate-[bounce_2s_infinite]">
            {steps[currentStep].icon}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 transition-all duration-300">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-8 transition-all duration-300">
            {steps[currentStep].description}
          </p>

          <div className="flex space-x-3 w-full mt-auto">
             {currentStep > 0 && (
                 <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                 >
                     Atrás
                 </button>
             )}
            <button 
              onClick={handleNext}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Empezar' : 'Siguiente'}</span>
              {currentStep === steps.length - 1 ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="pb-6 flex justify-center space-x-2">
            {steps.map((_, index) => (
                <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep ? 'bg-orange-500 w-4' : 'bg-gray-300'
                    }`} 
                />
            ))}
        </div>

      </div>
    </div>
  );
};

export default TutorialModal;