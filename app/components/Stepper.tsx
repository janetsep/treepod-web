"use client";

import React from 'react';

interface StepperProps {
    activeStep: 1 | 2 | 3;
}

const Stepper: React.FC<StepperProps> = ({ activeStep }) => {
    return (
        <div className="checkout-stepper">
            <div className={`step ${activeStep === 1 ? 'step-active' : ''}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Estadía</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${activeStep === 2 ? 'step-active' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">Pago</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${activeStep === 3 ? 'step-active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">Confirmación</div>
            </div>
        </div>
    );
};

export default Stepper;
