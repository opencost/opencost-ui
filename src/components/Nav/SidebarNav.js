import React from 'react';
import { useLocation } from 'react-router-dom'; 
import { SideNav, SideNavItems, SideNavLink } from '@carbon/react';
import { 
  ChartClusterBar, 
  Cloud, 
  Currency, 
  DataVis_1 
} from '@carbon/icons-react';

const logo = new URL("../../images/logo.png", import.meta.url).href;

const SidebarNav = () => {
  const location = useLocation();

  return (
    <>
      {/* 1. Custom CSS Override to make Font & Icons Bigger */}
      <style>{`
        .opencost-sidenav .cds--side-nav__link-text {
            font-size: 1rem !important; /* Make text larger (16px) */
            font-weight: 500;
            line-height: 1.5rem;
        }
        .opencost-sidenav .cds--side-nav__icon > svg {
            width: 24px !important;    /* Make icons larger */
            height: 24px !important;
            fill: #525252;             /* Ensure visibility */
        }
        .opencost-sidenav .cds--side-nav__link {
            height: 3.5rem !important; /* Make the row taller to fit */
        }
      `}</style>

      {/* 2. The Sidebar Component */}
      <SideNav
        isFixedNav
        expanded={true} 
        isChildOfHeader={false}
        aria-label="Side navigation"
        className="opencost-sidenav"
      >
        <div style={{ 
          padding: '2.5rem 1.5rem 2rem 1.5rem', 
          marginBottom: '1rem' 
        }}>
          <img
            src={logo}
            alt="OpenCost"
            style={{ width: '150px', display: 'block' }} 
          />
        </div>

        <SideNavItems>
          <SideNavLink 
            renderIcon={ChartClusterBar} 
            href="/allocation"
            isActive={location.pathname === '/' || location.pathname === '/allocation'}
          >
            Cost Allocation
          </SideNavLink>

          <SideNavLink 
            renderIcon={Cloud} 
            href="/cloud"
            isActive={location.pathname === '/cloud'}
          >
            Cloud Costs
          </SideNavLink>

          <SideNavLink 
            renderIcon={Currency} 
            href="/external-costs"
            isActive={location.pathname === '/external-costs'}
          >
            External Costs
          </SideNavLink>

          <SideNavLink 
            renderIcon={DataVis_1} 
            href="/assets"
            isActive={location.pathname === '/assets'}
          >
            Assets
          </SideNavLink>

        </SideNavItems>
      </SideNav>
    </>
  );
};

export { SidebarNav };