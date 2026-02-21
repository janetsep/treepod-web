
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwcejrbiaflbebggvlrm.supabase.co';
const supabaseServiceKey = 'sb_publishable_E9CrbeVJbhBt5HDX_FWD9Q_hmJQFqWA'; // Key from .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    console.log('Checking user info@domostreepod.cl...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === 'info@domostreepod.cl');
    if (user) {
        console.log('User found:', {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            last_sign_in_at: user.last_sign_in_at
        });
    } else {
        console.log('User NOT found in this project.');
        console.log('Available users:', users.map(u => u.email));
    }
}

checkUser();
