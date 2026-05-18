import React, { useState, useEffect } from 'react';
import { 
  Menu, User, FileText, List, ClipboardList, MapPin, Building2, 
  FolderGit2, Users, Contact, LogOut,
  Sun, Moon, Bell, Search, LayoutDashboard
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Client Report', path: '/client-report', icon: <FileText size={20} /> },
    { name: 'Task Master', path: '/task-master', icon: <List size={20} /> },
    { name: 'Task Report', path: '/task-report', icon: <ClipboardList size={20} /> },
    { name: 'State Master', path: '/state-master', icon: <MapPin size={20} /> },
    { name: 'City Master', path: '/city-master', icon: <Building2 size={20} /> },
    { name: 'Projects', path: '/project-master', icon: <FolderGit2 size={20} /> },
    { name: 'Clients', path: '/client-master', icon: <Users size={20} /> },
    { name: 'Employees', path: '/employee-master', icon: <Contact size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 md:relative z-40 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform md:transition-all duration-300 shadow-2xl md:shadow-none
        ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 md:w-0 md:translate-x-0 md:overflow-hidden md:opacity-0'}
      `}>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
          <div className="flex items-center w-full">
            <div className="h-14 w-48 flex items-center justify-start overflow-hidden">
              <img src="/25434.png" alt="Spacemakerz Logo" className="w-full h-full object-contain object-left" />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>
          <nav className="space-y-1.5">
            {menuItems.map((item, idx) => (
              <NavLink 
                key={idx} 
                to={item.path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`mr-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="text-[15px]">{item.name}</span>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-md"></span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Profile Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl group cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden relative break-inside-avoid">
              <User size={20} className="text-slate-500 dark:text-slate-400 absolute bottom-[-4px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">Administrator</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">A-000001</div>
            </div>
            <button className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none z-0"></div>

        {/* Top Header */}
        <header className="h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 rounded-xl transition-all">
              <Menu size={22} />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-72 lg:w-96 shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search resources..." className="bg-transparent border-none outline-none text-[15px] w-full text-slate-700 dark:text-slate-200 placeholder-slate-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto flex flex-col p-4 md:p-8 z-10 w-full max-w-[100vw]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
