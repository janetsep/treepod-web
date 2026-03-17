require('dotenv').config({ path: '.env.local' });
console.log('Commerce:', process.env.TRANSBANK_COMMERCE_CODE);
console.log('Key:', process.env.TRANSBANK_API_KEY);
