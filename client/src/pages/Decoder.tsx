import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeViewer } from "@/components/ui/code-viewer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { useTypingEffect } from "@/hooks/use-typing-effect";
import { getClaritySourceCode, getContractTransactions } from '@/lib/stacks';

// Update interface for enhanced response
interface DecoderResponse {
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

export default function Decoder() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [contractId, setContractId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecoderResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDecode = async () => {
    if (!contractId) {
      toast({
        title: "Input Required",
        description: "Please enter a contract ID (format: address.contract-name)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const [sourceData, eventsData] = await Promise.all([
        getClaritySourceCode(contractId),
        getContractTransactions(contractId)
      ]);

      const analysis = await fetch('/api/ai/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: sourceData.source,
          events: eventsData.results,
          contractId
        })
      }).then(res => {
        if (!res.ok) throw new Error('Analysis failed');
        return res.json();
      });

      setResult({
        contractId,
        sourceCode: sourceData.source,
        summary: analysis.summary,
        description: analysis.description,
        securityScore: analysis.securityScore,
        riskLevel: analysis.riskLevel,
        features: analysis.features || [],
        functions: analysis.functions || [],
        security: analysis.security,
        transactionActivity: eventsData.results.map((event: any) => ({
          type: event.event_type,
          description: event.data,
          timestamp: event.block_time
        }))
      });

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze contract",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const { displayedText: displayedSummary } = useTypingEffect(
    result?.summary || "",
    10
  );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 -z-50">
      </div>
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
            Transaction Decoder
          </h1>
          <p className="text-xl text-white/60 max-w-[600px] mx-auto">
            Analyze and understand clarity contracts with AI assistance
          </p>
        </div>

        <Card className="border-orange-500/20 bg-orange-900/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Contract Analysis</CardTitle>
            <CardDescription className="text-white/60">
              Enter a smart contract address to analyze. Analysis may take up to 60 seconds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Enter contract ID (e.g. SP000.contract-name)"
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  className="pl-8 bg-orange-500/10 border-orange-500/20 text-white placeholder:text-white/40"
                />
              </div>
              <Button
                onClick={handleDecode}
                disabled={loading || !contractId}
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

            {result && (
              <div className="space-y-4 mt-6">
                <div className="bg-orange-500/5 rounded-lg p-4 space-y-2 border border-orange-500/10">
                  <h3 className="font-medium text-white">Security Analysis</h3>
                  <div className={`text-lg font-semibold ${
                    result.riskLevel === 'LOW' ? 'text-green-400' :
                    result.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    Security Score: {result.securityScore}/100
                  </div>
                  <p className="text-white/80">{result.summary}</p>
                </div>
                
                {/* Display other sections with enhanced formatting */}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
