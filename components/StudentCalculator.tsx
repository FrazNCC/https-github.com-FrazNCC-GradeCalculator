import React, { useState, useEffect } from 'react';
import { Course, Student, Grade, UnitDefinition } from '../types';
import { calculateResults, getPoints } from '../utils';
import { analyzeStudentProgress } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  course: Course;
  student: Student;
  onUpdateStudent: (s: Student) => void;
}

const StudentCalculator: React.FC<Props> = ({ course, student, onUpdateStudent }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [totals, setTotals] = useState(calculateResults(student, course));

  useEffect(() => {
    setTotals(calculateResults(student, course));
  }, [student, course]);

  const handleGradeChange = (unitId: string, newGrade: Grade) => {
    const existingIndex = student.results.findIndex(r => r.unitId === unitId);
    let newResults = [...student.results];

    if (existingIndex >= 0) {
      newResults[existingIndex] = { ...newResults[existingIndex], grade: newGrade };
    } else {
      newResults.push({ unitId, grade: newGrade });
    }

    onUpdateStudent({ ...student, results: newResults });
  };

  const handleAddUnit = (unitId: string) => {
    if (student.results.find(r => r.unitId === unitId)) return;
    onUpdateStudent({
      ...student,
      results: [...student.results, { unitId, grade: Grade.U }]
    });
  };

  const handleRemoveUnit = (unitId: string) => {
    onUpdateStudent({
        ...student,
        results: student.results.filter(r => r.unitId !== unitId)
    });
  }

  const runAIAnalysis = async () => {
    setLoadingAnalysis(true);
    const result = await analyzeStudentProgress(student, course, totals.totalPoints, totals.grade);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  // Split units into Mandatory and Optional (assigned)
  const mandatoryUnits = course.units.filter(u => u.type === 'Mandatory');
  const availableOptionalUnits = course.units.filter(u => u.type === 'Optional');
  
  // Create a map for easy lookup, checking for undefined results
  const studentGrades = new Map<string, Grade>();
  if (student && student.results) {
    student.results.forEach(r => studentGrades.set(r.unitId, r.grade));
  }

  // Get available grades for dropdown
  const gradeOptions = Object.values(Grade) as Grade[];

  // Ensure mandatory units are always in the student's record for display
  const renderUnitRow = (unit: UnitDefinition, isRemovable: boolean = false) => {
    const grade = studentGrades.get(unit.id) || Grade.U;
    const points = getPoints(unit.glh, grade);
    
    // Color coding for Grade dropdown
    const gradeColors: Record<string, string> = {
        [Grade.U]: 'bg-gray-100 text-gray-500',
        [Grade.P]: 'bg-yellow-100 text-yellow-800',
        [Grade.M]: 'bg-blue-100 text-blue-800',
        [Grade.D]: 'bg-green-100 text-green-800',
    };

    return (
      <tr key={unit.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm font-medium text-gray-700">{unit.type}</td>
        <td className="px-4 py-3 text-sm text-gray-600">Internal</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-center">{unit.number}</td>
        <td className="px-4 py-3 text-sm text-gray-800">{unit.name}</td>
        <td className="px-4 py-3 text-sm text-gray-600 text-center">{unit.glh}</td>
        <td className="px-4 py-3">
            <select 
                value={grade} 
                onChange={(e) => handleGradeChange(unit.id, e.target.value as Grade)}
                className={`w-full p-2 rounded border-none font-bold cursor-pointer focus:ring-2 focus:ring-orange-500 ${gradeColors[grade] || ''}`}
            >
                {gradeOptions.map(g => (
                    <option key={g} value={g}>{g === Grade.U ? 'U / Pending' : g}</option>
                ))}
            </select>
        </td>
        <td className="px-4 py-3 text-sm text-gray-800 text-right font-mono">{points}</td>
        {isRemovable && (
            <td className="px-4 py-3 text-center">
                <button 
                    onClick={() => handleRemoveUnit(unit.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Remove Unit"
                >
                    &times;
                </button>
            </td>
        )}
      </tr>
    );
  };

  const chartData = [
    { name: 'Your Points', points: totals.totalPoints },
    { name: 'To Next Grade', points: Math.max(0, 20) } // Dummy visual
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header / Sector Selection Replica */}
      <div className="bg-white p-6 border-b border-gray-200">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[#007FA3] flex items-center gap-2">
                   Grade Calculator
                </h1>
                <p className="text-sm text-gray-500 mt-1">BTEC Grade Calculator &bull; {course.name}</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Grade</p>
                    <div className="text-3xl font-bold text-[#007FA3]">{totals.grade}</div>
                </div>
                 <div className="text-right border-l pl-4 border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Points</p>
                    <div className="text-3xl font-bold text-gray-800">{totals.totalPoints}</div>
                </div>
                 <div className="text-right border-l pl-4 border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">UCAS Points</p>
                    <div className="text-3xl font-bold text-purple-600">{totals.ucas}</div>
                </div>
            </div>
         </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Table Section */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Mandatory Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                     <h3 className="font-bold text-gray-700">Group A: Mandatory Units</h3>
                     <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Must be passed</span>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-2 w-24">Type</th>
                                <th className="px-4 py-2 w-20">Assess</th>
                                <th className="px-4 py-2 w-16 text-center">No.</th>
                                <th className="px-4 py-2">Unit Name</th>
                                <th className="px-4 py-2 w-16 text-center">GLH</th>
                                <th className="px-4 py-2 w-32">Grade</th>
                                <th className="px-4 py-2 w-16 text-right">Pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mandatoryUnits.map(u => renderUnitRow(u))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Optional Section */}
            <div>
                 <div className="bg-[#E67300] text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
                    <span className="font-bold">Optional Units</span>
                    <select 
                        className="text-slate-800 text-sm p-1 rounded bg-white border-none focus:ring-2 focus:ring-blue-300"
                        onChange={(e) => {
                            if(e.target.value) handleAddUnit(e.target.value);
                            e.target.value = '';
                        }}
                    >
                        <option value="">+ Add Optional Unit...</option>
                        {availableOptionalUnits
                            .filter(u => !studentGrades.has(u.id))
                            .map(u => (
                                <option key={u.id} value={u.id}>{u.number}. {u.name} ({u.glh} GLH)</option>
                            ))
                        }
                    </select>
                </div>
                <div className="overflow-x-auto border-x border-b rounded-b-lg">
                     {student.results.filter(r => {
                         const u = course.units.find(unit => unit.id === r.unitId);
                         return u && u.type === 'Optional';
                     }).length === 0 ? (
                         <div className="p-8 text-center text-gray-400 italic">No optional units selected. Add one from the dropdown above.</div>
                     ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-2 w-24">Type</th>
                                    <th className="px-4 py-2 w-20">Assess</th>
                                    <th className="px-4 py-2 w-16 text-center">No.</th>
                                    <th className="px-4 py-2">Unit Name</th>
                                    <th className="px-4 py-2 w-16 text-center">GLH</th>
                                    <th className="px-4 py-2 w-32">Grade</th>
                                    <th className="px-4 py-2 w-16 text-right">Pts</th>
                                    <th className="px-4 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {student.results
                                    .map(r => course.units.find(u => u.id === r.unitId))
                                    .filter((u): u is UnitDefinition => !!u && u.type === 'Optional')
                                    .map(u => renderUnitRow(u, true))
                                }
                            </tbody>
                        </table>
                     )}
                </div>
            </div>

        </div>

        {/* Sidebar / Stats / AI */}
        <div className="space-y-6">
            
            {/* Visual Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-4">Points Visualizer</h4>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                             <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis hide />
                             <Tooltip />
                             <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                                <Cell fill="#007FA3" />
                                <Cell fill="#cbd5e1" />
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Target based on next boundary</p>
            </div>

            {/* AI Coach */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                </div>
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    AI Grade Coach
                </h3>
                
                {!analysis ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-indigo-700 mb-4">Want to know how to reach the next grade level?</p>
                        <button 
                            onClick={runAIAnalysis}
                            disabled={loadingAnalysis}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded shadow transition-all disabled:opacity-50 w-full"
                        >
                            {loadingAnalysis ? 'Analyzing...' : 'Analyze My Grades'}
                        </button>
                    </div>
                ) : (
                    <div className="text-sm text-indigo-900 bg-white/50 p-3 rounded border border-indigo-100 animate-fadeIn">
                        {analysis}
                        <button 
                            onClick={() => setAnalysis('')}
                            className="text-xs text-indigo-500 underline mt-2 block hover:text-indigo-700"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total GLH Taken:</span>
                        <span className="font-medium">{totals.currentGLH} / {course.totalGLH}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Mandatory Status:</span>
                        <span className={`font-medium ${totals.mandatoryPassed ? 'text-green-600' : 'text-red-500'}`}>
                            {totals.mandatoryPassed ? 'Pass' : 'Incomplete'}
                        </span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default StudentCalculator;