import placeholders from './image-placeholders.json';

// Regenerar al cambiar las fotos: node scripts/generate-image-placeholders.mjs
export function imagePlaceholder(src: string): string | undefined {
  return (placeholders as Record<string, string>)[src];
}
