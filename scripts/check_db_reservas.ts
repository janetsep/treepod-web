import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line: string) => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let val = match[2] || '';
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            process.env[match[1]] = val;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReservas() {
    console.log("🔍 Revisando reservas reales en Supabase desde el 07 de Marzo...");
    
    const { data, error } = await supabase
        .from('reservas')
        .select('id, estado, total, created_at, email, payment_intent_id')
        .gte('created_at', '2026-03-07T00:00:00.000Z')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("❌ Error DB:", error);
        return;
    }

    const pagadas = data?.filter(r => r.estado === 'pagado') || [];
    const confirmadas = data?.filter(r => r.estado === 'confirmada') || [];
    const pendientes = data?.filter(r => r.estado === 'pendiente_pago') || [];
    
    console.log(`\n✅ Total de reservas desde el 07/03: ${data?.length}`);
    console.log(`✅ Reservas en estado 'pagado': ${pagadas.length}`);
    console.log(`✅ Reservas en estado 'confirmada': ${confirmadas.length}`);
    console.log(`✅ Reservas en estado 'pendiente_pago': ${pendientes.length}`);
    
    if (data && data.length > 0) {
        console.log("\n💰 Últimas 5 reservas de cualquier tipo:");
        data.slice(0, 5).forEach(r => {
            console.log(`   - ID: ${r.id} | Fecha: ${r.created_at} | Estado: ${r.estado} | Total: $${r.total} | Email: ${r.email}`);
        });
    }
}

checkReservas();
