"use client";

import React from 'react';
import TriBullet from './deco/TriBullet';

// Stepper editorial "KM 72": numerales Fraunces itálica unidos por filete,
// triángulo cyan como marca del paso activo. Reemplaza los círculos-píldora
// con anillo y pulso (huella plantilla). Misma prop de siempre: activeStep.
interface StepperProps {
    activeStep: 1 | 2 | 3;
}

const Stepper: React.FC<StepperProps> = ({ activeStep }) => {
    const steps = [
        { label: "Fechas y extras" },
        { label: "Tus datos" },
        { label: "Pago" }
    ];

    return (
        <ol className="flex items-center gap-3 md:gap-4 max-w-2xl mb-10 md:mb-12 w-full" aria-label={`Paso ${activeStep} de 3`}>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = activeStep > stepNumber;
                const isActive = activeStep === stepNumber;

                return (
                    <React.Fragment key={index}>
                        <li className="flex items-baseline gap-2 shrink-0">
                            {isActive && <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />}
                            <span
                                className={`font-display italic text-xl leading-none tabular-nums ${
                                    isActive || isCompleted ? 'text-[#008CBF]' : 'text-[#1E1B16]/30'
                                }`}
                                aria-hidden="true"
                            >
                                {stepNumber}
                            </span>
                            <span
                                className={`font-sans font-semibold text-[11px] uppercase tracking-[0.14em] transition-colors ${
                                    isActive
                                        ? 'text-[#1E1B16]'
                                        : isCompleted
                                            ? 'text-[#5B5348]'
                                            : 'text-[#5B5348]/50'
                                } ${isActive ? '' : 'hidden sm:inline'}`}
                            >
                                {step.label}
                            </span>
                        </li>

                        {/* Filete que une los pasos: se pinta cyan al completarse */}
                        {index < steps.length - 1 && (
                            <li
                                aria-hidden="true"
                                className={`flex-1 h-px transition-colors duration-500 ${
                                    isCompleted ? 'bg-[#00ADEF]' : 'bg-[#1E1B16]/15'
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </ol>
    );
};

export default Stepper;
