import React, { useState } from 'react';
import Step1Extraction from './Step1Extraction';
import Step2Normalization from './Step2Normalization';
import Step3Summary from './Step3Summary';
import Step4Complete from './Step4Complete';

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({
    step1: null,
    step2: null, 
    step3: null,
    step4: null
  });

  const steps = [
    { id: 1, title: 'Text Extraction', icon: '📄', description: 'Extract medical data' },
    { id: 2, title: 'Normalization', icon: '🔧', description: 'Standardize values' },
    { id: 3, title: 'Summary', icon: '📊', description: 'Generate insights' },
    { id: 4, title: 'Complete', icon: '✅', description: 'Final report' }
  ];

  const handleStep1Complete = (data) => {
    setStepData(prev => ({ ...prev, step1: data }));
  };

  const handleStep2Complete = (data) => {
    setStepData(prev => ({ ...prev, step2: data }));
 
  };


  const handleStep3Complete = (data) => {
    setStepData(prev => ({ ...prev, step3: data }));
  };


  const handleContinueToStep2 = () => {
    setCurrentStep(2);
  };

  const handleContinueToStep3 = () => {
    setCurrentStep(3);
  };

  const handleContinueToStep4 = () => {
    setCurrentStep(4);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setStepData({ step1: null, step2: null, step3: null, step4: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="h-screen flex flex-col">
        
        {/* Vibrant Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-xl font-bold">🏥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">MediReport AI</h1>
                  <p className="text-blue-100 text-sm">Advanced Medical Report Analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-xs font-medium">Current Step</div>
                <div className="text-lg font-bold text-white">Step {currentStep}/4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {/* Connection Line */}
                  {index > 0 && (
                    <div className={`absolute h-1 w-2/3 top-4 -z-10 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-green-400 to-blue-400' : 'bg-gray-200'
                    }`} style={{ left: '-33%' }}></div>
                  )}
                  
                  {/* Step Indicator */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    border-4 transition-all duration-300 shadow-lg
                    ${currentStep > step.id ? 
                      'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-green-200' : 
                      currentStep === step.id ? 
                      'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-blue-200 animate-pulse' : 
                      'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 text-gray-500'}
                  `}>
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  
                  {/* Step Info */}
                  <div className="text-center mt-2">
                    <p className={`text-sm font-bold ${
                      currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full p-6">
            <div className="h-full bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="h-full p-6 overflow-y-auto">
                {currentStep === 1 && (
                  <Step1Extraction 
                    onComplete={handleStep1Complete}
                    onContinue={handleContinueToStep2}  // NEW PROP
                    data={stepData.step1}
                  />
                )}
                
                {currentStep === 2 && (
                  <Step2Normalization 
                    onComplete={handleStep2Complete}
                    onContinue={handleContinueToStep3}  // NEW PROP
                    onBack={() => setCurrentStep(1)}
                    data={stepData.step2}
                    previousData={stepData.step1}
                  />
                )}
                
                {currentStep === 3 && (
                  <Step3Summary 
                    onComplete={handleStep3Complete}
                    onContinue={handleContinueToStep4}
                    onBack={() => setCurrentStep(2)}
                    data={stepData.step3}
                    previousData={stepData.step2}
                  />
                )}
                
                {currentStep === 4 && (
                  <Step4Complete 
                    onBack={() => setCurrentStep(3)}
                    data={stepData.step4}
                    previousData={stepData}
                    onReset={resetFlow}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;