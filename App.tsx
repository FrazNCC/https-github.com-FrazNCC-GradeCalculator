
import React, { useState } from 'react';
import { Course, Student, Grade, User, UserRole } from './types';
import { INITIAL_COURSES } from './constants';
import { CourseBuilder } from './components/CourseBuilder';
import { GradeCalculator } from './components/GradeCalculator';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { generateId } from './utils';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 'admin1', username: 'Frazadmin', password: 'Frazadmin', role: 'admin' }
  ]);

  // App Data State
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [view, setView] = useState<'dashboard' | 'calculator' | 'builder' | 'admin'>('dashboard');
  const [courseToEdit, setCourseToEdit] = useState<Course | undefined>(undefined);

  // Derived State
  const activeCourse = courses.find(c => c.id === activeCourseId);
  const activeStudents = students.filter(s => s.courseId === activeCourseId);

  // Auth Handlers
  const handleLogin = (u: string, p: string) => {
    const user = users.find(user => user.username === u && user.password === p);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
          setView('admin');
      } else {
          setView('dashboard');
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
    setActiveCourseId('');
  };

  const handleCreateUser = (u: string, p: string, role: UserRole = 'teacher') => {
    const newUser: User = {
      id: generateId(),
      username: u,
      password: p,
      role
    };
    setUsers([...users, newUser]);
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If the logged in user updated themselves, update local state
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };

  // Course Handlers
  const handleSaveCourse = (savedCourse: Course) => {
    if (courseToEdit) {
      setCourses(courses.map(c => c.id === savedCourse.id ? savedCourse : c));
    } else {
      setCourses([...courses, savedCourse]);
    }
    setActiveCourseId(savedCourse.id);
    setCourseToEdit(undefined);
    setView('calculator');
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? All associated student data will be lost.")) {
      const newCourses = courses.filter(c => c.id !== courseId);
      setCourses(newCourses);
      setStudents(students.filter(s => s.courseId !== courseId));
      
      if (activeCourseId === courseId) {
        setActiveCourseId('');
        setView('dashboard');
      }
    }
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setView('builder');
  };

  const handleCreateCourse = () => {
    setCourseToEdit(undefined);
    setView('builder');
  }

  const handleSelectCourse = (courseId: string) => {
      setActiveCourseId(courseId);
      setView('calculator');
  }

  // Student Handlers
  const handleAddStudent = (name: string) => {
    if (!activeCourse) return;

    const initialResults = activeCourse.units.map(u => ({ 
      unitId: u.id, 
      grade: Grade.U,
      locked: false
    }));

    const newStudent: Student = {
      id: generateId(),
      name,
      courseId: activeCourse.id,
      results: initialResults
    };

    setStudents([...students, newStudent]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  // Sort courses
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return (b.academicYear || '').localeCompare(a.academicYear || '');
    }
    return a.sector.localeCompare(b.sector);
  });

  // Render Login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-full w-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Navbar - Fixed Height */}
      <nav className="flex-none bg-[#002f3b] text-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <svg className="w-8 h-8 text-[#00c7b1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">Grade Calculator</span>
            <span className="font-bold text-lg tracking-tight sm:hidden">Calc</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
             <div className="hidden md:flex gap-2">
               {currentUser.role === 'admin' && (
                  <button 
                      onClick={() => setView('admin')}
                      className={`px-3 py-1 rounded transition-colors ${view === 'admin' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'}`}
                  >
                      Admin
                  </button>
               )}
               <button 
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-1 rounded transition-colors ${view === 'dashboard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'}`}
               >
                  Courses
               </button>
               {activeCourseId && (
                  <button 
                      onClick={() => setView('calculator')}
                      className={`px-3 py-1 rounded transition-colors ${view === 'calculator' ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'}`}
                  >
                      Calculator
                  </button>
               )}
             </div>
             
             <div className="h-6 w-px bg-slate-700 mx-1"></div>
             
             <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-slate-300">{currentUser.username}</span>
                <button 
                onClick={handleLogout}
                className="text-orange-400 hover:text-orange-300 font-medium"
                >
                Logout
                </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {view === 'admin' && currentUser.role === 'admin' && (
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <AdminDashboard 
                    currentUser={currentUser}
                    allUsers={users}
                    onCreateUser={handleCreateUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                />
            </div>
        )}

        {view === 'dashboard' && (
            <div className="flex-1 overflow-y-auto pr-2 pb-10">
                <Dashboard 
                    courses={courses}
                    currentUser={currentUser}
                    onSelectCourse={handleSelectCourse}
                    onCreateCourse={handleCreateCourse}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                />
            </div>
        )}

        {view === 'calculator' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Course Selector */}
            <div className="flex-none bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 z-20">
               <div className="flex-1 w-full">
                 <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Active Course</label>
                 <select 
                   value={activeCourseId}
                   onChange={(e) => setActiveCourseId(e.target.value)}
                   className="w-full p-2 border rounded bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-orange-500"
                 >
                   {sortedCourses.length === 0 && <option value="">No courses available</option>}
                   {sortedCourses.map(c => (
                     <option key={c.id} value={c.id}>
                        [{c.academicYear || 'N/A'}] {c.sector} - {c.qualification}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div className="flex items-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <button 
                    onClick={() => activeCourse && handleEditCourse(activeCourse)}
                    disabled={!activeCourse}
                    className="flex items-center gap-2 px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors text-sm disabled:opacity-50"
                  >
                    Edit Spec
                  </button>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded shadow-sm text-sm font-medium transition-colors ml-2"
                  >
                     Back
                  </button>
               </div>
            </div>
            
            {/* Calculator Component */}
            <div className="flex-1 min-h-0 relative">
              {activeCourse ? (
                <GradeCalculator 
                  course={activeCourse} 
                  students={activeStudents}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  currentUser={currentUser}
                />
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300 h-full flex items-center justify-center">
                  <p className="text-slate-500">No course selected.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'builder' && (
          <div className="flex-1 overflow-y-auto pr-2 pb-10">
             <div className="max-w-4xl mx-auto">
                <CourseBuilder 
                    initialCourse={courseToEdit}
                    onSave={handleSaveCourse}
                    onCancel={() => setView(activeCourseId ? 'calculator' : 'dashboard')}
                />
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
