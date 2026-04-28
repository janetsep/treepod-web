-- Migración: Agregar campos administrativos a la tabla reservas
-- Fecha: 2026-04-28
-- Descripción: Agregar campos para configuración de envío de emails, calendario, acompañantes y tipo de documento

-- Agregar columnas nuevas a la tabla reservas
ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS enviar_confirmacion BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS acompanantes TEXT,
ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20) DEFAULT 'boleta' CHECK (tipo_documento IN ('boleta', 'factura')),
ADD COLUMN IF NOT EXISTS sincronizar_calendario BOOLEAN DEFAULT true;

-- Comentarios para documentación
COMMENT ON COLUMN reservas.enviar_confirmacion IS 'Indica si se debe enviar confirmación por email al cliente (para reservas manuales del admin)';
COMMENT ON COLUMN reservas.acompanantes IS 'Información adicional sobre acompañantes de la reserva principal';
COMMENT ON COLUMN reservas.tipo_documento IS 'Tipo de documento para efectos tributarios: boleta o factura';
COMMENT ON COLUMN reservas.sincronizar_calendario IS 'Indica si la reserva debe sincronizarse con Google Calendar de janetsep@gmail.com';