import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Download, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const getImageUrl = (photoUrl) => {
  if (!photoUrl) return '';
  
  let cleanUrl = photoUrl.trim();
  
  // Strip brackets that might be present due to split-fallback serializer issues
  if (cleanUrl.startsWith('[')) {
    cleanUrl = cleanUrl.substring(1).trim();
  }
  if (cleanUrl.endsWith(']')) {
    cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1).trim();
  }
  // Strip quotes if they were somehow included inside the string
  cleanUrl = cleanUrl.replace(/^['"]|['"]$/g, '').trim();

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  if (cleanUrl.startsWith('/')) {
    return `http://72.61.229.236${cleanUrl}`;
  }
  return `http://72.61.229.236/${cleanUrl}`;
};

export default function TaskReport() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const filterTaskId = searchParams.get('taskId');

  const displayedTasks = filterTaskId
    ? tasks.filter(t => {
        const taskId = t?.task_id && typeof t.task_id === 'object' ? t.task_id.id : t?.task_id;
        return String(taskId) === String(filterTaskId);
      })
    : tasks;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/activity-record/');
      setTasks(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data from backend. Make sure the MySQL server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [lightbox, setLightbox] = useState({ isOpen: false, photos: [], currentIndex: 0, address: '' });

  const openLightbox = (photos, index = 0, address = '') => {
    if (!photos || photos.length === 0) return;
    setLightbox({ isOpen: true, photos: photos.map(p => getImageUrl(p)), currentIndex: index, address });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
  };

  const nextPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.photos.length
    }));
  };

  const prevPhoto = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
    }));
  };

  // Grouping logic
  const groupedTasks = [];
  const groupMap = new Map();

  displayedTasks.forEach(t => {
    if (!t) return;
    const projName = t.task_id?.project_id?.title || t.project_id?.title || '-';
    const address = t.gps_address || '-';
    const groupKey = `${projName}___${address}`;

    let photos = [];
    if (Array.isArray(t.photo)) {
      photos = t.photo;
    } else if (typeof t.photo === 'string' && t.photo.trim() !== '') {
      try {
        photos = JSON.parse(t.photo);
        if (!Array.isArray(photos)) photos = [t.photo];
      } catch(e) {
        photos = [t.photo];
      }
    }

    if (groupMap.has(groupKey)) {
      const existing = groupMap.get(groupKey);
      if (photos.length > 0) {
        existing.all_photos = [...existing.all_photos, ...photos];
      }
    } else {
      const newEntry = { ...t, all_photos: [...photos] };
      groupMap.set(groupKey, newEntry);
      groupedTasks.push(newEntry);
    }
  });

  const handleExportCSV = () => {
    if (displayedTasks.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "SNo.",
      "Ref No. & DateTime",
      "Flex ID",
      "Project Detail",
      "Employee_Name",
      "Size_of_DWP",
      "Dealer Info",
      "Site Location",
      "Address",
      "Status"
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    groupedTasks.forEach((t, idx) => {
      const projName = t.task_id?.project_id?.title || t.project_id?.title || '-';
      const empName = t.task_id?.emp_id?.name || t.emp_id?.name || `Employee #${t.emp_id}`;
      const dealerName = t.task_id?.dealer_name?.name || t.dealer_name?.name || '-';
      const siteLoc = t.task_id?.site_location || t.site_location || '-';

      const row = [
        idx + 1,
        t.created_date ? new Date(t.created_date).toLocaleString('en-GB').replace(/,/g, '') : '-',
        t.flex_id || t.id,
        `"${projName.replace(/"/g, '""')}"`,
        `"${empName.replace(/"/g, '""')}"`,
        `"${(t.flex_size || '-').replace(/"/g, '""')}"`,
        `"${dealerName.replace(/"/g, '""')}"`,
        `"${siteLoc.replace(/"/g, '""')}"`,
        `"${(t.gps_address || '-').replace(/"/g, '""')}"`,
        t.status == 1 ? 'Completed' : 'Pending'
      ];
      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'task_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 relative">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Task Report</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Task Report</li>
          </ol>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 p-4">
         <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">Master View Filters</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Project Name</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Client Name</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Employee Name</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">State</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">District</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tehsil</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Location</label>
               <input type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dealer Name</label>
               <input type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">From Date</label>
               <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To Date</label>
               <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            
            <div className="flex items-end justify-start lg:col-span-2 mt-2 gap-2">
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"><Search size={14}/> Search</button>
               <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"><RefreshCw size={14} /> Reset</button>
            </div>
         </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <div className="flex items-center gap-4">
              <h3 className="font-semibold text-white">Consolidated Analysis</h3>
              {filterTaskId && (
                 <span className="bg-indigo-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-2 border border-indigo-400">
                    Filtered by Task #{filterTaskId}
                    <button 
                       onClick={() => setSearchParams({})} 
                       className="hover:text-rose-200 font-bold ml-1 text-sm focus:outline-none"
                       title="Clear filter"
                    >
                       ×
                    </button>
                 </span>
              )}
           </div>
           <button onClick={handleExportCSV} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
              <Download size={16} /> Excel Export
           </button>
        </div>
        
        <div className="overflow-x-auto w-full">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
               <Loader2 className="animate-spin mb-4" size={32} />
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-64 text-rose-500 p-8 text-center max-w-lg mx-auto">
               <AlertCircle className="mb-4" size={48} />
               <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-2">{error}</p>
             </div>
          ) : groupedTasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
               No records found matching filters.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">SNo.</th>
                  <th className="px-5 py-4">Ref No. & DateTime</th>
                  <th className="px-5 py-4">Project Detail</th>
                  <th className="px-5 py-4">Employee_Name</th>
                  <th className="px-5 py-4">Size_of_DWP</th>
                  <th className="px-5 py-4">Dealer Info</th>
                  <th className="px-5 py-4">Site Location</th>
                  <th className="px-5 py-4 text-center">Photo</th>
                  <th className="px-5 py-4">View</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedTasks.map((t, idx) => {
                  return (
                  <tr key={t?.id || idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {t?.created_date ? new Date(t.created_date).toLocaleString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Flex ID:</span> {t?.flex_id || t?.id} <br/>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Project:</span> {t?.task_id?.project_id?.title || t?.project_id?.title || '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{t?.task_id?.emp_id?.name || t?.emp_id?.name || `Employee #${t?.emp_id}`}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t?.flex_size || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t?.task_id?.dealer_name?.name || t?.dealer_name?.name || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t?.task_id?.site_location || t?.site_location || '-'}</td>
                    
                    <td className="px-5 py-3 text-center">
                       {t.all_photos && t.all_photos.length > 0 ? (
                          <div 
                             onClick={() => openLightbox(t.all_photos, 0, t.gps_address)}
                             className="inline-flex items-center justify-center cursor-pointer group/img overflow-hidden rounded-md w-10 h-10 shadow-sm hover:shadow-md transition-all duration-300 relative bg-slate-100"
                          >
                             <img 
                                src={getImageUrl(t.all_photos[0])} 
                                alt="Activity thumbnail" 
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" 
                             />
                             {t.all_photos.length > 1 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                                  +{t.all_photos.length - 1}
                                </div>
                             )}
                          </div>
                       ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t?.view_id || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t?.gps_address || '-'}</td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                       {t?.status == 1 ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Completed</span>
                       ) : (
                          <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">Pending</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Delete</button>
                        <button className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Remark</button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50">
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-4xl max-h-screen flex items-center justify-center p-4">
             <img src={lightbox.photos[lightbox.currentIndex]} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm" alt="Preview" />
             
             {lightbox.photos.length > 1 && (
               <>
                 <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors">
                   <ChevronLeft size={24} />
                 </button>
                 <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors">
                   <ChevronRight size={24} />
                 </button>
               </>
             )}
             
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4">
               {lightbox.address && lightbox.address !== '-' && (
                 <div className="flex items-center gap-1.5 text-white bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md text-sm font-medium shadow-lg max-w-[90vw] md:max-w-[60vw]">
                   <MapPin size={16} className="text-rose-400 shrink-0" />
                   <span className="truncate">{lightbox.address}</span>
                 </div>
               )}
               <div className="text-white/80 text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg">
                 {lightbox.currentIndex + 1} / {lightbox.photos.length}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
