import React from 'react';
import { ClarityTest } from '@/types/test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeViewer } from '@/components/ui/code-viewer';

interface TestGeneratorProps {
  tests: ClarityTest[];
  isLoading: boolean;
  contractcode: string;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ tests, isLoading }) => {
  const getTestTypeColor = (type: string) => {
    switch (type) {
      case "unit": return "bg-blue-500/10 text-blue-500";
      case "integration": return "bg-purple-500/10 text-purple-500";
      case "property": return "bg-green-500/10 text-green-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {tests.map((test, index) => (
        <Card key={index} className="border-orange-500/20 bg-orange-900/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{test.name}</CardTitle>
              <Badge className={getTestTypeColor(test.type)}>{test.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-white/60">{test.description}</p>
              <CodeViewer code={test.code} language="lisp" />
              <div className="text-sm space-y-2">
                <div>Assertions: {test.coverage.assertions}</div>
                <div>Cost: {test.expected.cost}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TestGenerator;
