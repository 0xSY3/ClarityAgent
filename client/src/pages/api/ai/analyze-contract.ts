import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-e9a0aea0e5644f56bda348c649c26598';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Define response type
type AnalysisResponse = {
  summary: string;
  description: string;
  securityScore: string; 
  riskLevel: string;
  features: string[];
  functions: string[];
  security: {
    issues: Array<{
      severity: string;
      description: string;
      recommendation: string;
    }>;
    bestPractices: {
      followed: string[];
      missing: string[];
    };
  };
  error?: string;
};

// Function to pre-analyze contract for suspicious patterns
function preAnalyzeContract(source: string): {
  isPotentiallyMalicious: boolean;
  repetitivePatterns: boolean;
  suspiciousContracts: string[];
  repetitiveOps: number;
} {
  const result = {
    isPotentiallyMalicious: false,
    repetitivePatterns: false,
    suspiciousContracts: [],
    repetitiveOps: 0
  };

  // Check for repetitive swap operations (common in malicious contracts)
  const swapMatches = source.match(/swap-\d+/g);
  if (swapMatches && swapMatches.length > 5) {
    result.repetitivePatterns = true;
    result.repetitiveOps = swapMatches.length;
  }

  // Check for known suspicious contract patterns
  const suspiciousContractMatches = source.match(/contract-call\?\s+'([^']+)/g);
  if (suspiciousContractMatches) {
    const uniqueContracts = new Set();
    suspiciousContractMatches.forEach(match => {
      // Extract contract address
      const contract = match.replace(/contract-call\?\s+'/, '');
      uniqueContracts.add(contract);
    });
    result.suspiciousContracts = Array.from(uniqueContracts) as string[];
  }

  // Set malicious flag if we have repetitive patterns and suspicious contracts
  if (result.repetitivePatterns && result.suspiciousContracts.length > 0) {
    result.isPotentiallyMalicious = true;
  }

  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse>
) {
  // Set a longer timeout for the API route
  res.setHeader('Connection', 'keep-alive');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      summary: '',
      description: '',
      securityScore: '0',
      riskLevel: 'HIGH',
      features: [],
      functions: [],
      security: { issues: [], bestPractices: { followed: [], missing: [] } }
    });
  }

  try {
    const { source, events, contractId } = req.body;

    console.log(`Analyzing contract: ${contractId}`);
    console.log(`Source code length: ${source?.length || 0} characters`);
    console.log(`Number of events: ${events?.length || 0}`);

    if (!source) {
      return res.status(400).json({ 
        error: 'Contract source is required',
        summary: '',
        description: '',
        securityScore: '0',
        riskLevel: 'HIGH',
        features: [],
        functions: [],
        security: { issues: [], bestPractices: { followed: [], missing: [] } }
      });
    }

    // Perform pre-analysis for suspicious patterns
    const preAnalysis = preAnalyzeContract(source);
    console.log("Pre-analysis results:", preAnalysis);

    // If contract is likely malicious, skip the DeepSeek analysis
    if (preAnalysis.isPotentiallyMalicious) {
      console.log("Contract detected as potentially malicious, skipping DeepSeek API");
      
      // Generate local analysis for suspicious contract
      return res.status(200).json({
        summary: "Potential security risk detected in this contract",
        description: `This contract contains patterns commonly found in malicious contracts. It makes multiple repetitive operations (${preAnalysis.repetitiveOps} similar calls detected) which may indicate an attempt to drain funds or abuse a protocol.`,
        securityScore: "10",
        riskLevel: "HIGH",
        features: ["Multiple repetitive operations", "External contract calls"],
        functions: source.match(/define-public\s+\(([^)]+)/g)?.map(f => f.replace('define-public (', '')) || ["Unknown functions"],
        security: {
          issues: [
            {
              severity: "HIGH",
              description: "Multiple repetitive swap operations detected which is a common pattern in malicious contracts",
              recommendation: "Review the contract carefully before interacting with it. Consider consulting a security expert."
            },
            {
              severity: "HIGH",
              description: `Suspicious external contract calls to ${preAnalysis.suspiciousContracts.join(', ')}`,
              recommendation: "Verify the legitimacy of these external contracts"
            }
          ],
          bestPractices: {
            followed: [],
            missing: [
              "Avoid repetitive identical operations",
              "Include proper documentation for contract purpose",
              "Implement reasonable operation limits"
            ]
          }
        }
      });
    }

    // System prompt for DeepSeek
    const systemPrompt = `You are ClarityAI, an expert in analyzing Clarity smart contracts for the Stacks blockchain.
    
Your task is to analyze contracts and provide detailed, accurate information in the following JSON structure:

{
  "summary": "A concise 1-2 sentence summary of what the contract does",
  "description": "A more detailed explanation of the contract's purpose and functionality",
  "securityScore": "A number from 0-100 reflecting the contract's security",
  "riskLevel": "HIGH, MEDIUM, or LOW based on security analysis",
  "features": ["List of key features this contract implements"],
  "functions": ["List of public functions and what they do"],
  "security": {
    "issues": [
      {
        "severity": "HIGH/MEDIUM/LOW",
        "description": "Description of the security issue",
        "recommendation": "How to fix or mitigate the issue"
      }
    ],
    "bestPractices": {
      "followed": ["Security best practices the contract follows"],
      "missing": ["Important security practices the contract should implement"]
    }
  }
}

Be thorough in your analysis, especially regarding security concerns, but don't invent issues if none exist.`;

    // User prompt with contract details
    const userPrompt = `Please analyze this Clarity smart contract ${contractId}:
    
\`\`\`
${source}
\`\`\`

${events ? `Recent contract events/transactions:
${JSON.stringify(events.slice(0, 5), null, 2)}
` : ''}

Provide a comprehensive analysis following the JSON format in your instructions. Include:
1. Overall purpose and functionality
2. Security score (0-100) and risk level
3. Key features and public functions
4. Security issues with severity levels
5. Best practices followed and missing`;

    // Call DeepSeek API with retry logic
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Attempt ${retries + 1} to call DeepSeek API`);
        
        response = await axios.post(DEEPSEEK_API_URL, {
          model: 'deepseek-chat',
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 4000
        }, {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        });
        
        break; // If successful, exit the retry loop
      } catch (error) {
        console.error(`DeepSeek API error (attempt ${retries + 1}):`, error);
        retries++;
        
        if (retries > maxRetries) {
          throw error; // Re-throw after max retries
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    // Extract and parse JSON from response
    const aiResponse = response.data.choices[0].message.content;
    console.log("AI Response received, length:", aiResponse.length);
    
    // Create a default response in case JSON parsing fails
    const defaultResponse = {
      summary: "Analysis completed with limited information",
      description: "The contract was analyzed but detailed information could not be extracted. The contract appears to be a Clarity smart contract on the Stacks blockchain.",
      securityScore: "50",
      riskLevel: "MEDIUM",
      features: ["Unknown features"],
      functions: ["Unknown functions"],
      security: {
        issues: [{
          severity: "MEDIUM",
          description: "Unable to perform complete security analysis",
          recommendation: "Manual review recommended"
        }],
        bestPractices: {
          followed: [],
          missing: ["Complete analysis not available"]
        }
      }
    };
    
    // Find JSON in response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    let parsedResponse;
    
    if (!jsonMatch) {
      console.warn('No JSON found in AI response. Using default response.');
      parsedResponse = defaultResponse;
    } else {
      try {
        // Parse the JSON
        parsedResponse = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed JSON response");
      } catch (parseError) {
        console.error('Error parsing JSON from AI response:', parseError);
        parsedResponse = defaultResponse;
      }
    }
    
    return res.status(200).json({
      summary: parsedResponse.summary || "Unable to generate summary",
      description: parsedResponse.description || "Unable to generate description",
      securityScore: parsedResponse.securityScore || "0",
      riskLevel: parsedResponse.riskLevel || "HIGH",
      features: parsedResponse.features || [],
      functions: parsedResponse.functions || [],
      security: parsedResponse.security || { 
        issues: [], 
        bestPractices: { followed: [], missing: [] } 
      }
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return res.status(200).json({
      error: 'Failed to analyze contract',
      summary: 'Potential security concerns detected',
      description: 'This contract contains patterns that may be concerning. Manual review by a security expert is strongly recommended before interacting with this contract.',
      securityScore: '0',
      riskLevel: 'HIGH',
      features: ['Multiple external contract calls', 'Repetitive operation patterns'],
      functions: [],
      security: {
        issues: [
          {
            severity: 'HIGH',
            description: 'Analysis failed, but contract patterns suggest potential security concerns',
            recommendation: 'Do not interact with this contract without thorough review by a security expert'
          }
        ],
        bestPractices: {
          followed: [],
          missing: ['Proper documentation', 'Clear purpose']
        }
      }
    });
  }
}