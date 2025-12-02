
export enum Grade {
  U = 'U',
  P = 'P',
  M = 'M',
  D = 'D'
}

export type UnitType = 'Mandatory' | 'Optional';
export type Sector = 'Esports' | 'Computing' | 'IT' | 'Business' | 'Creative Media' | 'Other';
export type UserRole = 'admin' | 'user';

export interface UnitDefinition {
  id: string;
  number: number;
  name: string;
  glh: number; // 60, 90, 120
  type: UnitType;
}

export interface Qualification {
  name: string;
  totalGLH: number;
}

export interface Course {
  id: string;
  academicYear: string; // e.g., "2024-25"
  sector: Sector;
  name: string; // e.g. "Esports"
  qualification: string; // e.g. "Level 3 National Extended Diploma"
  totalGLH: number;
  units: UnitDefinition[];
}

export interface StudentUnitResult {
  unitId: string;
  grade: Grade;
  locked?: boolean;
}

export interface Student {
  id: string;
  name: string;
  courseId: string;
  results: StudentUnitResult[];
}

export interface GradeBoundary {
  minPoints: number;
  grade: string;
  ucasPoints: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}
