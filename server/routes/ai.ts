import { Router } from 'express';
import OpenAI from 'openai';
import axios from 'axios';

const router = Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL;

if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL) {
  console.error('DEEPSEEK_API_KEY or DEEPSEEK_API_URL is not set in environment variables.');
  // You might want to return an error here, or use a default value
}

const SYSTEM_MESSAGE = `You are ClarityAI, an AI assistant specialized in the Stacks blockchain ecosystem. You help users understand:

1. Stacks blockchain architecture and capabilities
2. Clarity smart contract development 
3. Network features and cross-chain interactions with Bitcoin
4. Performance metrics and statistics
5. Best practices for building on Stacks

Keep responses concise, technical but approachable, and always accurate. If uncertain, admit limitations.`;

const CONTRACT_SYSTEM_MESSAGE = `You are a smart contract generation AI specialized in creating secure and optimized Clarity smart contracts for the Stacks blockchain. Follow these strict guidelines:

1. Use Clarity language features optimized for Stacks:
   - Post-conditions for transaction safety
   - Principal types for addresses
   - Built-in Bitcoin integration
   - trait support for interfaces

2. Security and Standards:
   - Follow Clarity security best practices
   - Use safe arithmetic operations
   - Implement proper authorization checks
   - Add post-conditions for sensitive operations

3. Stacks-Specific Features:
   - Utilize Bitcoin integration when relevant
   - Implement efficient storage patterns
   - Consider block confirmation times
   - Use appropriate clarity types

4. Code Structure:
   - Include comprehensive documentation
   - Add detailed inline comments
   - Implement proper error handling
   - Use modular design patterns`;

const CONTRACT_SUMMARY_MESSAGE = `You are a smart contract analyzer specialized in explaining Solidity contracts in a clear, human-readable format. For each contract analysis:

1. Provide a high-level overview of what the contract does
2. Explain the main features and functionality
3. Break down important functions and their purposes
4. Identify key state variables and their roles
5. Highlight any special mechanisms or patterns used
6. Note any external interactions or dependencies
7. Explain access control and permissions

Format your response in this structure:
{
  "overview": "Brief 1-2 sentence description of what the contract does",
  "purpose": "Detailed explanation of the contract's main purpose and use cases",
  "features": [
    {
      "name": "Feature name",
      "description": "Clear explanation of what this feature does"
    }
  ],
  "functions": [
    {
      "name": "Function name",
      "purpose": "What this function does",
      "access": "Who can call this function"
    }
  ],
  "stateVariables": [
    {
      "name": "Variable name",
      "purpose": "What this variable is used for"
    }
  ],
  "specialNotes": [
    "Any important notes about security, patterns, or special considerations"
  ]
}`;

const SECURITY_ANALYSIS_MESSAGE = `You are a smart contract security auditor specialized in analyzing Clarity contracts for the Stacks blockchain. For each analysis:

1. Check for common vulnerabilities in Clarity
2. Review post-conditions implementation
3. Analyze principal handling and authorization
4. Check Bitcoin integration security
5. Verify proper read-only vs read-write separation
6. Assess data variable persistence patterns
7. Review Clarity type safety

Provide your analysis in this JSON format:
{
  "overallRisk": "high|medium|low",
  "issues": [
    {
      "severity": "high|medium|low",
      "description": "Clear explanation of the issue",
      "line": "Line number if applicable",
      "snippet": "Relevant code snippet showing the issue",
      "impact": "Description of potential impact",
      "recommendation": "Specific recommendation to fix the issue"
    }
  ]
}`;

const TEST_GENERATION_MESSAGE = `You are a smart contract test suite generator specialized in creating comprehensive tests for Clarity contracts on Stacks. Generate tests that:

1. Cover contract functionality
2. Include post-condition tests
3. Test principal authorization
4. Verify Bitcoin integration
5. Check read-only functions
6. Test data persistence

Format each test case:
{
  "name": "Test case name",
  "description": "What this test verifies",
  "code": "Complete test code in Clarity",
  "type": "unit|integration|security",
  "coverage": {
    "functions": ["Function names covered"],
    "conditions": ["Post-conditions tested"]
  }
}`;

const TRANSACTION_ANALYSIS_MESSAGE = `You are a Stacks blockchain transaction analyzer. Explain transactions in detail:

1. Transaction Overview: Type, purpose, and main action
2. Function Details: Name, parameters, and purpose
3. Asset Movements: STX or token transfers with amounts
4. Contract Interactions: Which contracts are called and why
5. Post-conditions: What guarantees the transaction provides
6. Impact: What changed as a result

Return analysis in this format:
{
  "overview": "Brief summary of transaction purpose",
  "type": "Transaction type (contract-call, token-transfer, etc)",
  "details": {
    "function": {
      "name": "Function name if applicable",
      "purpose": "What the function does",
      "parameters": ["List of parameters and their values"]
    },
    "transfers": [{
      "asset": "STX or token name",
      "amount": "Amount transferred",
      "from": "Sender address",
      "to": "Recipient address"
    }],
    "contractInteractions": [{
      "contract": "Contract identifier",
      "action": "What was done with this contract"
    }]
  },
  "impact": "Final result of this transaction",
  "postConditions": ["List of transaction guarantees"]
}`;

// Helper function for Deepseek API calls
async function callDeepseekAPI(messages: any[], temperature = 0.7, maxTokens = 2000) {
  if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL) {
    console.error('DEEPSEEK_API_KEY or DEEPSEEK_API_URL is not set in environment variables.');
    throw new Error('Internal Server Error: Deepseek API key or URL not configured.');
  }

  const response = await axios.post(DEEPSEEK_API_URL, {
    messages,
    temperature,
    max_tokens: maxTokens,
    model: 'deepseek-chat',
  }, {
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await callDeepseekAPI([
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "user", content: message }
    ]);

    const reply = completion.choices[0].message.content;
    res.json({ message: reply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

interface GenerateContractRequest {
  description: string;
  features?: string[];
  contractType?: string;
}

router.post('/generate', async (req, res) => {
  try {
    const { description, features } = req.body;
    
    const prompt = `Generate a Clarity smart contract for Stacks blockchain:

Description: ${description}

${features?.length ? `Features:
${features.map((f: string) => `- ${f}`).join('\n')}` : ''}

Requirements:
1. Use proper Clarity syntax and types
2. Implement post-conditions for safety
3. Use appropriate principal handling
4. Consider Bitcoin integration
5. Add comprehensive documentation

Return clean Clarity code with detailed comments.`;

    const completion = await callDeepseekAPI([
      { role: "system", content: CONTRACT_SYSTEM_MESSAGE },
      { role: "user", content: prompt }
    ], 0.2, 4000);

    const code = completion.choices[0].message.content || '';
    const cleanedCode = code.replace(/```solidity|```/g, '').trim();
    
    res.json({ code: cleanedCode });
  } catch (error) {
    console.error('Contract Generation Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate contract' });
  }
});

router.post('/generate-tests', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const prompt = `Generate a comprehensive test suite for this Solidity smart contract:

${code}

Create tests that:
1. Cover all major contract functionality
2. Include unit tests for individual functions
3. Add integration tests for contract interactions
4. Implement security-focused test cases
5. Include gas optimization tests
6. Consider Mantle L2-specific scenarios

Return an array of test cases in the specified JSON format with name, description, code, type, coverage, and expected fields.`;

    const completion = await callDeepseekAPI([
      { role: "system", content: TEST_GENERATION_MESSAGE },
      { role: "user", content: prompt }
    ], 0.2, 4000);

    const testsText = completion.choices[0].message.content || '';
    
    // Extract JSON from the response
    const jsonMatch = testsText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid test format received');
    }

    const tests = JSON.parse(jsonMatch[0]);
    
    res.json(tests);
  } catch (error) {
    console.error('Test Generation Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate tests' });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const prompt = `Analyze this Solidity smart contract and provide a clear, human-readable summary:

${code}

Please explain:
1. What the contract does
2. Its main features and functionality
3. Important functions and their purposes
4. Key state variables
5. Any special mechanisms or patterns
6. External interactions
7. Access control and permissions

Return the analysis in the specified JSON format with overview, purpose, features, functions, stateVariables, and specialNotes.`;

    const completion = await callDeepseekAPI([
      { role: "system", content: CONTRACT_SUMMARY_MESSAGE },
      { role: "user", content: prompt }
    ], 0.1, 3000);

    const summaryText = completion.choices[0].message.content || '';
    
    // Extract JSON from the response
    const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid summary format received');
    }

    const summary = JSON.parse(jsonMatch[0]);
    
    res.json(summary);
  } catch (error) {
    console.error('Contract Summary Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate contract summary' });
  }
});

// Update analyze endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const prompt = `Analyze this Clarity smart contract for security issues:

${code}

Focus on:
1. Authorization vulnerabilities
2. Post-condition coverage
3. Principal validation
4. Asset handling
5. Read/write function separation
6. Data persistence issues
7. Bitcoin integration security`;

    const response = await callDeepseekAPI([
      { role: "system", content: SECURITY_ANALYSIS_MESSAGE },
      { role: "user", content: prompt }
    ]);

    const analysisText = response.choices[0].message.content;
    
    // Better JSON extraction and validation
    let analysis;
    try {
      // Remove any markdown formatting
      const cleanJson = analysisText.replace(/```json\n|\n```|```/g, '');
      analysis = JSON.parse(cleanJson);
    } catch (error) {
      throw new Error('Invalid analysis format received');
    }

    // Validate required fields
    if (!analysis.overallRisk || !Array.isArray(analysis.issues)) {
      throw new Error('Incomplete analysis response');
    }

    res.json({
      overallRisk: analysis.overallRisk,
      issues: analysis.issues.map(issue => ({
        severity: issue.severity || 'medium',
        description: issue.description,
        line: issue.line,
        snippet: issue.snippet,
        impact: issue.impact,
        recommendation: issue.recommendation
      }))
    });

  } catch (error) {
    console.error('Security Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to perform security analysis',
      issues: [{
        severity: 'medium',
        description: error instanceof Error ? error.message : 'Analysis failed'
      }]
    });
  }
});

router.post('/analyze-transaction', async (req, res) => {
  try {
    const { transaction } = req.body;
    
    const prompt = `Analyze this Stacks transaction in detail:
    ${JSON.stringify(transaction, null, 2)}
    
    Provide a comprehensive analysis including:
    1. What is the main purpose of this transaction?
    2. What functions were called with what parameters?
    3. What assets were transferred between which addresses?
    4. What contracts were interacted with?
    5. What guarantees (post-conditions) were provided?
    6. What was the final impact of this transaction?`;

    const completion = await callDeepseekAPI([
      { role: "system", content: TRANSACTION_ANALYSIS_MESSAGE },
      { role: "user", content: prompt }
    ]);

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/analyze-contract', async (req, res) => {
  try {
    const { source, events } = req.body;
    
    const prompt = `Analyze this Clarity smart contract:
    ${source}

    Contract Events:
    ${JSON.stringify(events, null, 2)}

    Provide:
    1. Overall purpose and functionality
    2. Public functions and their uses
    3. Asset handling mechanisms
    4. Storage patterns
    5. Recent contract activity
    
    Format as JSON with summary, description, features, and functions.`;

    const completion = await callDeepseekAPI([
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "user", content: prompt }
    ]);

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Helper function to calculate overall risk if not provided
function calculateOverallRisk(issues: any[]): string {
  if (issues.some(i => i.severity === 'high')) return 'high';
  if (issues.some(i => i.severity === 'medium')) return 'medium';
  if (issues.length > 0) return 'low';
  return 'safe';
}

export default router;
