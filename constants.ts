
import { Course, Grade, GradeBoundary, UnitDefinition } from './types';

// Points per grade based on Unit Size (GLH)
// RQF BTEC National (2016)
export const POINTS_TABLE: Record<number, Record<Grade, number>> = {
  60:  { [Grade.U]: 0, [Grade.P]: 6,  [Grade.M]: 10, [Grade.D]: 16 },
  90:  { [Grade.U]: 0, [Grade.P]: 9,  [Grade.M]: 15, [Grade.D]: 24 },
  120: { [Grade.U]: 0, [Grade.P]: 12, [Grade.M]: 20, [Grade.D]: 32 },
};

// Grade Boundaries for Extended Diploma (1080 GLH)
export const GRADE_BOUNDARIES_1080: GradeBoundary[] = [
  { minPoints: 260, grade: 'D*D*D*', ucasPoints: 168 },
  { minPoints: 250, grade: 'D*D*D', ucasPoints: 160 },
  { minPoints: 230, grade: 'D*DD', ucasPoints: 152 },
  { minPoints: 210, grade: 'DDD', ucasPoints: 144 },
  { minPoints: 190, grade: 'DDM', ucasPoints: 128 },
  { minPoints: 170, grade: 'DMM', ucasPoints: 112 },
  { minPoints: 150, grade: 'MMM', ucasPoints: 96 },
  { minPoints: 130, grade: 'MMP', ucasPoints: 80 },
  { minPoints: 110, grade: 'MPP', ucasPoints: 64 },
  { minPoints: 90, grade: 'PPP', ucasPoints: 48 },
  { minPoints: 0,   grade: 'U',   ucasPoints: 0 },
];

export const INITIAL_ESPORTS_UNITS: UnitDefinition[] = [
  // Mandatory
  { id: 'u1', number: 1, name: 'Introduction to Esports', glh: 60, type: 'Mandatory' },
  { id: 'u2', number: 2, name: 'Esports Skills, Strategies and Analysis', glh: 120, type: 'Mandatory' },
  { id: 'u3', number: 3, name: 'Enterprise and Entrepreneurship in the Esports Industry', glh: 90, type: 'Mandatory' },
  { id: 'u4', number: 4, name: 'Health, Wellbeing and Fitness for Esports Players', glh: 90, type: 'Mandatory' },
  { id: 'u5', number: 5, name: 'Esports Events', glh: 120, type: 'Mandatory' },
  // Optional
  { id: 'u6', number: 6, name: 'Live-streamed Broadcasting', glh: 60, type: 'Optional' },
  { id: 'u7', number: 7, name: 'Producing an Esports Brand', glh: 60, type: 'Optional' },
  { id: 'u8', number: 8, name: 'Video Production', glh: 60, type: 'Optional' },
  { id: 'u9', number: 9, name: 'Games Design', glh: 60, type: 'Optional' },
  { id: 'u10', number: 10, name: 'Business Applications of Esports in Social Media', glh: 60, type: 'Optional' },
  { id: 'u11', number: 11, name: 'Shoutcasting', glh: 60, type: 'Optional' },
  { id: 'u12', number: 12, name: 'Esports Coaching', glh: 60, type: 'Optional' },
  { id: 'u13', number: 13, name: 'Psychology for Esports Performance', glh: 60, type: 'Optional' },
  { id: 'u14', number: 14, name: 'Nutrition for Esports Performance', glh: 60, type: 'Optional' },
  { id: 'u15', number: 15, name: 'Ethical and Current Issues in Esports', glh: 60, type: 'Optional' },
  { id: 'u19', number: 19, name: 'Customer Immersion Experiences', glh: 60, type: 'Optional' },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c_esports_1080',
    academicYear: '2024-25',
    sector: 'Esports',
    name: 'Esports',
    qualification: 'Level 3 National Extended Diploma',
    totalGLH: 1080,
    units: INITIAL_ESPORTS_UNITS
  }
];
