const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, 'apps/web/.env.local'), 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

console.log("URL:", supabaseUrl);

// Query profiles table directly
fetch(`${supabaseUrl}/rest/v1/profiles?select=*&limit=1`, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Range-Unit': 'items',
    Range: '0-0'
  }
})
.then(async res => {
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("Body:", text);
})
.catch(console.error);
