
import React from 'react';
import { Course, User } from '../types';

interface Props {
  courses: Course[];
  currentUser: User;
  onSelectCourse: (courseId: string) => void;
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

const Dashboard: React.FC<Props> = ({ 
  courses, 
  currentUser,
  onSelectCourse, 
  onCreateCourse, 
  onEditCourse, 
  onDeleteCourse
}) => {
  // Group courses by Academic Year
  const groupedCourses = courses.reduce((acc, course) => {
    const year = course.academicYear || 'Unknown Year';
    if (!acc[year]) acc[year] = [];
    acc[year].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  // Sort years descending (newest first)
  const sortedYears = Object.keys(groupedCourses).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Welcome / Header */}
      <div className="bg-gradient-to-r from-[#002f3b] to-[#005a70] rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Dashboard</h1>
          <p className="text-blue-100 opacity-90">Manage your BTEC courses, student records, and grade predictions.</p>
          <div className="mt-2 text-xs bg-white/10 inline-block px-2 py-1 rounded">
            Logged in as: <span className="font-bold">{currentUser.username}</span> ({currentUser.role})
          </div>
        </div>
        <button 
          onClick={onCreateCourse}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Create New Course
        </button>
      </div>

      {/* Course Lists by Year */}
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-slate-700">No Courses Found</h3>
          <p className="text-slate-500 mt-2">Get started by creating your first BTEC specification.</p>
          <button 
            onClick={onCreateCourse}
            className="mt-6 text-orange-600 font-medium hover:underline"
          >
            Create Course Now &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedYears.map(year => (
            <div key={year}>
              <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-3">
                <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-sm font-mono">{year}</span>
                <span>Academic Year</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedCourses[year]
                  .sort((a, b) => a.sector.localeCompare(b.sector))
                  .map(course => (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
                  >
                    <div className="p-6 flex-1 cursor-pointer" onClick={() => onSelectCourse(course.id)}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                          ${course.sector === 'Esports' ? 'bg-purple-100 text-purple-700' : 
                            course.sector === 'IT' ? 'bg-blue-100 text-blue-700' :
                            course.sector === 'Computing' ? 'bg-cyan-100 text-cyan-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {course.sector}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                           <button 
                            onClick={() => onEditCourse(course)}
                            className="text-slate-400 hover:text-blue-600" title="Edit"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                           </button>
                           <button 
                            onClick={() => onDeleteCourse(course.id)}
                            className="text-slate-400 hover:text-red-600" title="Delete"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">{course.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{course.qualification}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                          {course.units.length} Units
                        </div>
                        <div className="flex items-center gap-1">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           {course.totalGLH} GLH
                        </div>
                      </div>
                    </div>
                    <div 
                        className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-sm font-medium text-orange-600 cursor-pointer hover:bg-orange-50 transition-colors"
                        onClick={() => onSelectCourse(course.id)}
                    >
                        Open Calculator &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
