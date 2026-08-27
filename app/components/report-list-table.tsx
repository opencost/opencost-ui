import { Link } from "react-router";
import { Tag } from "@carbon/react";
import { useTranslation } from "react-i18next";
import {
  Star,
  StarBorder,
  EditOutlined,
  DeleteOutlined,
  IosShareOutlined,
} from "@mui/icons-material";
import type { Report } from "~/types/report";

interface ReportListTableProps {
  reports: Report[];
  totalReportCount: number;
  onEdit: (report: Report) => void;
  onShare: (report: Report) => void;
  onDelete: (report: Report) => void;
}

export default function ReportListTable({
  reports,
  totalReportCount,
  onEdit,
  onShare,
  onDelete,
}: ReportListTableProps) {
  const { t } = useTranslation();

  const getTranslatedReportName = (report: Report) => {
    if (report.id === "report-1" || report.name === "Namespace Cost Trend") {
      return t("reports.namespace_cost_trend");
    }
    if (report.id === "report-2" || report.name === "Cluster Cost Breakdown") {
      return t("reports.cluster_cost_breakdown");
    }
    return report.name;
  };

  if (reports.length === 0) {
    const message =
      totalReportCount === 0
        ? t("reports.no_reports_yet")
        : t("reports.no_reports_match");
    return (
      <div
        className="p-8 text-center text-xs"
        style={{ color: "var(--cds-text-placeholder)" }}
      >
        {message}
      </div>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr
          style={{
            borderBottom: "1px solid var(--cds-border-subtle)",
            background: "var(--cds-layer-02)",
          }}
        >
          <th className="w-8 px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }} />
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.name")}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.owner")}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.created_on")}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.last_modified")}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.visibility")}
          </th>
          <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.tags")}
          </th>
          <th className="w-[8rem] whitespace-nowrap px-3 py-2 text-right text-xs font-semibold" style={{ color: "var(--cds-text-secondary)" }}>
            {t("table.actions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => {
          const createdOn = new Date(report.createdAt).toLocaleDateString();
          const modifiedOn = new Date(report.updatedAt).toLocaleString();
          const displayOwner = report.owner === "You" ? t("common.you") : report.owner;
          const displayVisibility = report.visibility === "public" ? t("common.public") : t("common.private");
          return (
            <tr
              key={report.id}
              className="v2-table-row-hover"
              style={{ borderBottom: "1px solid var(--cds-border-subtle)" }}
            >
              <td className="w-8 px-3 py-2.5 text-center align-middle">
                {report.favorite ? (
                  <Star fontSize="small" className="text-[#f1c21b]" />
                ) : (
                  <StarBorder fontSize="small" style={{ color: "var(--cds-text-placeholder)" }} />
                )}
              </td>
              <td className="px-3 py-2.5 align-middle text-xs">
                <Link
                  to={`/report/${report.id}`}
                  className="font-medium no-underline hover:underline"
                  style={{ color: "var(--cds-text-primary)" }}
                >
                  {getTranslatedReportName(report)}
                </Link>
              </td>
              <td className="px-3 py-2.5 align-middle text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                {displayOwner}
              </td>
              <td className="px-3 py-2.5 align-middle text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                {createdOn}
              </td>
              <td className="px-3 py-2.5 align-middle text-xs" style={{ color: "var(--cds-text-secondary)" }}>
                {modifiedOn}
              </td>
              <td className="px-3 py-2.5 align-middle text-xs">
                <span
                  className={`rounded-[10px] px-2 py-0.5 text-[10px] font-semibold`}
                  style={{
                    background:
                      report.visibility === "public"
                        ? "var(--cds-notification-background-success, #defbe6)"
                        : "var(--cds-layer-02, #f4f4f4)",
                    color:
                      report.visibility === "public"
                        ? "var(--cds-support-success, #198038)"
                        : "var(--cds-text-secondary, #525252)",
                  }}
                >
                  {displayVisibility}
                </span>
              </td>
              <td className="px-3 py-2.5 align-middle text-xs">
                <div className="flex items-center gap-1 flex-wrap">
                  {report.tags.length > 0 ? (
                    report.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag} type="gray" size="sm">
                        {tag}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: "var(--cds-text-placeholder)" }}>--</span>
                  )}
                </div>
              </td>
              <td className="w-[8rem] whitespace-nowrap px-3 py-2.5 text-right align-middle">
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border transition-colors"
                  style={{
                    background: "var(--cds-layer)",
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-secondary)",
                  }}
                  aria-label={t("common.edit")}
                  title={t("common.edit")}
                  onClick={() => onEdit(report)}
                >
                  <EditOutlined fontSize="small" />
                </button>
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border transition-colors"
                  style={{
                    background: "var(--cds-layer)",
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-secondary)",
                  }}
                  aria-label={t("common.share")}
                  title={t("common.share")}
                  onClick={() => onShare(report)}
                >
                  <IosShareOutlined fontSize="small" />
                </button>
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border transition-colors"
                  style={{
                    background: "var(--cds-layer)",
                    borderColor: "var(--cds-border-subtle)",
                    color: "var(--cds-text-secondary)",
                  }}
                  aria-label={t("common.delete")}
                  title={t("common.delete")}
                  onClick={() => onDelete(report)}
                >
                  <DeleteOutlined fontSize="small" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
