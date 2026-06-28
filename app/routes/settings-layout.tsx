import { NavLink, Outlet } from "react-router";
import { useOrganization } from "@clerk/react";

import { useAuth } from "~/components/auth-context";
import DashboardAppShell from "~/components/dashboard-app-shell";
import { currentUserIsOrgAdmin } from "~/lib/clerk-org-access";
import { hasClerkPublishableKey, isAuthDisabled } from "~/lib/clerk-config";

function SettingsTabs({ showUsers }: { showUsers: boolean }) {
  return (
    <nav
      className="settings-tabs mt-6 flex flex-wrap gap-1 sm:gap-2"
      aria-label="Settings sections"
    >
      <NavLink to="/settings" end className="settings-tabs__link">
        General
      </NavLink>
      {showUsers ? (
        <NavLink to="/settings/users" className="settings-tabs__link">
          Users
        </NavLink>
      ) : null}
      <NavLink to="/settings/scoped-views" className="settings-tabs__link">
        Scoped views
      </NavLink>
    </nav>
  );
}

function SettingsTabsWithClerkOrg() {
  const { user } = useAuth();
  const clerkOrg = useOrganization({ memberships: { pageSize: 50 } });
  const showUsers = currentUserIsOrgAdmin(
    clerkOrg.memberships?.data,
    user?.sub,
  );
  return <SettingsTabs showUsers={showUsers} />;
}

function SettingsNavigation() {
  if (!hasClerkPublishableKey() || isAuthDisabled()) {
    return <SettingsTabs showUsers />;
  }
  return <SettingsTabsWithClerkOrg />;
}

export default function SettingsLayout() {
  return (
    <DashboardAppShell>
      <main className="min-h-screen bg-[#f4f4f4]">
        <div className="mx-auto max-w-[960px] p-6">
          <div className="mb-2">
            <h2 className="m-0 text-[2rem] font-normal text-[#161616]">Settings</h2>
            <p className="m-0 mt-1 text-sm text-[#6f6f6f]">
              General preferences, team members, and scoped views for this
              workspace.
            </p>
          </div>

          <SettingsNavigation />

          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </main>
    </DashboardAppShell>
  );
}
