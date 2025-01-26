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

export interface TestGenerationResponse {
  tests: ClarityTest[];
  summary: {
    totalTests: number;
    functionsCovered: string[];
    totalAssertions: number;
  };
}