import UsersManagementPanel from "~/components/settings/users-management-panel";

export function meta() {
  return [
    { title: "OpenCost — Users" },
    { name: "description", content: "Manage workspace users and roles" },
  ];
}

export default function SettingsUsersPage() {
  return <UsersManagementPanel />;
}
