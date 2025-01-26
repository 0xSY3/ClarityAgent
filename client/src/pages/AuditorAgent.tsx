import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from 'axios';
import type { AnalysisResponse } from '@/types/analysis';
import { 
  Target,
  Loader2,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";

interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  description: string;
  line?: number;
  snippet?: string;
  impact?: string;
  recommendation?: string;
}

interface AnalysisResult {
  overallRisk: string;
  issues: SecurityIssue[];
  insights?: string;
  unitTests: {
    name: string;
    description: string;
    code: string;
    type: 'unit' | 'integration' | 'security';
    coverage: {
      functions: string[];
      conditions: string[];
    }
  }[];
  metrics: {
    gasEstimates: {
      deployment: string;
      execution: string;
    };
    complexity: number;
    lines: number;
  };
}

export default function AuditorAgent() {
  const [contractCode, setContractCode] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation<AnalysisResponse, Error>({
    mutationFn: async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/ai/analyze', {
          code: contractCode
        });
        setAnalysisResults(response.data);
        setError(null);
        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Found ${data.issues.length} issues`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    if (!contractCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter contract code",
        variant: "destructive"
      });
      return;
    }
    analyzeMutation.mutate();
  };

  const renderInsights = () => (
    <div className="p-4 space-y-4 bg-black/40 rounded-lg">
      {analysisResults?.insights ? (
        <div className="text-white space-y-3">
          {analysisResults.insights?.split('\n').map((line: string, i: number) => (
            <div key={i} className="flex items-start">
              <Target className="mr-2 mt-1 text-orange-500 flex-shrink-0" size={16} />
              <p className="text-sm">{line}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-8">
          No insights available. Analyze a contract to generate insights.
        </div>
      )}
    </div>
  );

  const renderSecurityIssues = () => (
    <div className="space-y-4">
      {analysisResults?.issues.map((issue, i) => (
        <div 
          key={i} 
          className={`p-4 rounded-lg border ${
            issue.severity === 'high' ? 'border-red-500/20 bg-red-900/10' :
            issue.severity === 'medium' ? 'border-yellow-500/20 bg-yellow-900/10' :
            'border-blue-500/20 bg-blue-900/10'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium capitalize">{issue.severity} Risk</span>
                {issue.line && (
                  <span className="text-sm opacity-60">Line {issue.line}</span>
                )}
              </div>
              <p className="text-sm opacity-90 mb-3">{issue.description}</p>
              {issue.impact && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Impact:</span>
                  <p className="text-sm opacity-90 mt-1">{issue.impact}</p>
                </div>
              )}
              {issue.recommendation && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Recommendation:</span>
                  <p className="text-sm opacity-90 mt-1">{issue.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {analysisResults?.metrics && (
        <>
          <Card className="border-orange-500/20 bg-orange-900/10">
            <CardHeader className="p-4">
              <CardTitle className="text-sm text-white/80">Gas Estimates</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Deployment</span>
                  <span className="font-mono">{analysisResults.metrics.gasEstimates.deployment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Execution</span>
                  <span className="font-mono">{analysisResults.metrics.gasEstimates.execution}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-500/20 bg-orange-900/10">
            <CardHeader className="p-4">
              <CardTitle className="text-sm text-white/80">Code Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Complexity Score</span>
                  <span className="font-mono">{analysisResults.metrics.complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lines of Code</span>
                  <span className="font-mono">{analysisResults.metrics.lines}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Navbar isScrolled={false} />
      <main className="relative z-10">
        <section className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header Section */}
            <div className="text-center">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full text-sm font-medium 
                bg-orange-500/10 border border-orange-500/20 animate-in fade-in slide-in-from-bottom-3">
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  AI-Powered Smart Contract Auditing 🔍
                </span>
              </div>

              <div className="mb-12 space-y-6">
                <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
                  Contract
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Security Auditor
                  </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Analyze your Clarity smart contracts for vulnerabilities and best practices
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <Card className="border-orange-500/20 bg-orange-900/10 backdrop-blur-sm">
                  <CardHeader className="space-y-2 p-4 sm:p-6">
                    <CardTitle className="text-xl sm:text-2xl text-white">Contract Analysis</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-white/60">
                      Paste your contract code for security analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    <Textarea
                      value={contractCode}
                      onChange={(e) => setContractCode(e.target.value)}
                      placeholder="Paste your Clarity contract code here..."
                      className="min-h-[300px] font-mono bg-orange-500/10 border-orange-500/20 
                        text-white placeholder:text-white/40 resize-none focus:border-orange-500/40"
                    />
                    <Button 
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="w-full bg-orange-600/90 text-white hover:bg-orange-500
                        border border-orange-500/30 shadow-lg shadow-orange-500/20
                        transition-all duration-200 hover:scale-[1.02] h-12"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Contract...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Analyze Contract
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {error && (
                  <Card className="border-red-500/20 bg-red-900/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 text-red-400">
                        <AlertCircle className="h-5 w-5 mt-0.5" />
                        <p>{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              {analyzeMutation.data && (
                <div className="space-y-6">
                  <Card className="border-orange-500/20 bg-orange-900/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="security" className="space-y-4">
                        <TabsList className="bg-orange-500/10 border border-orange-500/20">
                          <TabsTrigger value="security" className="data-[state=active]:bg-orange-500">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Security
                          </TabsTrigger>
                          <TabsTrigger value="insights" className="data-[state=active]:bg-orange-500">
                            <Target className="mr-2 h-4 w-4" />
                            Insights
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="security">
                          {renderSecurityIssues()}
                        </TabsContent>
                        <TabsContent value="insights">
                          {renderInsights()}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-500/20 bg-orange-900/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Contract Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderMetrics()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
