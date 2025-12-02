import { Grade, Course, Student } from './types';
import { POINTS_TABLE, GRADE_BOUNDARIES_1080 } from './constants';

export const generateId = () => Math.random().toString(36).slice(2, 9);

export const getPoints = (glh: number, grade: Grade): number => {
  const mapping = POINTS_TABLE[glh];
  return mapping ? (mapping[grade] || 0) : 0;
};

export const calculateResults = (student: Student, course: Course) => {
  let totalPoints = 0;
  let currentGLH = 0;
  let mandatoryPassed = true;

  student.results.forEach(res => {
    const unit = course.units.find(u => u.id === res.unitId);
    if (unit) {
      const p = getPoints(unit.glh, res.grade);
      totalPoints += p;
      if (res.grade !== Grade.U) {
        currentGLH += unit.glh;
      }
      
      // Strict check: In BTEC, failing a mandatory unit often caps the grade or fails the course
      // For this calculator, we just flag it
      if (unit.type === 'Mandatory' && res.grade === Grade.U) {
        mandatoryPassed = false;
      }
    }
  });

  // Determine Grade
  let grade = 'U';
  let ucas = 0;

  for (const b of GRADE_BOUNDARIES_1080) {
    if (totalPoints >= b.minPoints) {
      grade = b.grade;
      ucas = b.ucasPoints;
      break;
    }
  }

  return { totalPoints, currentGLH, grade, ucas, mandatoryPassed };
};