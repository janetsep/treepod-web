import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await supabase
    .from("reservas")
    .select("*, reserva_servicios(*, servicios(nombre))")
    .limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);
}
run();
