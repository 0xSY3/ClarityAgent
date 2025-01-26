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
    <>
      <div className="relative min-h-screen bg-black text-white">
        <Navbar />
        <main className="relative z-10 pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="space-y-6">
              <Card className="border-orange-500/20 bg-orange-900/10">
              <CardHeader>
                <CardTitle className="text-xl">Contract Auditor</CardTitle>
                <CardDescription>
                  Paste your Clarity contract code below to analyze for vulnerabilities, generate tests, and view metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    placeholder="Paste your Clarity contract code here..."
                    className="min-h-[200px] font-mono"
                  />
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze Contract
                  </Button>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="text-red-500">
                Error: {error}
              </div>
            )}

            {analyzeMutation.data && (
              <Card className="border-orange-500/20 bg-orange-900/10">
                <CardContent className="p-6">
                  <Tabs defaultValue="insights">
                    <TabsList>
                      <TabsTrigger value="insights">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Insights
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Security
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="insights">
                      <pre>{JSON.stringify(analyzeMutation.data, null, 2)}</pre>
                    </TabsContent>
                    
                    <TabsContent value="security">
                      <div>
                        <h3>Security Analysis</h3>
                        <div>Risk Level: {analyzeMutation.data.overallRisk}</div>
                        {analyzeMutation.data.issues?.map((issue: any, i: number) => (
                          <div key={i} className="mt-4">
                            <h4>Issue {i + 1}</h4>
                            <p>{issue.description}</p>
                            <p>Severity: {issue.severity}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  </>
);
}
