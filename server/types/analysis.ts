export interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line?: number;
  snippet?: string;
  impact: string;
  recommendation: string;
}

export interface ClarityTest {
  name: string;
  description: string; 
  code: string;
  type: "unit" | "integration" | "property";
  coverage: {
    functions: string[];
    assertions: number;
  };
  expected: {
    result: string;
    cost: number;
  };
}

export interface AnalysisResponse {
  overallRisk: string;
  issues: SecurityIssue[];
  metrics: CodeMetrics;
  tests?: ClarityTest[];
  timestamp: string;
}