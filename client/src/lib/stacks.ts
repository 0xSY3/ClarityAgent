import axios from 'axios';

interface ContractData {
  source: string;
  publish_height: number;
  contract_id: string;
}

export async function getClaritySourceCode(contractId: string): Promise<ContractData> {
  const [address, name] = contractId.split('.');
  const url = `https://api.mainnet.hiro.so/v2/contracts/source/${address}/${name}`;
  const response = await axios.get(url);
  return response.data;
}

export async function getContractEvents(contractId: string) {
  const url = `https://api.mainnet.hiro.so/extended/v1/contract/${contractId}/events`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch contract events');
  }
}

export async function getContractTransactions(contractId: string) {
  const url = `https://api.mainnet.hiro.so/extended/v1/contract/${contractId}/events`;
  const response = await axios.get(url);
  return response.data;
}