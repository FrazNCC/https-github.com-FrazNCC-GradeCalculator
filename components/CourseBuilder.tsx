
import React, { useState, useEffect } from 'react';
import { Course, UnitDefinition, Sector, UnitType } from '../types';
import { generateId } from '../utils';

interface Props {
  initialCourse?: Course; // Optional prop for editing
  onSave: (course: Course) => void;
  onCancel: () => void;
}

export const CourseBuilder: React.FC<Props> = ({ initialCourse, onSave, onCancel }) => {
  // Course Metadata
  const [sector, setSector] = useState<Sector>('Esports');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [customName, setCustomName] = useState('');
  const [qualification, setQualification] = useState('Level 3 National Extended Diploma');
  const [totalGLH, setTotalGLH] = useState(1080);

  // Unit Staging
  const [units, setUnits] = useState<UnitDefinition[]>([]);
  
  // New Unit Form
  const [uNumber, setUNumber] = useState(1);
  const [uName, setUName] = useState('');
  const [uGLH, setUGLH] = useState(60);
  const [uType, setUType] = useState<UnitType>('Mandatory');

  // Load initial data if editing
  useEffect(() => {
    if (initialCourse) {
      setSector(initialCourse.sector);
      setAcademicYear(initialCourse.academicYear || '2024-25');
      setCustomName(initialCourse.name);
      setQualification(initialCourse.qualification);
      setTotalGLH(initialCourse.totalGLH);
      setUnits(initialCourse.units);
      
      // Calculate next likely unit number
      const maxNum = initialCourse.units.reduce((max, u) => Math.max(max, u.number), 0);
      setUNumber(maxNum + 1);
    }
  }, [initialCourse]);

  const handleAddUnit = () => {
    if (!uName) return;
    const newUnit: UnitDefinition = {
      id: generateId(),
      number: uNumber,
      name: uName,
      glh: uGLH,
      type: uType
    };
    setUnits([...units, newUnit].sort((a, b) => a.number - b.number));
    setUNumber(prev => prev + 1);
    setUName('');
  };

  const handleRemoveUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  const handleSaveCourse = () => {
    const course: Course = {
      id: initialCourse ? initialCourse.id : generateId(), // Preserve ID if editing
      academicYear,
      sector,
      name: customName || sector,
      qualification,
      totalGLH,
      units
    };
    onSave(course);
  };

  // Generate Academic Years (Previous year, Current, +3 Future)
  const getAcademicYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 1; // Start from previous year
    
    for (let i = 0; i < 6; i++) {
        const y = startYear + i;
        years.push(`${y}-${(y + 1).toString().slice(2)}`);
    }
    return years;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{initialCourse ? 'Edit Course' : 'Create Course'}</h2>
          <p className="text-slate-300 text-sm">{initialCourse ? 'Update existing specification' : 'Define a new BTEC specification'}</p>
        </div>
        {initialCourse && (
            <span className="bg-orange-600 text-xs px-2 py-1 rounded font-mono">EDIT MODE</span>
        )}
      </div>
      
      <div className="p-6 space-y-8">
        
        {/* Step 1: Course Details */}
        <section className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">1. Qualification Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Year</label>
              <select 
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-orange-500"
              >
                {getAcademicYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sector</label>
              <select 
                value={sector}
                onChange={e => setSector(e.target.value as Sector)}
                className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="Esports">Esports</option>
                <option value="IT">IT</option>
                <option value="Computing">Computing</option>
                <option value="Business">Business</option>
                <option value="Creative Media">Creative Media</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Name (Optional)</label>
              <input 
                type="text" 
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder={sector}
                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qualification Type</label>
              <select 
                value={qualification}
                onChange={e => setQualification(e.target.value)}
                className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="Level 3 National Extended Diploma">Extended Diploma (1080 GLH)</option>
                <option value="Level 3 National Diploma">Diploma (720 GLH)</option>
                <option value="Level 3 National Foundation Diploma">Foundation Diploma (510 GLH)</option>
                <option value="Level 3 National Extended Certificate">Extended Certificate (360 GLH)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total GLH</label>
              <input 
                type="number"
                value={totalGLH}
                onChange={e => setTotalGLH(Number(e.target.value))}
                className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Step 2: Units */}
        <section className="space-y-4">
          <div className="flex justify-between items-end border-b pb-2">
            <h3 className="font-semibold text-slate-800">2. Define Units</h3>
            <span className={`text-xs px-2 py-1 rounded ${units.reduce((acc, u) => acc + u.glh, 0) > totalGLH ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
               Current Total: <strong>{units.reduce((acc, u) => acc + u.glh, 0)}</strong> / {totalGLH} GLH
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-12 gap-2 items-end shadow-sm">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">No.</label>
              <input type="number" value={uNumber} onChange={e => setUNumber(Number(e.target.value))} className="w-full border rounded p-2 text-sm" />
            </div>
            <div className="col-span-6 md:col-span-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Unit Name</label>
              <input type="text" value={uName} onChange={e => setUName(e.target.value)} className="w-full border rounded p-2 text-sm" placeholder="e.g. Systems Architecture" />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">GLH</label>
              <select value={uGLH} onChange={e => setUGLH(Number(e.target.value))} className="w-full border rounded p-2 text-sm bg-white">
                <option value={60}>60</option>
                <option value={90}>90</option>
                <option value={120}>120</option>
              </select>
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Type</label>
              <select value={uType} onChange={e => setUType(e.target.value as UnitType)} className="w-full border rounded p-2 text-sm bg-white">
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="col-span-6 md:col-span-2">
              <button onClick={handleAddUnit} className="w-full bg-slate-800 text-white rounded p-2 text-sm hover:bg-slate-700 font-medium">Add Unit</button>
            </div>
          </div>

          <div className="overflow-hidden border rounded bg-white shadow-sm">
            {units.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No units added yet.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                  <tr>
                    <th className="p-3 w-16 text-center">No.</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 w-20">Type</th>
                    <th className="p-3 w-20 text-center">GLH</th>
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {units.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-500">{u.number}</td>
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs border ${u.type === 'Mandatory' ? 'bg-orange-50 text-orange-800 border-orange-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                          {u.type}
                        </span>
                      </td>
                      <td className="p-3 text-center">{u.glh}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleRemoveUnit(u.id)} className="text-red-400 hover:text-red-600 transition-colors font-bold">&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
          <button onClick={handleSaveCourse} className="px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 shadow-sm">
            {initialCourse ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
};
