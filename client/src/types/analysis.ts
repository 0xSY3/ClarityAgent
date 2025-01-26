export interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line?: number;
  snippet?: string;
  impact: string;
  recommendation: string;
}

export interface CodeMetrics {
  complexity: number;
  lines: number;
  functions: number;
  variables: number;
  gasEstimates: {
    deployment: string;
    execution: string;
  };
}

export interface AnalysisResponse {
  overallRisk: string;
  issues: SecurityIssue[];
  metrics?: CodeMetrics;
  tests?: TestCase[];
  insights?: string; // Optional insights text
}

export interface TestCase {
  name: string;
  description: string;
  code: string;
  type: 'unit' | 'integration' | 'property';
  coverage: {
    functions: string[];
    assertions: number;
  };
  expected: {
    result: string;
    cost: string;
  };
}
