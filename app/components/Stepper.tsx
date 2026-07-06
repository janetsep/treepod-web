"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
    activeStep: 1 | 2 | 3;
}

const Stepper: React.FC<StepperProps> = ({ activeStep }) => {
    const steps = [
        { label: "Estadía" },
        { label: "Tus Datos" },
        { label: "Pago" }
    ];

    return (
        <div className="flex items-center justify-between max-w-lg mx-auto mb-12 sm:mb-16 px-4 w-full relative">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = activeStep > stepNumber;
                const isActive = activeStep === stepNumber;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                                ${isCompleted ? 'bg-primary text-white shadow-lg scale-110' :
                                  isActive ? 'bg-primary text-white ring-8 ring-primary/10 shadow-xl scale-110' :
                                  'bg-white text-gray-400 border-2 border-gray-100'}
                            `}>
                                {isCompleted ? (
                                    <Check className="w-6 h-6 stroke-[3px] animate-fade-in" />
                                ) : (
                                    <span className={isActive ? "animate-pulse" : ""}>{stepNumber}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-8 whitespace-nowrap overflow-hidden">
                                <span className={`
                                    text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 block text-center
                                    ${isActive ? 'text-primary opacity-100' : 'text-gray-400/80 opacity-60'}
                                    ${isActive ? 'translate-y-0' : 'translate-y-1'}
                                `}>
                                    {isActive && <span className="inline-block w-1.5 h-1.5 bg-gold rounded-full mr-1.5 animate-pulse" />}
                                    {step.label}
                                </span>
                            </div>
                        </div>

                        {/* Line Segment */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-2 -mt-7 sm:-mt-8 relative overflow-hidden bg-gray-100 rounded-full">
                                <div
                                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-in-out"
                                    style={{
                                        width: isCompleted ? '100%' : '0%'
                                    }}
                                />
                                {isActive && (
                                    <div className="absolute inset-y-0 left-0 bg-primary/30 w-1/2 animate-pulse" />
                                )}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Stepper;

