/**
 * Requirement Model — AI-QA-POC
 *
 * Defines the data structures for parsed requirements from requirements.md.
 * Used across the STLC pipeline for requirement analysis and traceability.
 */

/** Requirement type classification */
export enum RequirementType {
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non-functional',
  UI = 'ui',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
}

/** Requirement priority levels */
export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  CRITICAL = 'critical',
}

/** Testability assessment result */
export enum Testability {
  FULLY_TESTABLE = 'fully-testable',
  PARTIALLY_TESTABLE = 'partially-testable',
  NOT_TESTABLE = 'not-testable',
  NEEDS_CLARIFICATION = 'needs-clarification',
}

/** Single functional requirement parsed from requirements.md */
export interface IRequirement {
  id: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: Priority;
  section: string;
  acceptanceCriteria: string[];
  testability: Testability;
  testabilityNotes: string;
}

/** Application metadata parsed from the document header */
export interface IAppMetadata {
  appName: string;
  baseUrl: string;
  version: string;
  module: string;
  userType: string;
  scope: string;
}

/** Test data field from the document */
export interface ITestDataField {
  field: string;
  value: string;
  notes: string;
}

/** Complete parsed requirements document */
export interface IRequirementsDocument {
  metadata: IAppMetadata;
  objective: string;
  requirements: IRequirement[];
  testData: ITestDataField[];
  acceptanceCriteria: string[];
  totalRequirements: number;
  sections: IRequirementSection[];
}

/** Grouping of requirements by section */
export interface IRequirementSection {
  id: string;
  title: string;
  requirements: IRequirement[];
}
