import axios from 'axios';

interface ContractData {
  source: string;
  publish_height: number;
  contract_id: string;
}

interface ContractEventsResponse {
  results: Array<{
    event_type: string;
    data: any;
    block_time: string;
    tx_id: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}

// Fetch contract source code
export async function getClaritySourceCode(contractId: string): Promise<ContractData> {
  try {
    const [address, name] = contractId.split('.');
    if (!address || !name) {
      throw new Error('Invalid contract ID format. Expected format: address.contract-name');
    }
    
    console.log(`Fetching contract source for ${contractId}`);
    const url = `https://api.mainnet.hiro.so/v2/contracts/source/${address}/${name}`;
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.data || !response.data.source) {
      throw new Error('Contract source not found or invalid response format');
    }
    
    return {
      ...response.data,
      contract_id: contractId
    };
  } catch (error) {
    console.error('Error fetching contract source:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMsg = error.response.data?.error || error.response.statusText || error.message;
        throw new Error(`Failed to fetch contract source (${error.response.status}): ${errorMsg}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from Hiro API. Please try again later.');
      }
    }
    // Generic error
    throw new Error('Failed to fetch contract source: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Fetch contract events/transactions
export async function getContractTransactions(contractId: string, limit = 20): Promise<ContractEventsResponse> {
  try {
    console.log(`Fetching contract transactions for ${contractId}`);
    const url = `https://api.mainnet.hiro.so/extended/v1/contract/${contractId}/events?limit=${limit}`;
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Return empty results if API doesn't return expected format
    if (!response.data || !Array.isArray(response.data.results)) {
      console.warn('Contract events API returned unexpected format:', response.data);
      return {
        results: [],
        total: 0,
        limit,
        offset: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching contract events:', error);
    
    // Return empty data instead of throwing to allow the analysis to continue
    // even without transaction data
    return {
      results: [],
      total: 0,
      limit,
      offset: 0
    };
  }
}

// Fetch specific transaction details
export async function getTransactionDetails(txId: string) {
  try {
    const url = `https://api.mainnet.hiro.so/extended/v1/tx/${txId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to fetch transaction details: ${error.response.data.error || error.message}`);
    }
    throw new Error('Failed to fetch transaction details');
  }
}

// Check if a string is a transaction ID
export function isTransactionId(input: string): boolean {
  // Transaction IDs are 64 character hex strings
  return /^0x[0-9a-fA-F]{64}$/.test(input);
}

// Check if a string is a contract ID
export function isContractId(input: string): boolean {
  // Contract IDs are in the format of address.contract-name
  return /^S[0-9A-Z]{1,40}\.[a-zA-Z0-9_-]+$/.test(input);
}