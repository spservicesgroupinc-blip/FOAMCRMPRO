const BASE_URL = 'https://ep-dawn-surf-ai3tspyx.apirest.c-4.us-east-1.aws.neon.tech/neondb/rest/v1';
const USER = 'neondb_owner';
const PASS = 'npg_u7ypSIrGg9Ek';

const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');

console.log('Testing Basic Auth to:', BASE_URL);

fetch(`${BASE_URL}/customers?select=*&limit=1`, {
    headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
    }
})
    .then(async (response) => {
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    })
    .catch((e) => {
        console.error('Error:', e);
    });
