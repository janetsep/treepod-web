
import { supabase } from "@/lib/supabase";

/**
 * Fetches the base price for a standard stay (2 adults, 1 night)
 * for a date 7 days from now, to be used as a "From" price.
 * Returns formatted price string (e.g. "155.000") or null on failure.
 */
/**
 * Fetches the total price for a stay of `nights` length, starting 7 days from now.
 * Returns the raw number or null.
 */
export async function getDomoPriceForNights(nights: number = 1): Promise<number | null> {
    try {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const checkIn = futureDate.toISOString().split('T')[0];

        // checkOut is checkIn + nights
        const checkOutDate = new Date(futureDate);
        checkOutDate.setDate(checkOutDate.getDate() + nights);
        const checkOut = checkOutDate.toISOString().split('T')[0];

        const { data, error } = await supabase.rpc("calcular_precio", {
            p_fecha_inicio: checkIn,
            p_fecha_fin: checkOut,
            p_adultos: 2
        });

        if (error) {
            console.error(`[Pricing] Error fetching price for ${nights} nights:`, error);
            return null;
        }

        if (data && data.length > 0) {
            const price = data[0].precio_total || data[0].total; // Handle potential varied RPC field names
            if (typeof price === 'number' && !isNaN(price)) {
                return price;
            }
        }
        return null;
    } catch (err) {
        console.error(`[Pricing] Error in getDomoPriceForNights(${nights}):`, err);
        return null;
    }
}

/**
 * Legacy wrapper ensuring string format for single night
 */
export async function getDomoBasePrice(): Promise<string | null> {
    const price = await getDomoPriceForNights(1);
    return price ? new Intl.NumberFormat('es-CL').format(price) : null;
}
