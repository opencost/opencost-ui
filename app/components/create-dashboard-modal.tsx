import { useState } from "react";
import { Modal, TextInput, TextArea, Button, Tag } from "@carbon/react";
import { useDashboard, type Dashboard } from "./dashboard-context";

interface CreateDashboardModalProps {
  open: boolean;
  onClose: () => void;
  onDashboardCreated: (id: string) => void;
}

export default function CreateDashboardModal({
  open,
  onClose,
  onDashboardCreated,
}: CreateDashboardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { createDashboard } = useDashboard();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = () => {
    if (name.trim()) {
      const newId = `dashboard-${Date.now()}`;
      const newDashboard: Dashboard = {
        id: newId,
        name: name.trim(),
        description: description.trim(),
        widgets: [],
        tags,
        starred: false,
        updatedAt: new Date().toISOString(),
        owner: "You",
      };
      createDashboard(newDashboard);
      onDashboardCreated(newId);
      setName("");
      setDescription("");
      setTags([]);
      setTagInput("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="Create New Dashboard"
      primaryButtonText="Create Dashboard"
      secondaryButtonText="Cancel"
      onRequestSubmit={handleCreate}
      primaryButtonDisabled={!name.trim()}
      size="sm"
    >
      <div className="mb-4">
        <p className="mb-6 text-[#525252]">
          Create a new custom dashboard to monitor your cloud costs
        </p>

        <div className="mb-4">
          <TextInput
            id="dashboard-name"
            labelText="Dashboard Name"
            placeholder="e.g., Production Costs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <TextArea
            id="dashboard-description"
            labelText="Description"
            placeholder="Add a description for this dashboard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <TextInput
                id="dashboard-tags"
                labelText="Tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              className="mt-6"
              kind="secondary"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  type="gray"
                  filter
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
