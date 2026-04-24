import { Link } from "react-router";
import { Tag } from "@carbon/react";
import {
  Star,
  StarBorder,
  EditOutlined,
  DeleteOutline,
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
  if (reports.length === 0) {
    const message =
      totalReportCount === 0
        ? "You do not have any reports yet. Create a report to get started."
        : "No reports match the selected search and filters.";
    return <div className="p-6 text-sm text-[#6f6f6f]">{message}</div>;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="w-8 px-3 py-2.5 text-left text-xs font-semibold text-[#525252]" />
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Name
          </th>
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Owner
          </th>
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Created On
          </th>
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Time Last Modified
          </th>
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Visibility
          </th>
          <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-[#525252]">
            Tags
          </th>
          <th className="w-[8rem] whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold text-[#525252]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => {
          const createdOn = new Date(report.createdAt).toLocaleDateString();
          const modifiedOn = new Date(report.updatedAt).toLocaleString();
          return (
            <tr key={report.id} className="border-t border-[#f0f0f0] hover:bg-[#fcfcfc]">
              <td className="w-8 px-3 py-2.5 text-center align-middle">
                {report.favorite ? (
                  <Star fontSize="small" className="text-[#f1c21b]" />
                ) : (
                  <StarBorder fontSize="small" className="text-[#8d8d8d]" />
                )}
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                <Link
                  to={`/report/${report.id}`}
                  className="text-[#262626] no-underline hover:text-[#0f62fe]"
                >
                  {report.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                {report.owner}
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                {createdOn}
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                {modifiedOn}
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                <span
                  className={`rounded-[10px] px-2 py-0.5 text-[11px] font-semibold ${
                    report.visibility === "public"
                      ? "bg-[#defbe6] text-[#198038]"
                      : "bg-[#f4f4f4] text-[#525252]"
                  }`}
                >
                  {report.visibility === "public" ? "Public" : "Private"}
                </span>
              </td>
              <td className="px-3 py-2.5 align-middle text-[13px] text-[#393939]">
                <div className="flex items-center gap-1 flex-wrap">
                  {report.tags.length > 0 ? (
                    report.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag} type="gray" size="sm">
                        {tag}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-[#8d8d8d]">--</span>
                  )}
                </div>
              </td>
              <td className="w-[8rem] whitespace-nowrap px-3 py-2.5 text-right align-middle">
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe]"
                  aria-label="Edit report"
                  title="Edit report"
                  onClick={() => onEdit(report)}
                >
                  <EditOutlined fontSize="small" />
                </button>
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#0f62fe] hover:text-[#0f62fe]"
                  aria-label="Share report"
                  title="Share report"
                  onClick={() => onShare(report)}
                >
                  <IosShareOutlined fontSize="small" />
                </button>
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded border border-[#d0d0d0] bg-white text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28]"
                  aria-label="Delete report"
                  title="Delete report"
                  onClick={() => onDelete(report)}
                >
                  <DeleteOutline fontSize="small" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
