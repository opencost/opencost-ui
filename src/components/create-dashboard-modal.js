'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  TextArea,
  Button,
  Tag,
} from '@carbon/react';
import { Close } from '@carbon/icons-react';
import { useDashboard } from './dashboard-context';

export default function CreateDashboardModal({ open, onClose, onDashboardCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const { createDashboard } = useDashboard();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreate = () => {
    if (name.trim()) {
      const newId = `dashboard-${Date.now()}`;
      const newDashboard = {
        id: newId,
        name: name.trim(),
        description: description.trim(),
        widgets: [],
        tags: tags,
        starred: false,
        updatedAt: 'just now',
        owner: 'You',
      };
      createDashboard(newDashboard);
      onDashboardCreated(newId);
      setName('');
      setDescription('');
      setTags([]);
      setTagInput('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '1.5rem', color: '#525252' }}>
          Create a new custom dashboard to monitor your cloud costs
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <TextInput
            id="dashboard-name"
            labelText="Dashboard Name"
            placeholder="e.g., Production Costs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <TextArea
            id="dashboard-description"
            labelText="Description"
            placeholder="Add a description for this dashboard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <TextInput
                id="dashboard-tags"
                labelText="Tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              style={{ marginTop: '1.5rem' }}
              kind="secondary"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem' }}>
              {tags.map((tag) => (
                <Tag key={tag} type="gray" filter onClose={() => handleRemoveTag(tag)}>
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
