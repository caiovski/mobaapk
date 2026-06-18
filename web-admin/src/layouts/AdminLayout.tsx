// @ts-nocheck
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    { icon: 'view_quilt', label: 'Geral', path: '/geral' },
    { icon: 'dashboard', label: 'Dashboard', path: '/' },
    { icon: 'point_of_sale', label: 'PDV (Caixa)', path: '/pdv' },
    { icon: 'inventory_2', label: 'Produtos', path: '/produtos' },
    { icon: 'group', label: 'Clientes', path: '/clientes' },
    { icon: 'calendar_today', label: 'Agendamentos', path: '/agendamentos' },
  ];

  return (
    <section className="bg-background text-on-background min-h-screen flex font-body-md overflow-hidden">
      
      {/* Mobile Navigation Toggle (Visible only on small screens) */}
      <section className="md:hidden absolute top-0 w-full flex items-center justify-between p-4 bg-background border-b border-outline-variant shadow-sm z-50">
        <span className="font-bold text-xl text-primary-container">AgroPet</span>
        <section className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </section>
      </section>

      {/* SideNavBar */}
      <nav 
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-background border-r border-outline-variant shadow-xl flex flex-col transition-transform duration-300 ease-in-out py-xl 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
        {/* Header */}
        <section className="px-lg mb-xl mt-12 md:mt-0 flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary-container text-[32px]">pets</span>
          <section className="flex flex-col">
            <span className="font-display-lg text-display-lg font-bold text-primary-container leading-none">AgroPet</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Admin Panel</span>
          </section>
        </section>

        {/* Navigation Links */}
        <section className="flex-1 flex flex-col gap-sm overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-md px-lg py-sm transition-all duration-200 font-label-md text-label-md ${
                  isActive
                    ? 'border-l-4 border-primary bg-primary/10 text-primary'
                    : 'border-l-4 border-transparent text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span 
                    className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </section>

        {/* Footer / CTA */}
        <section className="mt-auto px-lg pt-sm pb-lg border-t border-outline-variant flex flex-col gap-xs">
          <button 
            className="flex items-center gap-md py-sm px-sm -mx-sm text-on-surface-variant rounded-lg hover:bg-white/5 hover:text-on-surface transition-colors w-full text-left font-label-md text-label-md"
          >
            <span className="material-symbols-outlined">help</span>
            <span>Suporte</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-md py-sm px-sm -mx-sm text-on-surface-variant rounded-lg hover:bg-white/5 hover:text-on-surface transition-colors w-full text-left font-label-md text-label-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </section>
      </nav>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <section 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col h-screen overflow-hidden mt-16 md:mt-0 w-[calc(100%-280px)]">
        
        {/* TopNavBar (Desktop) */}
        <header className="hidden md:flex bg-background shadow-sm border-b border-outline-variant h-16 px-6 justify-between items-center shrink-0 w-full z-10 sticky top-0">
          <h2 className="text-2xl font-semibold text-on-surface">AgroPet</h2>
          <section className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full p-2 scale-95 duration-150"
              title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full p-2 scale-95 duration-150 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <section className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvUo2pWgvUqA2K_6SXK1ZhOeuXPHQC0XycqkzrjUEzjYxzERTAaZqLJD6G_H7WAso0G5qetO5wKT6gGtNpRCiCBkDvdo3W5h8ZyVw514e6JrmHtA8rqFVckMwSAF2gUxls8L1HxjQjxC-8ajhLynC1cEizh5OF1MHf5ubTB9OMgtUwtlMtlz-TYboAcjFYTwIGR10UnyvVOedzF3u3GVaes3bh1G9-GKC7BDXmcTYhhLpJ6DkFl3K7rBFydlJnZ2Yw92jw__xTftyj" 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </section>
          </section>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto bg-surface-container">
          <Outlet />
        </main>
      </section>
    </section>
  );
}
