-- Remove weekday/weekend price differentiation from calcular_precio
-- All days now use the same base price from tarifas table

CREATE OR REPLACE FUNCTION public.calcular_precio(
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_adultos INTEGER
)
RETURNS TABLE(
    temporada TEXT,
    precio_promedio NUMERIC,
    noches INTEGER,
    total NUMERIC,
    desglose TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_fecha_actual DATE;
    v_noches INTEGER;
    v_total NUMERIC := 0;
    v_precio_noche NUMERIC;
    v_temporada_nombre TEXT;
    v_desglose TEXT := '';
    v_temp_id UUID;
    v_temp_nombre TEXT;
    v_temp_precio NUMERIC;
    v_temp_noches INTEGER;
    -- For tracking segments
    v_current_segment_name TEXT := '';
    v_current_segment_price NUMERIC := 0;
    v_current_segment_nights INTEGER := 0;
BEGIN
    v_noches := p_fecha_fin - p_fecha_inicio;

    IF v_noches <= 0 THEN
        RAISE EXCEPTION 'La fecha de salida debe ser posterior a la de entrada';
    END IF;

    v_fecha_actual := p_fecha_inicio;

    WHILE v_fecha_actual < p_fecha_fin LOOP
        -- Find the matching temporada for this date (highest priority wins)
        SELECT t.id, t.nombre, ta.precio_noche
        INTO v_temp_id, v_temp_nombre, v_temp_precio
        FROM temporadas t
        JOIN tarifas ta ON ta.temporada_id = t.id
        WHERE t.activa = true
          AND v_fecha_actual >= t.fecha_inicio
          AND v_fecha_actual <= t.fecha_fin
          AND ta.adultos = p_adultos
          AND ta.noches_min <= v_noches
          AND (ta.noches_max IS NULL OR ta.noches_max >= v_noches)
        ORDER BY t.prioridad DESC, ta.noches_min DESC
        LIMIT 1;

        -- If no exact match for adultos, try with 2 adults as fallback
        IF v_temp_precio IS NULL AND p_adultos != 2 THEN
            SELECT t.id, t.nombre, ta.precio_noche
            INTO v_temp_id, v_temp_nombre, v_temp_precio
            FROM temporadas t
            JOIN tarifas ta ON ta.temporada_id = t.id
            WHERE t.activa = true
              AND v_fecha_actual >= t.fecha_inicio
              AND v_fecha_actual <= t.fecha_fin
              AND ta.adultos = 2
              AND ta.noches_min <= v_noches
              AND (ta.noches_max IS NULL OR ta.noches_max >= v_noches)
            ORDER BY t.prioridad DESC, ta.noches_min DESC
            LIMIT 1;
        END IF;

        -- If still no match, use a default
        IF v_temp_precio IS NULL THEN
            v_temp_nombre := 'Base';
            v_temp_precio := 145000;
        END IF;

        -- No weekday/weekend differentiation - same price every day
        v_total := v_total + v_temp_precio;

        -- Track segments for desglose
        IF v_temp_nombre != v_current_segment_name OR v_temp_precio != v_current_segment_price THEN
            -- Save previous segment
            IF v_current_segment_nights > 0 THEN
                IF v_desglose != '' THEN
                    v_desglose := v_desglose || ' | ';
                END IF;
                v_desglose := v_desglose || v_current_segment_name || ': ' ||
                    v_current_segment_nights || ' noches x $' || v_current_segment_price ||
                    ' = $' || (v_current_segment_nights * v_current_segment_price);
            END IF;
            -- Start new segment
            v_current_segment_name := v_temp_nombre;
            v_current_segment_price := v_temp_precio;
            v_current_segment_nights := 1;
        ELSE
            v_current_segment_nights := v_current_segment_nights + 1;
        END IF;

        -- Track temporada name (use the one with most nights)
        v_temporada_nombre := COALESCE(v_temporada_nombre, v_temp_nombre);

        v_fecha_actual := v_fecha_actual + 1;
    END LOOP;

    -- Add last segment to desglose
    IF v_current_segment_nights > 0 THEN
        IF v_desglose != '' THEN
            v_desglose := v_desglose || ' | ';
        END IF;
        v_desglose := v_desglose || v_current_segment_name || ': ' ||
            v_current_segment_nights || ' noches x $' || v_current_segment_price ||
            ' = $' || (v_current_segment_nights * v_current_segment_price);
    END IF;

    RETURN QUERY SELECT
        v_temporada_nombre,
        ROUND(v_total::NUMERIC / v_noches),
        v_noches,
        v_total,
        v_desglose;
END;
$$;
