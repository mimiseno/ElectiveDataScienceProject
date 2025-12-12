#!/usr/bin/env node

/**
 * Database Setup Checker
 * Verifies Supabase connection and checks if required tables exist
 */

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please check your .env.local file');
  process.exit(1);
}

console.log('🔍 Checking Supabase connection...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

const requiredTables = [
  'users',
  'customers',
  'sales',
  'sales_forecasts',
  'dataset_uploads',
  'activity_logs',
  'segment_distributions',
  'dashboard_stats',
  'customer_recommendations'
];

async function checkTable(tableName) {
  return new Promise((resolve) => {
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=count&limit=1`;
    
    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    };

    const req = https.request(url, options, (res) => {
      if (res.statusCode === 200) {
        console.log(`  ✓ ${tableName}`);
        resolve(true);
      } else {
        console.log(`  ✗ ${tableName} - Status: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log(`  ✗ ${tableName} - Error: ${error.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('📊 Checking required tables:\n');
  
  let allTablesExist = true;
  for (const table of requiredTables) {
    const exists = await checkTable(table);
    if (!exists) allTablesExist = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('\n✅ All required tables exist!');
    console.log('Your database is ready to use.\n');
  } else {
    console.log('\n❌ Some tables are missing!');
    console.log('\n📝 To fix this:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content from supabase_schema.sql');
    console.log('4. Click "Run" to create all tables\n');
    console.log('5. Run this check again: node check-db.js\n');
  }
}

main().catch(console.error);
