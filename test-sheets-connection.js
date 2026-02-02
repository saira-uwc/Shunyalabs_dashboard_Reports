/**
 * Test script to verify Google Sheets connection
 * Run: node test-sheets-connection.js
 */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxor9Iu_orul6S6J6msmVTW69zVFSYd324EKvrQ4eDFKkCYttEl3a0d3WNuBrZIqaJ3yQ/exec';

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets connection...\n');
  
  const testData = {
    timestamp: new Date().toISOString(),
    moduleName: 'Test Module',
    testPoint: 'Connection Test',
    status: 'PASS',
    output: 'This is a test to verify the Apps Script is working'
  };

  try {
    console.log('📤 Sending test data to Apps Script...');
    console.log('   URL:', WEB_APP_URL);
    console.log('   Data:', JSON.stringify(testData, null, 2));
    console.log('');

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response:', responseText);
    console.log('');

    // Check if response is JSON (success) or HTML (error)
    if (responseText.includes('<!DOCTYPE html>')) {
      console.log('❌ ERROR: Apps Script returned an HTML error page');
      console.log('   This means your Apps Script code has an error.');
      console.log('   Please fix the Apps Script code (see instructions below).\n');
      return false;
    }

    try {
      const result = JSON.parse(responseText);
      if (result.success) {
        console.log('✅ SUCCESS! Apps Script is working correctly!');
        console.log('   Check your Google Sheet - you should see a new row.');
        console.log('   Your tests will now write to the sheet automatically.\n');
        return true;
      } else {
        console.log('⚠️  Apps Script responded but returned success: false');
        console.log('   Error:', result.error);
        return false;
      }
    } catch (parseError) {
      console.log('❌ ERROR: Could not parse response as JSON');
      console.log('   Response was:', responseText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Failed to connect to Apps Script');
    console.log('   Error:', error.message);
    console.log('');
    return false;
  }
}

// Run the test
testGoogleSheets().then(success => {
  if (!success) {
    console.log('📋 TO FIX YOUR APPS SCRIPT:');
    console.log('   1. Go to: https://script.google.com/home/projects');
    console.log('   2. Open your project');
    console.log('   3. Delete ALL existing code');
    console.log('   4. Paste the code from APPS-SCRIPT-CODE.md');
    console.log('   5. Save and Deploy → Manage deployments → Edit → Deploy');
    console.log('   6. Run this test again: node test-sheets-connection.js\n');
    process.exit(1);
  } else {
    process.exit(0);
  }
});
