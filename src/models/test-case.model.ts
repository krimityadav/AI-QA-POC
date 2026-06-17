/**
 * Test Case Model — AI-QA-POC
 *
 * Defines the data structures for generated test cases, test plans,
 * and execution results across the STLC pipeline.
 */

import { Priority } from './requirement.model.js';

/** Test execution status */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

/** Test case type */
export enum TestCaseType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  BOUNDARY = 'boundary',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  E2E = 'e2e',
}

/** Individual test step within a test case */
export interface ITestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

/** Generated test case */
export interface ITestCase {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  type: TestCaseType;
  priority: Priority;
  preconditions: string[];
  steps: ITestStep[];
  expectedResult: string;
  status: TestStatus;
  automatable: boolean;
  tags: string[];
}

/** Test execution result */
export interface ITestResult {
  testCaseId: string;
  status: TestStatus;
  duration: number;
  browser: string;
  screenshotPath?: string;
  errorMessage?: string;
  stackTrace?: string;
  timestamp: string;
}

/** Test plan document */
export interface ITestPlan {
  projectName: string;
  version: string;
  createdAt: string;
  objective: string;
  scope: {
    inScope: string[];
    outOfScope: string[];
  };
  strategy: {
    approach: string;
    testLevels: string[];
    testTypes: string[];
    automationTools: string[];
  };
  environment: {
    browsers: string[];
    baseUrl: string;
    testData: string;
  };
  schedule: {
    phase: string;
    description: string;
    estimatedDuration: string;
  }[];
  entryExitCriteria: {
    entry: string[];
    exit: string[];
  };
  risks: {
    risk: string;
    mitigation: string;
    severity: string;
  }[];
  totalTestCases: number;
  requirementsCovered: number;
}

/** Coverage matrix entry — maps requirement to test cases */
export interface ICoverageEntry {
  requirementId: string;
  requirementTitle: string;
  testCaseIds: string[];
  coverageStatus: 'covered' | 'partially-covered' | 'not-covered';
  testCaseCount: number;
}

/** Full coverage matrix */
export interface ICoverageMatrix {
  projectName: string;
  createdAt: string;
  totalRequirements: number;
  coveredRequirements: number;
  partiallyCoveredRequirements: number;
  uncoveredRequirements: number;
  coveragePercentage: number;
  entries: ICoverageEntry[];
}

/** STLC Outcome — master report data */
export interface ISTLCOutcome {
  summary: {
    projectName: string;
    version: string;
    baseUrl: string;
    executionDate: string;
    totalRequirements: number;
    totalTestCases: number;
    passed: number;
    failed: number;
    skipped: number;
    blocked: number;
    coveragePercentage: number;
    passRate: number;
  };
  stlcStages: {
    requirementAnalysis: {
      status: string;
      totalParsed: number;
      testable: number;
      notTestable: number;
      needsClarification: number;
    };
    testPlan: ITestPlan;
    testCases: ITestCase[];
    environmentSetup: {
      browsers: string[];
      baseUrl: string;
      configuredAt: string;
    };
    executionResults: ITestResult[];
    testClosure: {
      totalExecuted: number;
      passRate: number;
      failRate: number;
      defectsFound: number;
      recommendation: string;
    };
  };
}
