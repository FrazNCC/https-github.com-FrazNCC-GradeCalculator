
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface Props {
  currentUser: User;
  allUsers: User[];
  onCreateUser: (u: string, p: string, r: UserRole) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ currentUser, allUsers, onCreateUser, onEditUser, onDeleteUser }) => {
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<UserRole>('teacher');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [msg, setMsg] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formUsername || !formPassword) return;

        if (editingUser) {
            onEditUser({ ...editingUser, username: formUsername, password: formPassword, role: formRole });
            setMsg(`User updated successfully.`);
            setEditingUser(null);
        } else {
            onCreateUser(formUsername, formPassword, formRole);
            setMsg(`User created successfully.`);
        }
        setFormUsername('');
        setFormPassword('');
        setFormRole('teacher');
        setTimeout(() => setMsg(''), 3000);
    }

    const handleStartEdit = (user: User) => {
        setEditingUser(user);
        setFormUsername(user.username);
        setFormPassword(user.password);
        setFormRole(user.role);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormUsername('');
        setFormPassword('');
        setFormRole('teacher');
    };

     const handleDeleteClick = (userId: string) => {
        if (userId === currentUser.id) return;
        if (window.confirm("Delete this user?")) {
            onDeleteUser(userId);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-slate-800 text-white rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-slate-300">Manage system users and access rights.</p>
                <div className="mt-2 text-xs bg-slate-700 inline-block px-2 py-1 rounded">
                    Logged in as: <span className="font-bold">{currentUser.username}</span> ({currentUser.role})
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        {editingUser ? 'Edit User' : 'Create New User'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                            <input type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full border rounded p-2" placeholder="Username" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                            <input type="text" value={formPassword} onChange={e => setFormPassword(e.target.value)} className="w-full border rounded p-2" placeholder="Password" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                            <select 
                                value={formRole} 
                                onChange={e => setFormRole(e.target.value as UserRole)} 
                                className="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Admins can manage users and unlock grades. Teachers can manage courses and enter grades.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded">
                                {editingUser ? 'Update User' : 'Create User'}
                            </button>
                            {editingUser && (
                                <button type="button" onClick={handleCancelEdit} className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded">Cancel</button>
                            )}
                        </div>
                    </form>
                    {msg && <div className="mt-4 p-3 bg-green-50 text-green-700 rounded border border-green-200 text-sm font-medium text-center">{msg}</div>}
                </div>

                {/* User List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                     <h2 className="text-xl font-bold text-slate-800 mb-4">Registered Users</h2>
                     <div className="flex-1 overflow-auto border rounded max-h-[400px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {allUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-medium">
                                            {user.username}
                                            {user.id === currentUser.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 rounded">YOU</span>}
                                        </td>
                                        <td className="px-4 py-2 capitalize text-slate-600">{user.role}</td>
                                        <td className="px-4 py-2 text-right space-x-2">
                                            <button onClick={() => handleStartEdit(user)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Edit</button>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteClick(user.id)} 
                                                className={`text-xs font-medium ${user.id === currentUser.id ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                                                disabled={user.id === currentUser.id}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    )
};

export default AdminDashboard;
