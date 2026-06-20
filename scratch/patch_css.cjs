const fs = require('fs');
const path = require('path');
const cssPath = path.join(__dirname, '../src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('.mobile-menu-toggle')) {
  css += `
/* Mobile Responsive Layout Improvements */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}
.mobile-menu-toggle:hover {
  background-color: var(--surface-color-hover);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }
  
  .app-header {
    justify-content: flex-start;
  }
  
  .app-header > .header-search {
    margin-left: auto;
    width: auto;
  }

  /* Make sidebar absolute on mobile */
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    height: 100vh;
    z-index: 999;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }

  /* Make Dashboard grid 1 column */
  .dashboard-grid, .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .panel-header .header-search {
    width: 100% !important;
  }
}
`;
  fs.writeFileSync(cssPath, css);
  console.log('Added mobile layout CSS');
}
