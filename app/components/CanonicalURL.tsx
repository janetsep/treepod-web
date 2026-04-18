'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function CanonicalURL() {
  const pathname = usePathname();

  useEffect(() => {
    // Remover canonical existente si existe
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Crear nuevo canonical con pathname dinámico
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://domostreepod.cl${pathname}`;

    // Agregar al head
    document.head.appendChild(canonical);

    // Cleanup function para remover el canonical al desmontar
    return () => {
      // Verificar que el documento y DOM aún existen
      if (typeof document !== 'undefined') {
        const canonicalToRemove = document.querySelector(`link[rel="canonical"][href="https://domostreepod.cl${pathname}"]`);
        if (canonicalToRemove && canonicalToRemove.parentNode) {
          canonicalToRemove.parentNode.removeChild(canonicalToRemove);
        }
      }
    };
  }, [pathname]);

  // Este componente no renderiza nada visible
  return null;
}