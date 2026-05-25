import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    profile_code: '',
    name: '',
    contact_person: '',
    mobile_no: '',
    state: '',
    city: '',
    address: '',
    profile_image: 'profile.jpg',
    password: '',
    role_type: 1,
    joining_date: new Date().toISOString().split('T')[0],
    online_status: 1,
    working_hrs: '09:00:00',
    is_overtime_allowed: 1,
    status: 1
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          axios.get('/api/state-master/'),
          axios.get('/api/city-master/')
        ]);
        setStates(statesRes.data?.data || []);
        setCities(citiesRes.data?.data || []);
      } catch (e) {
        console.error("Failed to load states/cities");
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`/api/app-users/${id}/`);
          if (res.data?.data) {
             const d = res.data.data;
             setFormData({
                profile_code: d.profile_code || '',
                name: d.name || '',
                contact_person: d.contact_person || '',
                mobile_no: d.mobile_no || '',
                state: typeof d.state === 'object' && d.state ? d.state.id : (d.state || ''),
                city: typeof d.city === 'object' && d.city ? d.city.id : (d.city || ''),
                address: d.address || '',
                profile_image: d.profile_image || 'profile.jpg',
                password: d.password || '',
                role_type: d.role_type || 1,
                joining_date: d.joining_date ? d.joining_date.split('T')[0] : new Date().toISOString().split('T')[0],
                online_status: d.online_status ?? 1,
                working_hrs: d.working_hrs || '09:00:00',
                is_overtime_allowed: d.is_overtime_allowed ?? 1,
                status: d.status ?? 1
             });
          }
        } catch (e) {
          console.error("Failed to fetch user details", e);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.profile_code.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        state: formData.state || 1,
        city: formData.city || 101
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjg0LCJleHAiOjE3NjY0MTIzOTIsImlhdCI6MTc2NTgwNzU5Mn0.7HxWWa3-13A-5aTB2-KUalb4JBXKkclf6o6JGTDtAC8'
        }
      };

      if (id) {
         await axios.put(`/api/app-users/${id}/`, payload, config);
      } else {
         await axios.post('/api/app-users/', payload, config);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/employee-master');
      }, 1500);
    } catch (err) {
      console.error("API Error:", err);
      let errMsg = `Failed to ${id ? 'update' : 'add'} user. Please try again.`;
      if (err.response?.data) {
        if (err.response.data.errors) errMsg = err.response.data.errors;
        else if (err.response.data.message) errMsg = err.response.data.message;
        else errMsg = "An unknown error occurred on the server.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{id ? 'Edit User' : 'Add User / Employee'}</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/employee-master" className="hover:text-indigo-600 transition-colors">Employee Master</Link></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">{id ? 'Edit User' : 'Add User'}</li>
          </ol>
        </div>
        <Link to="/employee-master" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-600 dark:bg-slate-900 shrink-0">
          <h3 className="font-semibold text-white">User Details</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Error saving user</h4>
                {typeof error === 'string' ? (
                  <p className="text-sm mt-1">{error}</p>
                ) : (
                  <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                    {Object.entries(error).map(([field, msgs]) => (
                      <li key={field}>
                        <span className="font-semibold capitalize">{field.replace('_', ' ')}</span>: {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Success!</h4>
                <p className="text-sm">User {id ? 'updated' : 'added'} successfully. Redirecting...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Profile Code</label>
              <input type="text" name="profile_code" value={formData.profile_code} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="EMP001" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Full Name" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Person</label>
              <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Contact Person Name" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mobile No</label>
              <input type="tel" name="mobile_no" value={formData.mobile_no} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="+91..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Enter password" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Role Type</label>
              <select name="role_type" value={formData.role_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value={1}>Admin</option>
                <option value={2}>User</option>
                <option value={3}>Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Joining Date</label>
              <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Working Hours</label>
              <input type="time" name="working_hrs" value={formData.working_hrs} onChange={handleChange} step="1" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Online Status</label>
              <select name="online_status" value={formData.online_status} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value={1}>Online</option>
                <option value={0}>Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State</label>
              <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select State-</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
              <select name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select City-</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Profile Image (Path/Name)</label>
              <input type="text" name="profile_image" value={formData.profile_image} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="profile.jpg" />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Full address..."></textarea>
            </div>

            <div className="flex gap-8 pt-2 md:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_overtime_allowed" checked={formData.is_overtime_allowed === 1} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overtime Allowed</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="status" checked={formData.status === 1} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Account Status</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link to="/employee-master" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : (id ? 'Update User' : 'Save User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
