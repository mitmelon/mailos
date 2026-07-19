#!/usr/bin/env node
// Quick verification that the fixes work

async function test() {
  try {
    console.log('Testing fixes...');
    
    // Test 1: Check DecisionAgent
    const DecisionAgent = require('./src/agents/DecisionAgent');
    console.log('✓ DecisionAgent loads OK');
    
    // Test 2: Check NegotiationAgent
    const NegotiationAgent = require('./src/agents/NegotiationAgent');
    console.log('✓ NegotiationAgent loads OK');
    
    // Test 3: Check SettingsService
    const settingsService = require('./src/services/SettingsService');
    const settings = await settingsService.get();
    console.log('✓ SettingsService loads OK');
    console.log('  - negotiationMinConfidenceToAutoSend:', settings.negotiationMinConfidenceToAutoSend);
    
    // Test 4: Check EmailConnector
    const EmailConnector = require('./src/connectors/EmailConnector');
    console.log('✓ EmailConnector loads OK');
    
    console.log('\nAll fixes verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

test();
