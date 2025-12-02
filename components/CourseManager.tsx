import React, { useState } from 'react';
import { Course, UnitDefinition, Sector } from '../types';
import { generateId } from '../utils';

interface Props {
  onSave: (course: Course) => void;
  onCancel: () => void;
}

const CourseManager: React.FC<Props> = ({ onSave, onCancel }) => {
  const [sector, setSector] = useState<Sector>('Esports');
  const [courseName, setCourseName] = useState('');
  const [qualification, setQualification] = useState('Level 3 National Extended Diploma');
  const [totalGLH, setTotalGLH] = useState(1080);
  const [units, setUnits] = useState<UnitDefinition[]>([]);
  
  // Temp unit state
  const [unitName, setUnitName] = useState('');
  const [unitNumber, setUnitNumber] = useState(1);
  const [unitGLH, setUnitGLH] = useState(60);
  const [unitType, setUnitType] = useState<'Mandatory' | 'Optional'>('Mandatory');

  const addUnit = () => {
    if (!unitName) return;
    const newUnit: UnitDefinition = {
      id: generateId(),
      number: unitNumber,
      name: unitName,
      glh: unitGLH,
      type: unitType
    };
    setUnits([...units, newUnit]);
    setUnitName('');
    setUnitNumber(prev => prev + 1);
  };

  const handleSubmit = () => {
    if (!courseName) return;
    onSave({
      id: generateId(),
      sector,
      name: courseName,
      qualification,
      totalGLH,
      units
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Course</h2>
      
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select 
                    value={sector}
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                    <option value="Esports">Esports</option>
                    <option value="Computing">Computing</option>
                    <option value="IT">IT</option>
                    <option value="Business">Business</option>
                    <option value="Creative Media">Creative Media</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
               <input 
                type="text" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Creative Media Practice"
              />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                 <input 
                    type="text" 
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                 />
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Total GLH</label>
                 <input 
                    type="number" 
                    value={totalGLH}
                    onChange={(e) => setTotalGLH(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                 />
            </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-700 mb-4">Add Units</h3>
        
        <div className="bg-gray-50 p-4 rounded mb-4 grid grid-cols-12 gap-2 items-end">
            <div className="col-span-2">
                <label className="text-xs text-gray-500">Number</label>
                <input type="number" value={unitNumber} onChange={e => setUnitNumber(Number(e.target.value))} className="w-full p-1 border rounded" />
            </div>
            <div className="col-span-4">
                <label className="text-xs text-gray-500">Name</label>
                <input type="text" value={unitName} onChange={e => setUnitName(e.target.value)} className="w-full p-1 border rounded" placeholder="Unit Name" />
            </div>
            <div className="col-span-2">
                <label className="text-xs text-gray-500">GLH</label>
                <select value={unitGLH} onChange={e => setUnitGLH(Number(e.target.value))} className="w-full p-1 border rounded">
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                    <option value={120}>120</option>
                </select>
            </div>
             <div className="col-span-2">
                <label className="text-xs text-gray-500">Type</label>
                <select value={unitType} onChange={e => setUnitType(e.target.value as any)} className="w-full p-1 border rounded">
                    <option value="Mandatory">Mandatory</option>
                    <option value="Optional">Optional</option>
                </select>
            </div>
            <div className="col-span-2">
                <button onClick={addUnit} className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm h-8">Add</button>
            </div>
        </div>

        <div className="max-h-48 overflow-y-auto mb-6">
            {units.length === 0 && <p className="text-sm text-gray-400 text-center italic">No units added yet.</p>}
            <ul className="space-y-1">
                {units.map(u => (
                    <li key={u.id} className="text-sm flex justify-between bg-white p-2 border rounded">
                        <span><span className="font-bold text-gray-500">#{u.number}</span> {u.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{u.type} - {u.glh} GLH</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium">Save Course</button>
      </div>
    </div>
  );
};

export default CourseManager;