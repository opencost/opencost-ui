import { useEffect, useState } from "react";
import { Button, Modal, Tag, TextArea, TextInput } from "@carbon/react";
import {
  createDefaultReportQuery,
  REPORT_DATA_SOURCE_OPTIONS,
  type Report,
  type ReportLayer,
} from "~/types/report";

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (report: Report) => void;
  onUpdate?: (id: string, updates: Partial<Report>) => void;
  reportToEdit?: Report | null;
}

export default function CreateReportModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  reportToEdit,
}: CreateReportModalProps) {
  const isEditMode = !!reportToEdit;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [layer, setLayer] = useState<ReportLayer>("allocation");

  useEffect(() => {
    if (!open) return;
    if (reportToEdit) {
      setName(reportToEdit.name);
      setDescription(reportToEdit.description);
      setVisibility(reportToEdit.visibility);
      setTags(reportToEdit.tags);
      setLayer(reportToEdit.query.layer);
      setTagInput("");
      return;
    }

    setName("");
    setDescription("");
    setVisibility("public");
    setTags([]);
    setLayer("allocation");
    setTagInput("");
  }, [open, reportToEdit]);

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag || tags.includes(nextTag)) return;
    setTags((prev) => [...prev, nextTag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const submit = () => {
    if (!name.trim()) return;

    if (reportToEdit) {
      onUpdate?.(reportToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        visibility,
        tags,
      });
      onClose();
      return;
    }

    const now = new Date().toISOString();
    const report: Report = {
      id: `report-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      tags,
      owner: "You",
      visibility,
      favorite: false,
      query: createDefaultReportQuery(layer),
      createdAt: now,
      updatedAt: now,
    };
    onCreate?.(report);
    onClose();
  };

  return (
    <Modal
      open={open}
      modalHeading={isEditMode ? "Edit Report" : "Create Report"}
      primaryButtonText={isEditMode ? "Save Changes" : "Create Report"}
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onSecondarySubmit={onClose}
      onRequestSubmit={submit}
      primaryButtonDisabled={!name.trim()}
      size="sm"
    >
      <div className="mb-4">
        <TextInput
          id="report-name"
          labelText="Report Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g., App Runtime Deployments"
        />
      </div>
      <div className="mb-4">
        <TextArea
          id="report-description"
          labelText="Description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what this report tracks."
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-[#525252] mb-2" htmlFor="report-data-source">
          Data Source
        </label>
        <select
          id="report-data-source"
          value={layer}
          onChange={(event) => setLayer(event.target.value as ReportLayer)}
          disabled={isEditMode}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626] disabled:bg-[#f4f4f4] disabled:text-[#6f6f6f]"
        >
          {REPORT_DATA_SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-[#525252] mb-2" htmlFor="report-visibility">
          Visibility
        </label>
        <select
          id="report-visibility"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "public" | "private")}
          className="h-10 w-full rounded border border-[#d0d0d0] bg-white px-2.5 text-[13px] text-[#262626]"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm text-[#525252] mb-2" htmlFor="report-tag-input">
          Tags
        </label>
        <div className="flex items-center gap-2">
          <input
            id="report-tag-input"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag"
            className="h-10 min-w-0 flex-1 rounded border border-[#d0d0d0] px-2.5 text-[13px] text-[#262626]"
          />
          <Button kind="secondary" size="sm" disabled={!tagInput.trim()} onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} type="gray" filter onClose={() => removeTag(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
