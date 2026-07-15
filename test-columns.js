const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, 'apps/web/.env.local'), 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const columnsToTest = [
  'id',
  'avatar_url',
  'full_name',
  'education',
  'experience',
  'role',
  'github_url',
  'linkedin_url',
  'theme',
  'motion_pref',
  'notifications',
  'demo_mode',
  'ai_preferences'
];

async function testColumn(col) {
  const dummyPayload = {
    id: '00000000-0000-0000-0000-000000000000' // dummy uuid
  };
  if (col !== 'id') {
    dummyPayload[col] = col === 'notifications' || col === 'demo_mode' ? true : (col === 'ai_preferences' ? {} : 'dummy');
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(dummyPayload)
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch(e) {}

  if (res.status >= 400) {
    if (text.includes('column') && (text.includes('does not exist') || text.includes('Could not find'))) {
      return { col, exists: false, error: json || text };
    }
  }
  return { col, exists: true, error: json || text };
}

async function run() {
  console.log("Testing columns against remote Supabase...");
  const results = [];
  for (const col of columnsToTest) {
    const result = await testColumn(col);
    results.push(result);
    console.log(`Column ${col}: ${result.exists ? 'EXISTS' : 'MISSING'} (${result.error.message || JSON.stringify(result.error)})`);
  }
}

run().catch(console.error);
