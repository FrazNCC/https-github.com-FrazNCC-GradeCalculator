
import React, { useState, useEffect } from 'react';
import { Course, Student, Grade, UnitDefinition } from '../types';
import { calculateResults, getPoints } from '../utils';

interface Props {
  course: Course;
  students: Student[];
  onAddStudent: (name: string) => void;
  onUpdateStudent: (student: Student) => void;
}

export const GradeCalculator: React.FC<Props> = ({ course, students, onAddStudent, onUpdateStudent }) => {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // Auto-select newly added student or first student if none selected
  useEffect(() => {
    if (students.length > 0 && !activeStudentId) {
      setActiveStudentId(students[0].id);
    }
  }, [students, activeStudentId]);

  // If the active student is deleted (or course changes), reset
  useEffect(() => {
    if (activeStudentId && !students.find(s => s.id === activeStudentId)) {
      setActiveStudentId(students.length > 0 ? students[0].id : null);
    }
  }, [students, activeStudentId]);

  const activeStudent = students.find(s => s.id === activeStudentId);
  const results = activeStudent ? calculateResults(activeStudent, course) : null;

  const submitAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim());
      setNewStudentName('');
      setIsAddingStudent(false);
    }
  };

  const handleGradeChange = (unitId: string, grade: Grade) => {
    if (!activeStudent) return;
    
    const existingIdx = activeStudent.results.findIndex(r => r.unitId === unitId);
    let newResults = [...activeStudent.results];

    if (existingIdx > -1) {
      // Don't allow changes if locked
      if (newResults[existingIdx].locked) return;
      newResults[existingIdx] = { ...newResults[existingIdx], grade };
    } else {
      newResults.push({ unitId, grade });
    }

    onUpdateStudent({ ...activeStudent, results: newResults });
  };

  const handleLockToggle = (unitId: string) => {
    if (!activeStudent) return;
    
    const existingIdx = activeStudent.results.findIndex(r => r.unitId === unitId);
    let newResults = [...activeStudent.results];

    if (existingIdx > -1) {
      const currentLocked = newResults[existingIdx].locked || false;
      newResults[existingIdx] = { ...newResults[existingIdx], locked: !currentLocked };
    } else {
      // If result doesn't exist yet, create it locked
      newResults.push({ unitId, grade: Grade.U, locked: true });
    }

    onUpdateStudent({ ...activeStudent, results: newResults });
  };

  const renderUnitRow = (unit: UnitDefinition) => {
    const result = activeStudent?.results.find(r => r.unitId === unit.id);
    const studentGrade = result?.grade || Grade.U;
    const isLocked = result?.locked || false;
    const points = getPoints(unit.glh, studentGrade);
    
    const gradeColor = {
        [Grade.U]: 'bg-gray-100 text-gray-500',
        [Grade.P]: 'bg-yellow-100 text-yellow-800',
        [Grade.M]: 'bg-blue-100 text-blue-800',
        [Grade.D]: 'bg-green-100 text-green-800',
    }[studentGrade];

    return (
      <tr key={unit.id} className="border-b hover:bg-slate-50 transition-colors">
        <td className="p-3 w-16 text-center text-slate-500">{unit.number}</td>
        <td className="p-3 font-medium text-slate-800">
          {unit.name}
          <div className="text-xs text-slate-400 font-normal mt-0.5">{unit.type} • {unit.glh} GLH</div>
        </td>
        <td className="p-3 w-32">
          <select
            value={studentGrade}
            onChange={(e) => handleGradeChange(unit.id, e.target.value as Grade)}
            disabled={isLocked}
            className={`w-full p-2 rounded text-sm font-bold border-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${gradeColor} ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {Object.values(Grade).map(g => (
              <option key={g} value={g}>{g === Grade.U ? 'Pending / U' : g}</option>
            ))}
          </select>
        </td>
        <td className="p-3 w-12 text-center">
            <input 
                type="checkbox"
                checked={isLocked}
                onChange={() => handleLockToggle(unit.id)}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300 cursor-pointer"
                title="Teacher Sign-off (Lock Grade)"
            />
        </td>
        <td className="p-3 w-20 text-right font-mono text-slate-600">{points}</td>
      </tr>
    );
  };

  const mandatoryUnits = course.units.filter(u => u.type === 'Mandatory');
  const optionalUnits = course.units.filter(u => u.type === 'Optional');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      
      {/* Sidebar: Student List - Scrolls independently */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex-none bg-white z-10">
          <h3 className="font-bold text-slate-700 flex justify-between items-center">
            Students
            {!isAddingStudent && (
               <button 
                  onClick={() => setIsAddingStudent(true)} 
                  className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
               >
                  + New
               </button>
            )}
          </h3>

          {isAddingStudent && (
            <form onSubmit={submitAddStudent} className="mt-3 bg-slate-50 p-3 rounded border border-slate-200">
              <input 
                type="text" 
                autoFocus
                placeholder="Name..." 
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full text-sm border rounded p-1.5 mb-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-orange-600 text-white text-xs py-1 rounded hover:bg-orange-700">Add</button>
                <button type="button" onClick={() => setIsAddingStudent(false)} className="flex-1 bg-white border border-slate-300 text-slate-600 text-xs py-1 rounded hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {students.length === 0 && !isAddingStudent && <p className="text-sm text-slate-400 italic text-center mt-10">No students yet.</p>}
          {students.map(s => {
            const sResults = calculateResults(s, course);
            return (
              <button
                key={s.id}
                onClick={() => setActiveStudentId(s.id)}
                className={`w-full text-left p-3 rounded text-sm transition-all ${activeStudentId === s.id ? 'bg-orange-50 text-orange-900 border border-orange-200 shadow-sm' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}
              >
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs opacity-75 mt-1 flex justify-between">
                  <span>{sResults.totalPoints} pts</span>
                  <span className={`font-bold ${sResults.grade === 'U' ? 'text-red-500' : 'text-green-600'}`}>{sResults.grade}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area: Calculator - Split into Fixed Header and Scrollable List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-3 flex flex-col h-full overflow-hidden relative">
        {!activeStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            <p className="text-center">Select a student or create a new one<br/>to start calculating grades.</p>
          </div>
        ) : (
          <>
            {/* FROZEN HEADER SECTION: Points, Grade, UCAS */}
            {/* This div uses flex-none to ensure it never shrinks or moves. Z-index ensures it sits 'above' scrollable content visually. */}
            <div className="flex-none bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 shadow-md">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{activeStudent.name}</h2>
                <p className="text-sm text-slate-500">{course.name}</p>
              </div>
              <div className="flex gap-6 text-right w-full sm:w-auto bg-white sm:bg-transparent p-3 sm:p-0 rounded border sm:border-none border-slate-200">
                <div className="flex-1 sm:flex-none text-center sm:text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold">Points</div>
                  <div className="text-2xl font-mono font-bold text-slate-800">{results?.totalPoints}</div>
                </div>
                <div className="flex-1 sm:flex-none text-center sm:text-right border-l sm:border-none pl-4 sm:pl-0">
                  <div className="text-xs text-slate-500 uppercase font-bold">Grade</div>
                  <div className={`text-2xl font-bold ${results?.grade === 'U' ? 'text-red-500' : 'text-green-600'}`}>{results?.grade}</div>
                </div>
                 <div className="flex-1 sm:flex-none text-center sm:text-right border-l sm:border-none pl-4 sm:pl-0">
                  <div className="text-xs text-slate-500 uppercase font-bold">UCAS</div>
                  <div className="text-2xl font-mono font-bold text-purple-600">{results?.ucas}</div>
                </div>
              </div>
            </div>

            {/* SCROLLABLE UNITS LIST */}
            {/* This div takes the remaining height and handles overflow */}
            <div className="flex-1 overflow-y-auto p-6 bg-white relative">
              
              {/* Mandatory */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-500 uppercase mb-2 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                  Mandatory Units
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Required</span>
                </h4>
                <div className="border rounded overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <tr>
                            <th className="p-3 w-16 text-center">No.</th>
                            <th className="p-3">Unit Name</th>
                            <th className="p-3 w-32">Grade</th>
                            <th className="p-3 w-12 text-center" title="Teacher Lock">Lock</th>
                            <th className="p-3 w-20 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {mandatoryUnits.length === 0 && (
                          <tr><td className="p-4 text-slate-400 italic">No mandatory units defined.</td></tr>
                      )}
                      {mandatoryUnits.map(u => renderUnitRow(u))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Optional */}
              <div className="pb-8">
                <div className="flex justify-between items-end mb-2 sticky top-10 bg-white py-2 z-10">
                   <h4 className="text-sm font-bold text-slate-500 uppercase">Optional Units</h4>
                   <span className="text-xs text-slate-400">
                      Total GLH Passed: <span className="font-mono text-slate-600">{activeStudent.results
                        .map(r => course.units.find(u => u.id === r.unitId))
                        .filter(u => u && u.type === 'Optional' && activeStudent.results.find(r => r.unitId === u.id)?.grade !== Grade.U)
                        .reduce((acc, u) => acc + (u?.glh || 0), 0)}
                      </span>
                    </span>
                </div>
                
                <div className="border rounded overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <tr>
                            <th className="p-3 w-16 text-center">No.</th>
                            <th className="p-3">Unit Name</th>
                            <th className="p-3 w-32">Grade</th>
                            <th className="p-3 w-12 text-center" title="Teacher Lock">Lock</th>
                            <th className="p-3 w-20 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {optionalUnits.length === 0 ? (
                            <tr><td className="p-8 text-center text-slate-400 italic">No optional units defined for this course.</td></tr>
                        ) : (
                            optionalUnits.map(u => renderUnitRow(u))
                        )}
                    </tbody>
                    </table>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};
