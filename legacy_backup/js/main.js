// Theme Toggler
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

// Global Sidebar Toggler
const sidebarCollapseBtn = document.getElementById('sidebar-collapse-btn');
const sidebarExpandBtn = document.getElementById('sidebar-expand-btn');

// Initialize sidebar state from local storage
const isSidebarHidden = localStorage.getItem('sidebar-hidden') === 'true';
if (isSidebarHidden) {
    document.body.classList.add('sidebar-hidden');
    if (sidebarExpandBtn) sidebarExpandBtn.style.display = 'block';
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-hidden');
    const isHidden = document.body.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebar-hidden', isHidden);

    // Manage visibility of expand button based on state
    if (isHidden) {
        if (sidebarExpandBtn) sidebarExpandBtn.style.display = 'block';
    } else {
        if (sidebarExpandBtn) sidebarExpandBtn.style.display = 'none';
    }
}

if (sidebarCollapseBtn) {
    sidebarCollapseBtn.addEventListener('click', toggleSidebar);
}

if (sidebarExpandBtn) {
    sidebarExpandBtn.addEventListener('click', toggleSidebar);
}

// Workspace Panel Toggler
const questionPanel = document.getElementById('question-panel');
const workspaceGrid = document.getElementById('workspace-grid');
const workspaceNavToggle = document.getElementById('workspace-nav-toggle');

if (questionPanel && workspaceGrid && workspaceNavToggle) {
    let isCollapsed = false;

    workspaceNavToggle.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent navigation since we are already on the page

        if (!isCollapsed) {
            // Collapse
            questionPanel.style.display = 'none';
            workspaceGrid.style.gridTemplateColumns = '0px 1fr 1fr';
            isCollapsed = true;
        } else {
            // Expand
            questionPanel.style.display = 'flex';
            workspaceGrid.style.gridTemplateColumns = '250px 1fr 1fr';
            isCollapsed = false;
        }
    });
}
