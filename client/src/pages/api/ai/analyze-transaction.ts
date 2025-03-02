import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-c07d6ddbdc374c4a969374b0fb21c8b6';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

type TransactionAnalysisResponse = {
  summary: string;
  txType: string;
  operation: string;
  assets: Array<{
    type: string;
    amount: string;
    from: string;
    to: string;
  }>;
  contracts: Array<{
    id: string;
    action: string;
  }>;
  details: Record<string, any>;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionAnalysisResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      summary: '',
      txType: '',
      operation: '',
      assets: [],
      contracts: [],
      details: {}
    });
  }

  try {
    const { transaction } = req.body;

    if (!transaction) {
      return res.status(400).json({ 
        error: 'Transaction data is required',
        summary: '',
        txType: '',
        operation: '',
        assets: [],
        contracts: [],
        details: {}
      });
    }

    // System prompt for DeepSeek
    const systemPrompt = `You are a Stacks blockchain transaction analyzer. Your task is to analyze transaction data and provide a clear, human-readable explanation.

Return your analysis in this JSON format:
{
  "summary": "One sentence summary of what this transaction does",
  "txType": "The transaction type (contract-call, token-transfer, etc)",
  "operation": "The specific operation being performed",
  "assets": [
    {
      "type": "STX or token name",
      "amount": "Amount transferred",
      "from": "Sender address",
      "to": "Recipient address"
    }
  ],
  "contracts": [
    {
      "id": "Contract identifier",
      "action": "What this transaction does with the contract"
    }
  ],
  "details": {
    "function": "Function called if applicable",
    "args": ["Function arguments"],
    "result": "Transaction result if available"
  }
}`;

    // User prompt with transaction details
    const userPrompt = `Analyze this Stacks blockchain transaction:
    
${JSON.stringify(transaction, null, 2)}

Provide a comprehensive analysis following the JSON format in your instructions.`;

    // Call DeepSeek API
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract and parse JSON from response
    const aiResponse = response.data.choices[0].message.content;
    
    // Find JSON in response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    // Parse the JSON
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    return res.status(200).json({
      summary: parsedResponse.summary || "Unable to analyze transaction",
      txType: parsedResponse.txType || "Unknown",
      operation: parsedResponse.operation || "Unknown operation",
      assets: parsedResponse.assets || [],
      contracts: parsedResponse.contracts || [],
      details: parsedResponse.details || {}
    });
  } catch (error) {
    console.error('Transaction Analysis Error:', error);
    return res.status(500).json({
      error: 'Failed to analyze transaction',
      summary: 'Error during analysis',
      txType: 'Unknown',
      operation: 'Unknown',
      assets: [],
      contracts: [],
      details: {
        error: 'The system encountered an error while analyzing this transaction'
      }
    });
  }
}