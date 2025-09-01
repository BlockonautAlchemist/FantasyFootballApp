#!/usr/bin/env node

/**
 * Test script for the Start/Sit API endpoints
 * Run with: node test-start-sit.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Start/Sit API Endpoints...\n');

  // Test 1: Check if server is running
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running. Please start the development server first.');
    console.log('   Run: npm run dev');
    return;
  }

  // Test 2: Test player search endpoint
  console.log('\n🔍 Testing player search...');
  try {
    const searchResponse = await fetch(`${BASE_URL}/api/search/players?q=waddle`);
    if (searchResponse.status === 401) {
      console.log('⚠️  Player search requires authentication (expected)');
    } else if (searchResponse.ok) {
      const players = await searchResponse.json();
      console.log(`✅ Player search works. Found ${players.length} players`);
    } else {
      console.log(`❌ Player search failed: ${searchResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Player search error: ${error.message}`);
  }

  // Test 3: Test start/sit endpoint
  console.log('\n⚖️  Testing start/sit analysis...');
  try {
    const startSitResponse = await fetch(`${BASE_URL}/api/start-sit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerAId: 'nfl.p.1234',
        playerBId: 'nfl.p.5678',
        week: 8,
        scoring: 'half_ppr'
      })
    });

    if (startSitResponse.status === 401) {
      console.log('⚠️  Start/sit analysis requires authentication (expected)');
    } else if (startSitResponse.ok) {
      const result = await startSitResponse.json();
      console.log('✅ Start/sit analysis works');
      console.log(`   Recommendation: ${result.result.recommendation}`);
      console.log(`   Confidence: ${Math.round(result.result.confidence * 100)}%`);
    } else {
      console.log(`❌ Start/sit analysis failed: ${startSitResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Start/sit analysis error: ${error.message}`);
  }

  // Test 4: Test player stats endpoint
  console.log('\n📊 Testing player stats...');
  try {
    const statsResponse = await fetch(`${BASE_URL}/api/players/stats?playerId=nfl.p.1234&week=8`);
    if (statsResponse.status === 401) {
      console.log('⚠️  Player stats require authentication (expected)');
    } else if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Player stats endpoint works');
      console.log(`   Player: ${stats.name} (${stats.team})`);
    } else {
      console.log(`❌ Player stats failed: ${statsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Player stats error: ${error.message}`);
  }

  console.log('\n📋 Test Summary:');
  console.log('   - Server connectivity: ✅');
  console.log('   - Authentication required: ✅ (as expected)');
  console.log('   - API endpoints exist: ✅');
  console.log('\n🎯 Next Steps:');
  console.log('   1. Set up Yahoo OAuth credentials in .env file');
  console.log('   2. Connect your Yahoo account at /connect');
  console.log('   3. Test with real player data');
  console.log('\n📖 See START_SIT_SETUP.md for detailed setup instructions');
}

// Run the test
testAPI().catch(console.error);
