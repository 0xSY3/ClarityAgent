import React, { useState, useEffect } from "react";
import { 
  getClaritySourceCode, 
  getContractTransactions, 
  getTransactionDetails,
  isTransactionId,
  isContractId
} from "@/lib/stacks";
import { Navbar } from "@/components/ui/navbar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CodeBlock, 
  CodeBlockContent, 
  CodeBlockHeader
} from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Code,
  Activity,
  Info
} from "lucide-react";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { Badge } from "@/components/ui/badge";

// Interface for contract analysis response
interface ContractAnalysisResponse {
  contractId: string;
  sourceCode: string;
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
  transactionActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Interface for transaction analysis response
interface TransactionAnalysisResponse {
  txId: string;
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
}

export default function Decoder() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractResult, setContractResult] = useState<ContractAnalysisResponse | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleDecode = async () => {
    if (!inputValue) {
      toast({
        title: "Input Required",
        description: "Please enter a contract ID or transaction ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setContractResult(null);
    setTransactionResult(null);

    try {
      // Determine if input is a transaction ID or contract ID
      if (isTransactionId(inputValue)) {
        await analyzeTransaction(inputValue);
      } else if (isContractId(inputValue)) {
        await analyzeContract(inputValue);
      } else {
        throw new Error("Invalid input format. Please enter a valid contract ID (address.contract-name) or transaction ID (0x...)");
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze input",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeContract = async (contractId: string) => {
    try {
      // First try to get the source code, which is essential
      const sourceData = await getClaritySourceCode(contractId);
      
      // If we have source code, continue with analysis
      if (sourceData && sourceData.source) {
        // Get events data - but make it optional (don't let it fail the whole analysis)
        let eventsData;
        try {
          eventsData = await getContractTransactions(contractId, 10);
        } catch (eventError) {
          console.warn("Could not fetch contract events:", eventError);
          eventsData = { results: [] };
        }

        // Set a longer timeout for the AI analysis
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        try {
          const response = await fetch('/api/ai/analyze-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              source: sourceData.source,
              events: eventsData.results,
              contractId
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Analysis failed with status: ${response.status}`);
          }
          
          const analysis = await response.json();
          
          setContractResult({
            contractId,
            sourceCode: sourceData.source,
            summary: analysis.summary || "Analysis completed with limited details",
            description: analysis.description || "This contract was analyzed but detailed information could not be extracted.",
            securityScore: analysis.securityScore || "50",
            riskLevel: analysis.riskLevel || "MEDIUM",
            features: analysis.features || ["Contract features could not be determined"],
            functions: analysis.functions || ["Contract functions could not be determined"],
            security: analysis.security || {
              issues: [{
                severity: "MEDIUM",
                description: "Limited security analysis available",
                recommendation: "Manual review recommended"
              }],
              bestPractices: {
                followed: [],
                missing: ["Complete security analysis not available"]
              }
            },
            transactionActivity: (eventsData.results || []).map((event: any) => ({
              type: event.event_type || "Unknown event",
              description: JSON.stringify(event.data || {}),
              timestamp: event.block_time || new Date().toISOString()
            }))
          });
          
          setActiveTab("overview");
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
          
          // Still show the contract data even if AI analysis failed
          toast({
            title: "AI Analysis Limited",
            description: "Could not complete full AI analysis. Showing basic information only.",
            variant: "destructive",
          });
          
          setContractResult({
            contractId,
            sourceCode: sourceData.source,
            summary: "Contract analysis service unavailable",
            description: "The AI service could not analyze this contract. You can still view the source code and recent transactions.",
            securityScore: "0",
            riskLevel: "HIGH",
            features: ["AI analysis unavailable"],
            functions: ["AI analysis unavailable"],
            security: {
              issues: [{
                severity: "HIGH",
                description: "AI security analysis unavailable",
                recommendation: "Manual review required"
              }],
              bestPractices: {
                followed: [],
                missing: ["AI analysis unavailable"]
              }
            },
            transactionActivity: (eventsData.results || []).map((event: any) => ({
              type: event.event_type || "Unknown event",
              description: JSON.stringify(event.data || {}),
              timestamp: event.block_time || new Date().toISOString()
            }))
          });
          
          setActiveTab("source"); // Show source code tab as default
        }
      } else {
        throw new Error("Could not retrieve source code for contract");
      }
    } catch (error) {
      console.error("Contract analysis error:", error);
      throw error;
    }
  };

  const analyzeTransaction = async (txId: string) => {
    try {
      const txData = await getTransactionDetails(txId);

      const analysis = await fetch('/api/ai/analyze-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: txData })
      }).then(res => {
        if (!res.ok) throw new Error('Transaction analysis failed');
        return res.json();
      });

      setTransactionResult({
        txId,
        summary: analysis.summary,
        txType: analysis.txType,
        operation: analysis.operation,
        assets: analysis.assets || [],
        contracts: analysis.contracts || [],
        details: analysis.details || {}
      });

      setActiveTab("overview");
    } catch (error) {
      console.error("Transaction analysis error:", error);
      throw error;
    }
  };

  const { displayedText: displayedSummary } = useTypingEffect(
    contractResult?.summary || transactionResult?.summary || "",
    10
  );

  // Helper function to determine security icon
  const getSecurityIcon = (riskLevel: string) => {
    switch (riskLevel.toUpperCase()) {
      case 'LOW':
        return <ShieldCheck className="h-6 w-6 text-green-400" />;
      case 'MEDIUM':
        return <Shield className="h-6 w-6 text-yellow-400" />;
      case 'HIGH':
        return <ShieldAlert className="h-6 w-6 text-red-400" />;
      default:
        return <Shield className="h-6 w-6 text-gray-400" />;
    }
  };

  // Helper function for security score color
  const getScoreColor = (score: string) => {
    const numScore = parseInt(score, 10);
    if (numScore >= 80) return "text-green-400";
    if (numScore >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 -z-50 bg-gradient-to-b from-gray-900 to-black"></div>
      <Navbar isScrolled={isScrolled} />
      
      <main className="relative z-10 pt-24 pb-20 space-y-6 max-w-6xl mx-auto px-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full text-sm font-medium 
            bg-orange-500/10 border border-orange-500/20 animate-in fade-in slide-in-from-bottom-3">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              AI-Powered Analysis 🔍
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Stacks Decoder
          </h1>
          <p className="text-xl text-white/60 max-w-[600px] mx-auto">
            Analyze and understand Clarity contracts and transactions with AI assistance
          </p>
        </div>

        <Card className="border-orange-500/20 bg-orange-900/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Contract & Transaction Analysis</CardTitle>
            <CardDescription className="text-white/60">
              Enter a Stacks contract ID (SP0000.contract-name) or transaction ID (0x...) to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Enter contract ID or transaction ID"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="pl-8 bg-orange-500/10 border-orange-500/20 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleDecode}
                disabled={loading || !inputValue}
                className="bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/30 
                  shadow-lg shadow-orange-500/20 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>

            {(contractResult || transactionResult) && (
              <div className="space-y-6 mt-4">
                {/* Quick overview card with security score for contracts */}
                <div className="bg-orange-500/5 rounded-lg p-4 space-y-2 border border-orange-500/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-lg flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      {contractResult ? "Contract Overview" : "Transaction Overview"}
                    </h3>
                    
                    {contractResult && (
                      <div className="flex items-center space-x-2">
                        {getSecurityIcon(contractResult.riskLevel)}
                        <div>
                          <div className={`text-lg font-semibold ${getScoreColor(contractResult.securityScore)}`}>
                            Security Score: {contractResult.securityScore}/100
                          </div>
                          <div className="text-xs text-white/60">
                            Risk Level: {contractResult.riskLevel}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {transactionResult && (
                      <Badge variant="outline" className="text-white border-orange-500/30 bg-orange-500/10">
                        {transactionResult.txType}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-white/80">{displayedSummary}</p>
                </div>
                
                {/* Tabs for detailed analysis */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-orange-900/20 border border-orange-500/20">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                    >
                      Overview
                    </TabsTrigger>
                    
                    {contractResult && (
                      <>
                        <TabsTrigger 
                          value="security" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Security
                        </TabsTrigger>
                        <TabsTrigger 
                          value="features" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Features
                        </TabsTrigger>
                        <TabsTrigger 
                          value="source" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Source Code
                        </TabsTrigger>
                        <TabsTrigger 
                          value="transactions" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Activity
                        </TabsTrigger>
                      </>
                    )}
                    
                    {transactionResult && (
                      <>
                        <TabsTrigger 
                          value="details" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Details
                        </TabsTrigger>
                        <TabsTrigger 
                          value="assets" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Assets
                        </TabsTrigger>
                        <TabsTrigger 
                          value="contracts" 
                          className="data-[state=active]:bg-orange-500/20 text-white/70 data-[state=active]:text-white"
                        >
                          Contracts
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  
                  {/* Content for each tab */}
                  <div className="mt-4">
                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="space-y-4">
                      {contractResult && (
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Detailed Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white/80">{contractResult.description}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {transactionResult && (
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Operation Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Transaction Type:</span>
                                <span className="text-white font-medium">{transactionResult.txType}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/60">Operation:</span>
                                <span className="text-white font-medium">{transactionResult.operation}</span>
                              </div>
                              <div className="text-white/80 mt-4">
                                <p>{transactionResult.summary}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                    
                    {/* Security Tab Content (Contract) */}
                    {contractResult && (
                      <TabsContent value="security" className="space-y-4">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Security Issues</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {contractResult.security.issues.length > 0 ? (
                              <div className="divide-y divide-orange-500/10">
                                {contractResult.security.issues.map((issue, idx) => (
                                  <div key={idx} className="py-3">
                                    <div className="flex items-center mb-2">
                                      {issue.severity === 'HIGH' && <AlertCircle className="h-5 w-5 text-red-400 mr-2" />}
                                      {issue.severity === 'MEDIUM' && <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />}
                                      {issue.severity === 'LOW' && <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />}
                                      <h4 className="font-medium text-white">
                                        {issue.severity} Severity Issue
                                      </h4>
                                    </div>
                                    <p className="text-white/80 ml-7 mb-2">{issue.description}</p>
                                    <div className="bg-orange-500/5 p-3 rounded-md ml-7">
                                      <p className="text-sm text-white/90">
                                        <span className="text-orange-400 font-medium">Recommendation:</span> {issue.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-8">
                                <CheckCircle2 className="h-8 w-8 text-green-400 mr-3" />
                                <p className="text-white text-lg">No security issues detected</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-orange-500/20 bg-orange-900/5">
                            <CardHeader>
                              <CardTitle className="text-white text-lg flex items-center">
                                <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                                Best Practices Followed
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-5 space-y-1 text-white/80">
                                {contractResult.security.bestPractices.followed.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {contractResult.security.bestPractices.followed.length === 0 && (
                                  <li className="text-white/60 italic">None detected</li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-orange-500/20 bg-orange-900/5">
                            <CardHeader>
                              <CardTitle className="text-white text-lg flex items-center">
                                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                                Missing Best Practices
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-5 space-y-1 text-white/80">
                                {contractResult.security.bestPractices.missing.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                                {contractResult.security.bestPractices.missing.length === 0 && (
                                  <li className="text-green-400 italic">No missing best practices detected</li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    )}
                    
                    {/* Features Tab Content (Contract) */}
                    {contractResult && (
                      <TabsContent value="features" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-orange-500/20 bg-orange-900/5">
                            <CardHeader>
                              <CardTitle className="text-white text-lg">Contract Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-5 space-y-1 text-white/80">
                                {contractResult.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                                {contractResult.features.length === 0 && (
                                  <li className="text-white/60 italic">No features detected</li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                          
                          <Card className="border-orange-500/20 bg-orange-900/5">
                            <CardHeader>
                              <CardTitle className="text-white text-lg">Public Functions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="list-disc pl-5 space-y-1 text-white/80">
                                {contractResult.functions.map((func, idx) => (
                                  <li key={idx}>{func}</li>
                                ))}
                                {contractResult.functions.length === 0 && (
                                  <li className="text-white/60 italic">No public functions detected</li>
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    )}
                    
                    {/* Source Code Tab Content (Contract) */}
                    {contractResult && (
                      <TabsContent value="source">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-lg flex items-center">
                              <Code className="h-5 w-5 mr-2" />
                              Source Code
                            </CardTitle>
                            <Badge variant="outline" className="text-white border-orange-500/30 bg-orange-500/10">
                              Clarity
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            <pre className="bg-black/50 p-4 rounded-md overflow-x-auto text-sm text-white/90 border border-orange-500/10">
                              <code>{contractResult.sourceCode}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                    
                    {/* Activity Tab Content (Contract) */}
                    {contractResult && (
                      <TabsContent value="transactions">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center">
                              <Activity className="h-5 w-5 mr-2" />
                              Recent Contract Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="divide-y divide-orange-500/10">
                              {contractResult.transactionActivity.map((tx, idx) => (
                                <div key={idx} className="py-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium text-white">{tx.type}</h4>
                                    <span className="text-white/60 text-sm">{formatDate(tx.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-white/70 break-all">{tx.description}</p>
                                </div>
                              ))}
                              {contractResult.transactionActivity.length === 0 && (
                                <div className="py-6 text-center text-white/60">
                                  No recent activity found
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                    
                    {/* Details Tab Content (Transaction) */}
                    {transactionResult && (
                      <TabsContent value="details">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Transaction Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {Object.entries(transactionResult.details).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-sm text-white/60 capitalize">{key}</span>
                                  <span className="text-white break-all">
                                    {typeof value === 'object' 
                                      ? JSON.stringify(value, null, 2) 
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                    
                    {/* Assets Tab Content (Transaction) */}
                    {transactionResult && (
                      <TabsContent value="assets">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Asset Transfers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {transactionResult.assets.length > 0 ? (
                              <div className="divide-y divide-orange-500/10">
                                {transactionResult.assets.map((asset, idx) => (
                                  <div key={idx} className="py-3">
                                    <div className="mb-1">
                                      <span className="bg-orange-500/20 text-white px-2 py-1 rounded text-xs">
                                        {asset.type}
                                      </span>
                                      <span className="ml-2 text-white font-medium">{asset.amount}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-white/60">From:</span>
                                        <span className="ml-2 text-white break-all">{asset.from}</span>
                                      </div>
                                      <div>
                                        <span className="text-white/60">To:</span>
                                        <span className="ml-2 text-white break-all">{asset.to}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-6 text-center text-white/60">
                                No asset transfers in this transaction
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                    
                    {/* Contract Interactions Tab Content (Transaction) */}
                    {transactionResult && (
                      <TabsContent value="contracts">
                        <Card className="border-orange-500/20 bg-orange-900/5">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">Contract Interactions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {transactionResult.contracts.length > 0 ? (
                              <div className="divide-y divide-orange-500/10">
                                {transactionResult.contracts.map((contract, idx) => (
                                  <div key={idx} className="py-3">
                                    <h4 className="font-medium text-white mb-1">{contract.id}</h4>
                                    <p className="text-white/80">{contract.action}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-6 text-center text-white/60">
                                No contract interactions in this transaction
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </div>
            )}
          </CardContent>
          
          {/* Example inputs for users */}
          {!contractResult && !transactionResult && !loading && (
            <CardFooter className="flex flex-col">
              <div className="text-sm text-white/60 mb-2">Try these examples:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-500/5 border-orange-500/20 text-white/80 hover:bg-orange-500/10"
                  onClick={() => setInputValue("SP000000000000000000002Q6VF78.pox")}
                >
                  Stacks PoX Contract
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-500/5 border-orange-500/20 text-white/80 hover:bg-orange-500/10"
                  onClick={() => setInputValue("SP000000000000000000002Q6VF78.bns")}
                >
                  BNS Contract
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}