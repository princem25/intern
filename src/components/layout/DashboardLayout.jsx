import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { internLinks, leadLinks, hrLinks } from '../../data/navigation';

export const DashboardLayout = ({ children, role = 'Intern', fullWidth = false }) => {
    // Desktop: sidebar open by default, Mobile: sidebar closed by default
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false); // Close sidebar on mobile
            } else {
                setSidebarOpen(true); // Open sidebar on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getLinks = () => {
        switch (role) {
            case 'Lead': return leadLinks;
            case 'HR': return hrLinks;
            case 'Intern':
            default: return internLinks;
        }
    };

    return (
        <div className={`layout-wrapper ${sidebarOpen ? 'sidebar-open' : ''} min-h-screen bg-body flex`}>
            <Sidebar
                links={getLinks()}
                role={role}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="main-content flex-1 flex flex-col transition-all duration-300">
                <Topbar
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    user={{ initials: 'JD' }} // Placeholder
                />
                <main className={fullWidth ? 'flex-1 flex flex-col overflow-hidden' : ''} style={fullWidth ? {} : { padding: '2rem', maxWidth: '100%', width: '100%' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};
