
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iwcejrbiaflbebggvlrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y2VqcmJpYWZsYmViZ2d2bHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTY4NzQsImV4cCI6MjA4MTEzMjg3NH0.ekG7kzYP2GLtmeE_WIZf9Sw_n1ZpeoKAaWnb0iuXL2I';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReservations() {
    const { data, error } = await supabase
        .from('reservas')
        .select('id, email, estado, total, created_at, fuente')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error(JSON.stringify(error));
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkReservations();
