'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReservarButtonProps {
  reservaId: string;
  monto: number;
  className?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export default function ReservarButton({ 
  reservaId,
  monto,
  className = '',
  onSuccess,
  onError
}: ReservarButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReservar = async () => {
    try {
      setIsLoading(true);
      
      // Validación básica
      if (!reservaId) throw new Error('ID de reserva no proporcionado');
      if (isNaN(monto) || monto <= 0) throw new Error('Monto inválido');
      
      const response = await fetch('/api/reservas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reservaId,
          monto
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la reserva');
      }
      
      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess(data);
      } else {
        // Redirección por defecto si no hay callback
        router.push(`/reserva/${data.id}/pago`);
      }
      
    } catch (error) {
      console.error('Error en ReservarButton:', error);
      
      // Llamar al callback de error si existe
      if (onError) {
        onError(error instanceof Error ? error : new Error('Error desconocido'));
      } else {
        // Mostrar alerta por defecto si no hay callback
        alert(error instanceof Error ? error.message : 'Error al procesar la reserva');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReservar}
      disabled={isLoading}
      className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
        isLoading 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
      } ${className}`}
      aria-busy={isLoading}
      aria-label={`Reservar con pago inicial de $${monto.toLocaleString()}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando reserva...
        </span>
      ) : (
        `Reservar (50% ahora - $${monto.toLocaleString()})`
      )}
    </button>
  );
}
