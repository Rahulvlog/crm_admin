import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Download, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import ExportTaskTemplate from '../components/ExportTaskTemplate';

const getImageUrl = (photoUrl, forceCors = false) => {
  if (!photoUrl) return '';
  
  let cleanUrl = photoUrl.trim();
  
  if (cleanUrl.startsWith('[')) cleanUrl = cleanUrl.substring(1).trim();
  if (cleanUrl.endsWith(']')) cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1).trim();
  cleanUrl = cleanUrl.replace(/^['"]|['"]$/g, '').trim();

  if (cleanUrl.includes('http://72.61.229.236')) {
    cleanUrl = cleanUrl.split('http://72.61.229.236')[1];
  }
  if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1);
  if (cleanUrl.startsWith('https://')) return cleanUrl;

  if (import.meta.env.DEV && !forceCors) {
    return `http://72.61.229.236/${cleanUrl}`;
  } else {
    return `https://images.weserv.nl/?url=72.61.229.236/${cleanUrl}`;
  }
};

export default function TaskReport() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const filterTaskId = searchParams.get('taskId');

  const [filters, setFilters] = useState({
    project_name: '', client_name: '', employee_name: '', state_name: '',
    district_name: '', tehsil_name: '', site_location: '', dealer_name: '',
    from_date: '', to_date: ''
  });
  
  const [appliedFilters, setAppliedFilters] = useState({
    project_name: '', client_name: '', employee_name: '', state_name: '',
    district_name: '', tehsil_name: '', site_location: '', dealer_name: '',
    from_date: '', to_date: ''
  });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = () => setAppliedFilters(filters);
  const handleReset = () => {
    const emptyFilters = {
      project_name: '', client_name: '', employee_name: '', state_name: '',
      district_name: '', tehsil_name: '', site_location: '', dealer_name: '',
      from_date: '', to_date: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchParams({});
  };

  const displayedTasks = tasks.filter(t => {
    if (filterTaskId) {
      const taskId = t?.task_id && typeof t.task_id === 'object' ? t.task_id.id : t?.task_id;
      if (String(taskId) !== String(filterTaskId)) return false;
    }
    
    if (appliedFilters.project_name) {
      const p = t.task_id?.project_id?.title || t.project_id?.title || '';
      if (p !== appliedFilters.project_name) return false;
    }
    if (appliedFilters.client_name) {
      const c = t.task_id?.client_id?.name || t.client_id?.name || '';
      if (c !== appliedFilters.client_name) return false;
    }
    if (appliedFilters.employee_name) {
      const e = t.task_id?.emp_id?.name || t.emp_id?.name || '';
      if (e !== appliedFilters.employee_name) return false;
    }
    if (appliedFilters.state_name) {
      const s = t.task_id?.state?.name || t.state?.name || '';
      if (s !== appliedFilters.state_name) return false;
    }
    if (appliedFilters.district_name) {
      const d = t.task_id?.district?.name || t.district?.name || '';
      if (d !== appliedFilters.district_name) return false;
    }
    if (appliedFilters.tehsil_name) {
      const th = t.task_id?.tehsil?.name || t.tehsil?.name || '';
      if (th !== appliedFilters.tehsil_name) return false;
    }
    if (appliedFilters.site_location) {
      const loc = t.task_id?.site_location || t.site_location || '';
      if (!loc.toLowerCase().includes(appliedFilters.site_location.toLowerCase())) return false;
    }
    if (appliedFilters.dealer_name) {
      const dealer = t.task_id?.dealer_name?.name || t.dealer_name?.name || '';
      if (!dealer.toLowerCase().includes(appliedFilters.dealer_name.toLowerCase())) return false;
    }
    if (appliedFilters.from_date || appliedFilters.to_date) {
      const taskDate = t.created_date ? new Date(t.created_date) : null;
      if (!taskDate) return false;
      if (appliedFilters.from_date && taskDate < new Date(appliedFilters.from_date)) return false;
      if (appliedFilters.to_date) {
        const to = new Date(appliedFilters.to_date);
        to.setHours(23, 59, 59, 999);
        if (taskDate > to) return false;
      }
    }
    
    return true;
  });

  const uniqueProjects = [...new Set(tasks.map(t => t.task_id?.project_id?.title || t.project_id?.title).filter(Boolean))];
  const uniqueClients = [...new Set(tasks.map(t => t.task_id?.client_id?.name || t.client_id?.name).filter(Boolean))];
  const uniqueEmployees = [...new Set(tasks.map(t => t.task_id?.emp_id?.name || t.emp_id?.name).filter(Boolean))];
  const uniqueStates = [...new Set(tasks.map(t => t.task_id?.state?.name || t.state?.name).filter(Boolean))];
  const uniqueDistricts = [...new Set(tasks.map(t => t.task_id?.district?.name || t.district?.name).filter(Boolean))];
  const uniqueTehsils = [...new Set(tasks.map(t => t.task_id?.tehsil?.name || t.tehsil?.name).filter(Boolean))];

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
  const [galleryModal, setGalleryModal] = useState({ isOpen: false, task: null });
  const [remarkModal, setRemarkModal] = useState({ isOpen: false, task: null, remark: '', actionType: '' });
  const exportTemplateRef = React.useRef(null);
  const [exportType, setExportType] = useState(null); // 'pdf' | 'ppt' | null
  
  const openActionModal = (task, e, actionType) => {
    e.stopPropagation();
    setRemarkModal({ isOpen: true, task, remark: task.remark_1 || '', actionType });
  };

  const submitAction = async () => {
    if (!remarkModal.task) return;
    try {
      let payload = { remark_1: remarkModal.remark };
      if (remarkModal.actionType === 'approve') payload.status = 1;
      else if (remarkModal.actionType === 'reject') payload.status = 2;
      
      const res = await axios.put(`/api/activity-record/${remarkModal.task.id}/`, payload);
      if (res.data.status) {
        setTasks(prev => prev.map(t => t.id === remarkModal.task.id ? { ...t, ...payload } : t));
        setRemarkModal({ isOpen: false, task: null, remark: '', actionType: '' });
      } else {
        alert(`Failed to ${remarkModal.actionType || 'update remark'}.`);
      }
    } catch (err) {
      alert(`Failed to ${remarkModal.actionType || 'update remark'}.`);
    }
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

  const handleExportReady = async () => {
    if (!exportTemplateRef.current || !exportType) return;
    
    try {
      const pages = exportTemplateRef.current.querySelectorAll('.export-page');
      
      if (exportType === 'pdf') {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [900, 1200] });
        for (let i = 0; i < pages.length; i++) {
          const canvas = await html2canvas(pages[i], { scale: 1.5, useCORS: true, allowTaint: true });
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, 900, 1200);
        }
        pdf.save('Consolidated_Task_Report.pdf');
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExportType(null);
    }
  };

  const generatePPT = async () => {
    setExportType('ppt');
    try {
      const pptx = new pptxgen();
      pptx.defineLayout({ name: 'PORTRAIT', width: 8.5, height: 11 });
      pptx.layout = 'PORTRAIT';

      for (let taskIndex = 0; taskIndex < groupedTasks.length; taskIndex++) {
        const task = groupedTasks[taskIndex];
        const photos = task.all_photos || [];
        const pages = [];
        for (let i = 0; i < photos.length; i += 4) {
          pages.push(photos.slice(i, i + 4));
        }
        if (pages.length === 0) pages.push([]);

        const projName = task.task_id?.project_id?.title || task.project_id?.title || '-';
        const state = task.task_id?.state?.name || task.state?.name || '-';
        const district = task.task_id?.district?.name || task.district?.name || '-';
        const city = task.task_id?.city?.name || task.city?.name || '-';
        const siteLoc = task.task_id?.site_location || task.site_location || '-';
        const dealerName = task.task_id?.dealer_name?.name || task.dealer_name?.name || '-';
        const flexSize = task.flex_size || '-';
        const flexId = task.flex_id || task.id || '-';

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
          const slide = pptx.addSlide();
          let startY = 0.5;

          if (pageIndex === 0) {
            const tableRows = [
              [
                { text: "Project Name:", options: { fill: "F1F5F9", bold: true } }, { text: String(projName) },
                { text: "State:", options: { fill: "F1F5F9", bold: true } }, { text: String(state) }
              ],
              [
                { text: "District:", options: { fill: "F1F5F9", bold: true } }, { text: String(district) },
                { text: "City:", options: { fill: "F1F5F9", bold: true } }, { text: String(city) }
              ],
              [
                { text: "Site Location:", options: { fill: "F1F5F9", bold: true } }, { text: String(siteLoc) },
                { text: "Flex Range:", options: { fill: "F1F5F9", bold: true } }, { text: "-" }
              ],
              [
                { text: "Location Type:", options: { fill: "F1F5F9", bold: true } }, { text: "Rural/Urban" },
                { text: "Dealer Name:", options: { fill: "F1F5F9", bold: true } }, { text: String(dealerName) }
              ],
              [
                { text: "No. of Flex:", options: { fill: "F1F5F9", bold: true } }, { text: "-" },
                { text: "Size of Flex:", options: { fill: "F1F5F9", bold: true } }, { text: String(flexSize) }
              ],
              [
                { text: "Flex ID:", options: { fill: "F1F5F9", bold: true } }, { text: String(flexId) },
                { text: "", options: { fill: "F1F5F9", bold: true } }, { text: "" }
              ]
            ];

            slide.addTable(tableRows, { 
              x: 0.5, y: 0.5, w: 7.5, 
              rowH: 0.3, 
              border: { type: "solid", pt: 1, color: "CBD5E1" },
              fontSize: 10,
              color: "1E293B",
              valign: "middle"
            });
            startY = 2.8;
          }

          const pagePhotos = pages[pageIndex];
          const positions = [
            { x: 0.5, y: startY },
            { x: 4.25, y: startY },
            { x: 0.5, y: startY + 3.8 },
            { x: 4.25, y: startY + 3.8 }
          ];

          for (let pIdx = 0; pIdx < pagePhotos.length; pIdx++) {
            const photo = pagePhotos[pIdx];
            const pos = positions[pIdx];
            const w = 3.75;
            const h = 3.5;
            const imgUrl = getImageUrl(photo, true);

            let base64Data = null;
            try {
              const response = await fetch(imgUrl);
              const blob = await response.blob();
              base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            } catch (err) {
              console.error("Failed to load image for PPT:", err);
            }

            if (base64Data) {
              slide.addImage({ data: base64Data, x: pos.x, y: pos.y, w: w, h: h, sizing: { type: 'contain', w: w, h: h } });
            }

            const boxH = 0.6;
            const boxY = pos.y + h - boxH;
            slide.addShape(pptx.ShapeType.rect, { 
              x: pos.x, y: boxY, w: w, h: boxH, 
              fill: { color: "000000", transparency: 50 } 
            });

            const gpsAddress = task.gps_address && task.gps_address !== '-' ? task.gps_address : '';
            slide.addText(gpsAddress, { 
              x: pos.x + 0.1, y: boxY, w: w - 0.2, h: 0.3, 
              color: "FFFFFF", fontSize: 9, bold: true, 
              valign: "bottom" 
            });

            const lat = task.latitude || task.task_id?.latitude || '';
            const long = task.longitude || task.task_id?.longitude || '';
            const dateStr = task.created_date ? new Date(task.created_date).toLocaleString('en-GB') : '';
            const gpsDetails = `Lat: ${lat}  Long: ${long}  Date: ${dateStr}`;
            
            slide.addText(gpsDetails, { 
              x: pos.x + 0.1, y: boxY + 0.3, w: w - 0.2, h: 0.2, 
              color: "FFFFFF", fontSize: 8, 
              valign: "top" 
            });
          }
        }
      }

      await pptx.writeFile({ fileName: 'Consolidated_Task_Report.pptx' });
    } catch (error) {
      console.error("PPT Export failed:", error);
      alert("Failed to export PPT. Please try again.");
    } finally {
      setExportType(null);
    }
  };

  const openLightbox = (photos, index = 0, task = null) => {
    if (!photos || photos.length === 0) return;
    setLightbox({ isOpen: true, photos: photos.map(p => getImageUrl(p)), currentIndex: index, task });
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
        t.status == 1 ? 'Completed' : t.status == 2 ? 'Rejected' : 'Pending'
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
              <select name="project_name" value={filters.project_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueProjects.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Client Name</label>
              <select name="client_name" value={filters.client_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueClients.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Employee Name</label>
               <select name="employee_name" value={filters.employee_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueEmployees.map((e, i) => <option key={i} value={e}>{e}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">State</label>
               <select name="state_name" value={filters.state_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueStates.map((s, i) => <option key={i} value={s}>{s}</option>)}
               </select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">District</label>
               <select name="district_name" value={filters.district_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueDistricts.map((d, i) => <option key={i} value={d}>{d}</option>)}
               </select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tehsil</label>
               <select name="tehsil_name" value={filters.tehsil_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200">
                <option value="">--select--</option>
                {uniqueTehsils.map((t, i) => <option key={i} value={t}>{t}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Location</label>
               <input type="text" name="site_location" value={filters.site_location} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dealer Name</label>
               <input type="text" name="dealer_name" value={filters.dealer_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">From Date</label>
               <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To Date</label>
               <input type="date" name="to_date" value={filters.to_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-200" />
            </div>
            
            <div className="flex items-end justify-start lg:col-span-2 mt-2 gap-2">
               <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"><Search size={14}/> Search</button>
               <button onClick={handleReset} className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"><RefreshCw size={14} /> Reset</button>
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
           <div className="flex items-center gap-2">
             <button 
               onClick={generatePPT} 
               disabled={exportType !== null}
               className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 border border-white/10 shadow-sm"
             >
               {exportType === 'ppt' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
               {exportType === 'ppt' ? 'Generating...' : 'PPT'}
             </button>
             <button 
               onClick={() => setExportType('pdf')} 
               disabled={exportType !== null}
               className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 border border-white/10 shadow-sm"
             >
               {exportType === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
               {exportType === 'pdf' ? 'Generating...' : 'PDF'}
             </button>
             <button onClick={handleExportCSV} className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
                <Download size={14} /> Excel
             </button>
           </div>
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
                  <tr key={t?.id || idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => { if (t.all_photos && t.all_photos.length > 0) setGalleryModal({isOpen: true, task: t}) }}>
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
                          <div className="inline-flex items-center justify-center rounded-md w-10 h-10 shadow-sm bg-slate-100 dark:bg-slate-800 relative">
                             <img src={getImageUrl(t.all_photos[0])} alt="Thumbnail" className="w-full h-full object-cover rounded-md" />
                             {t.all_photos.length > 1 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold rounded-md backdrop-blur-[1px]">
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
                       ) : t?.status == 2 ? (
                          <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Rejected</span>
                       ) : (
                          <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">Pending</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-center justify-center gap-1">
                        {t?.status != 1 && t?.status != 2 && (
                           <>
                             <button onClick={(e) => openActionModal(t, e, 'approve')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Approve</button>
                             <button onClick={(e) => openActionModal(t, e, 'reject')} className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Reject</button>
                           </>
                        )}
                        <button onClick={(e) => openActionModal(t, e, 'remark')} className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Remark</button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryModal.isOpen && galleryModal.task && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setGalleryModal({isOpen: false, task: null})}>
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 flex-wrap gap-4">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-3">
                    Photos for Task #{galleryModal.task.flex_id || galleryModal.task.id}
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-200 dark:border-indigo-500/30">
                       {galleryModal.task.all_photos.length} Photos
                    </span>
                 </h3>
                 <button onClick={() => setGalleryModal({isOpen: false, task: null})} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm ml-2">
                   <X size={20} />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
                    {galleryModal.task.all_photos.map((photo, idx) => (
                       <div 
                          key={idx}
                          onClick={() => openLightbox(galleryModal.task.all_photos, idx, galleryModal.task)}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:ring-4 hover:ring-indigo-500/30 transition-all group relative bg-slate-100 dark:bg-slate-800"
                       >
                          <img src={getImageUrl(photo)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Remark Modal */}
      {remarkModal.isOpen && remarkModal.task && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setRemarkModal({isOpen: false, task: null, remark: '', actionType: ''})}>
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 gap-4">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white capitalize">
                    {remarkModal.actionType === 'remark' ? 'Update Remark' : `${remarkModal.actionType} Task`}
                 </h3>
                 <button onClick={() => setRemarkModal({isOpen: false, task: null, remark: '', actionType: ''})} className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                   <X size={20} />
                 </button>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900">
                 <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Remark (Optional)</label>
                 <textarea 
                    value={remarkModal.remark} 
                    onChange={(e) => setRemarkModal({...remarkModal, remark: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 min-h-[100px] resize-y"
                    placeholder="Enter remark here..."
                 ></textarea>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3">
                 <button onClick={() => setRemarkModal({isOpen: false, task: null, remark: '', actionType: ''})} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                 <button onClick={submitAction} className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${
                    remarkModal.actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    remarkModal.actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                    'bg-indigo-600 hover:bg-indigo-700'
                 }`}>
                    Save {remarkModal.actionType === 'remark' ? 'Remark' : remarkModal.actionType === 'approve' ? 'Approve' : 'Reject'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/90 text-sm font-semibold bg-white/10 px-5 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/10 z-50">
            {lightbox.currentIndex + 1} of {lightbox.photos.length}
          </div>
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm border border-white/10">
            <X size={28} />
          </button>
          
          <div className="relative w-full max-w-5xl h-full max-h-screen flex items-center justify-center p-4">
             
             {lightbox.photos.length > 1 && (
               <>
                 <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors backdrop-blur-sm border border-white/10 hover:scale-110 active:scale-95 z-50">
                   <ChevronLeft size={28} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors backdrop-blur-sm border border-white/10 hover:scale-110 active:scale-95 z-50">
                   <ChevronRight size={28} />
                 </button>
               </>
             )}

             <div className="relative inline-block max-w-full rounded-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
               <img src={lightbox.photos[lightbox.currentIndex]} className="w-auto h-auto max-w-full max-h-[85vh] block" alt="Preview" />
               
               {lightbox.task && (
                 <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-3 sm:p-4 flex gap-4 text-white items-center border-t border-white/10">
                   {(lightbox.task.latitude || lightbox.task.task_id?.latitude) && (lightbox.task.longitude || lightbox.task.task_id?.longitude) && (
                      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded bg-slate-800 overflow-hidden pointer-events-none shadow-inner border border-white/20">
                        <iframe 
                           src={`https://maps.google.com/maps?q=${lightbox.task.latitude || lightbox.task.task_id?.latitude},${lightbox.task.longitude || lightbox.task.task_id?.longitude}&z=14&output=embed`} 
                           width="100%" 
                           height="100%" 
                           className="border-0 scale-125 origin-center" 
                           loading="lazy" 
                        ></iframe>
                      </div>
                   )}
                   <div className="flex flex-col justify-center overflow-hidden w-full">
                     {lightbox.task.gps_address && lightbox.task.gps_address !== '-' && (
                       <div className="truncate font-semibold mb-1 pb-1 border-b border-white/20 text-white text-xs sm:text-sm">
                         {lightbox.task.gps_address}
                       </div>
                     )}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] sm:text-[11px] mt-1">
                       {(lightbox.task.latitude || lightbox.task.task_id?.latitude) && (
                         <div className="truncate">
                           <span className="text-white/50 mr-1">Lat:</span> {lightbox.task.latitude || lightbox.task.task_id?.latitude}
                         </div>
                       )}
                       {(lightbox.task.longitude || lightbox.task.task_id?.longitude) && (
                         <div className="truncate">
                           <span className="text-white/50 mr-1">Long:</span> {lightbox.task.longitude || lightbox.task.task_id?.longitude}
                         </div>
                       )}
                       {lightbox.task.created_date && (
                         <div className="col-span-1 sm:col-span-2 truncate">
                           <span className="text-white/50 mr-1">Date:</span> {new Date(lightbox.task.created_date).toLocaleString('en-GB')}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Hidden element for Export Generation */}
      {exportType === 'pdf' && groupedTasks.length > 0 && (
        <ExportTaskTemplate 
          ref={exportTemplateRef} 
          tasks={groupedTasks} 
          getImageUrl={getImageUrl} 
          onReady={handleExportReady}
        />
      )}
    </div>
  );
}
