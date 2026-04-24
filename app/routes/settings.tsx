import { useState } from "react";
import { CheckCircleOutlined, OpenInNew } from "@mui/icons-material";
import DashboardAppShell from "~/components/dashboard-app-shell";
import { useSettings } from "~/components/settings-context";
import { currencyCodes } from "~/constants/currencyCodes";

export function meta() {
  return [
    { title: "OpenCost — Settings" },
    { name: "description", content: "Global settings for OpenCost" },
  ];
}

export default function SettingsPage() {
  const { defaultCurrency, setDefaultCurrency } = useSettings();
  const [saved, setSaved] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(defaultCurrency);

  const isDirty = pendingCurrency !== defaultCurrency;

  const handleSave = () => {
    setDefaultCurrency(pendingCurrency);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardAppShell>
      <main className="min-h-screen bg-[#f4f4f4]">
        <div className="mx-auto max-w-[800px] p-6">
          <div className="mb-6">
            <h2 className="m-0 text-[2rem] font-normal text-[#161616]">Settings</h2>
            <p className="m-0 mt-1 text-sm text-[#6f6f6f]">
              Global preferences applied across dashboards and reports.
            </p>
          </div>

          {/* Display section */}
          <section className="mb-4 overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="border-b border-[#e0e0e0] bg-[#f8f8f8] px-5 py-3">
              <h3 className="m-0 text-sm font-semibold text-[#161616]">Display</h3>
            </div>
            <div className="px-5 py-5">
              <div className="max-w-[360px]">
                <label
                  className="mb-1.5 block text-sm font-medium text-[#525252]"
                  htmlFor="settings-currency"
                >
                  Default Currency
                </label>
                <p className="mb-3 text-xs text-[#6f6f6f]">
                  Used as the default currency when creating new reports and dashboards.
                </p>
                <select
                  id="settings-currency"
                  value={pendingCurrency}
                  onChange={(e) => setPendingCurrency(e.target.value)}
                  className="h-9 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-sm text-[#161616] focus:border-[#0f62fe] focus:outline-none"
                >
                  {currencyCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={handleSave}
                  className="inline-flex h-9 items-center gap-1.5 rounded bg-[#0f62fe] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0353e9] disabled:cursor-not-allowed disabled:bg-[#c6c6c6]"
                >
                  Save changes
                </button>
                {saved ? (
                  <span className="inline-flex items-center gap-1 text-sm text-[#198038]">
                    <CheckCircleOutlined fontSize="small" />
                    Saved
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {/* About section */}
          <section className="overflow-hidden rounded border border-[#e0e0e0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="border-b border-[#e0e0e0] bg-[#f8f8f8] px-5 py-3">
              <h3 className="m-0 text-sm font-semibold text-[#161616]">About</h3>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="OpenCost" className="h-7 w-auto" />
              </div>
              <p className="m-0 mb-4 text-sm text-[#525252]">
                OpenCost is an open-source, vendor-neutral solution for measuring and allocating
                Kubernetes and cloud infrastructure costs in real time.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://www.opencost.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:underline"
                >
                  Documentation
                  <OpenInNew fontSize="inherit" />
                </a>
                <a
                  href="https://github.com/opencost/opencost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:underline"
                >
                  GitHub — opencost/opencost
                  <OpenInNew fontSize="inherit" />
                </a>
                <a
                  href="https://slack.cncf.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:underline"
                >
                  CNCF Slack — #opencost
                  <OpenInNew fontSize="inherit" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardAppShell>
  );
}
