import { useState } from "react";
import { CheckCircleOutlined, OpenInNew } from "@mui/icons-material";
import DashboardAppShell from "~/components/dashboard-app-shell";
import { useSettings } from "~/components/settings-context";
import { currencyCodes } from "~/constants/currencyCodes";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~/i18n";

export function meta() {
  return [
    { title: "OpenCost — Settings" },
    { name: "description", content: "Global settings for OpenCost" },
  ];
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { defaultCurrency, setDefaultCurrency } = useSettings();
  const [saved, setSaved] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(defaultCurrency);
  const [pendingLanguage, setPendingLanguage] = useState<SupportedLanguage>(
    (SUPPORTED_LANGUAGES.some((l) => l.code === i18n.language)
      ? i18n.language
      : "en") as SupportedLanguage
  );

  const isDirty =
    pendingCurrency !== defaultCurrency || pendingLanguage !== i18n.language;

  const handleSave = () => {
    setDefaultCurrency(pendingCurrency);
    if (pendingLanguage !== i18n.language) {
      i18n.changeLanguage(pendingLanguage);
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardAppShell>
      <main className="min-h-screen" style={{ background: "var(--cds-background)" }}>
        <div className="mx-auto max-w-[800px] p-6">
          <div className="mb-6">
            <h1 className="v2-page-title">{t("settings.title")}</h1>
            <p className="m-0 mt-1 text-xs" style={{ color: "var(--cds-text-secondary)" }}>
              Global preferences applied across dashboards and reports.
            </p>
          </div>

          {/* Display section */}
          <section
            className="mb-4 overflow-hidden rounded border shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
            }}
          >
            <div
              className="border-b px-5 py-3"
              style={{
                borderColor: "var(--cds-border-subtle)",
                background: "var(--cds-layer-02)",
              }}
            >
              <h2 className="v2-section-title">Display</h2>
            </div>
            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Language Selector */}
              <div className="max-w-[360px]">
                <label
                  className="mb-1.5 block text-xs font-semibold"
                  style={{ color: "var(--cds-text-secondary)" }}
                  htmlFor="settings-language"
                >
                  {t("settings.language_title")}
                </label>
                <p className="mb-2 text-xs" style={{ color: "var(--cds-text-placeholder)" }}>
                  {t("settings.language_description")}
                </p>
                <select
                  id="settings-language"
                  value={pendingLanguage}
                  onChange={(e) => setPendingLanguage(e.target.value as SupportedLanguage)}
                  className="h-9 w-full rounded border px-2.5 text-xs focus:border-[#0f62fe] focus:outline-none"
                  style={{
                    background: "var(--cds-layer)",
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-primary)",
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label} ({lang.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Selector */}
              <div className="max-w-[360px]">
                <label
                  className="mb-1.5 block text-xs font-semibold"
                  style={{ color: "var(--cds-text-secondary)" }}
                  htmlFor="settings-currency"
                >
                  {t("settings.currency_title")}
                </label>
                <p className="mb-2 text-xs" style={{ color: "var(--cds-text-placeholder)" }}>
                  {t("settings.currency_description")}
                </p>
                <select
                  id="settings-currency"
                  value={pendingCurrency}
                  onChange={(e) => setPendingCurrency(e.target.value)}
                  className="h-9 w-full rounded border px-2.5 text-xs focus:border-[#0f62fe] focus:outline-none"
                  style={{
                    background: "var(--cds-layer)",
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-primary)",
                  }}
                >
                  {currencyCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={handleSave}
                  className="inline-flex h-8 items-center gap-1.5 rounded bg-[#0f62fe] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#0353e9] disabled:cursor-not-allowed disabled:bg-[#c6c6c6]"
                >
                  {t("common.save")}
                </button>
                {saved ? (
                  <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--cds-support-success)" }}>
                    <CheckCircleOutlined fontSize="small" />
                    Saved
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {/* About section */}
          <section
            className="overflow-hidden rounded border shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            style={{
              background: "var(--cds-layer)",
              borderColor: "var(--cds-border-subtle)",
            }}
          >
            <div
              className="border-b px-5 py-3"
              style={{
                borderColor: "var(--cds-border-subtle)",
                background: "var(--cds-layer-02)",
              }}
            >
              <h2 className="v2-section-title">About</h2>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="OpenCost" className="h-6 w-auto" />
              </div>
              <p className="m-0 mb-4 text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                OpenCost is an open-source, vendor-neutral solution for measuring and allocating
                Kubernetes and cloud infrastructure costs in real time.
              </p>
              <div className="flex flex-col gap-2">
                 <a
                  href="https://www.opencost.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: "var(--cds-link-primary)" }}
                >
                  Documentation
                  <OpenInNew fontSize="inherit" className="ml-0.5" />
                </a>
                <a
                  href="https://github.com/opencost/opencost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: "var(--cds-link-primary)" }}
                >
                  GitHub — opencost/opencost
                  <OpenInNew fontSize="inherit" className="ml-0.5" />
                </a>
                <a
                  href="https://slack.cncf.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  style={{ color: "var(--cds-link-primary)" }}
                >
                  CNCF Slack — #opencost
                  <OpenInNew fontSize="inherit" className="ml-0.5" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardAppShell>
  );
}
