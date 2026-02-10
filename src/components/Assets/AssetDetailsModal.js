import React from "react";
import {
  Modal,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from "@carbon/react";
import { formatDuration, bytesToString } from "../../util";
import SummaryRow from "./SummaryRow";

const AssetDetailsModal = ({ open, onClose, asset }) => {
  if (!asset) return null;

  const { properties = {}, labels = {}, ...rest } = asset;

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading={properties.name || rest.name || "Asset Details"}
      passiveModal
      size="lg"
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h5 style={{ marginBottom: "0.5rem" }}>Overview</h5>
        <StructuredListWrapper isCondensed ariaLabel="Asset overview">
          <StructuredListBody>
            <SummaryRow
              label="Category"
              value={properties.category || rest.category}
            />
            <SummaryRow label="Type" value={rest.type} />
            <SummaryRow label="Provider" value={properties.provider} />
            <SummaryRow label="Service" value={properties.service} />
            <SummaryRow label="Cluster" value={properties.cluster} />
            <SummaryRow
              label="Total Cost"
              value={rest.totalCost ? `$${rest.totalCost.toFixed(6)}` : null}
            />
            <SummaryRow
              label="Duration"
              value={rest.minutes ? formatDuration(rest.minutes) : null}
            />
            <SummaryRow label="CPU Cores" value={rest.cpuCores} />
            <SummaryRow
              label="RAM"
              value={rest.ramBytes ? bytesToString(rest.ramBytes) : null}
            />
            <SummaryRow label="GPU Count" value={rest.gpuCount} />
            <SummaryRow
              label="Preemptible"
              value={rest.preemptible ? "Yes" : "No"}
            />
          </StructuredListBody>
        </StructuredListWrapper>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h5 style={{ marginBottom: "0.5rem" }}>
          Properties ({Object.keys(properties).length})
        </h5>
        <StructuredListWrapper isCondensed ariaLabel="Properties list">
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Key</StructuredListCell>
              <StructuredListCell head>Value</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {Object.entries(properties).length > 0 ? (
              Object.entries(properties).map(([key, value]) => (
                <StructuredListRow key={key}>
                  <StructuredListCell
                    style={{ width: "30%", wordBreak: "break-all" }}
                  >
                    {key}
                  </StructuredListCell>
                  <StructuredListCell style={{ wordBreak: "break-all" }}>
                    {String(value)}
                  </StructuredListCell>
                </StructuredListRow>
              ))
            ) : (
              <StructuredListRow>
                <StructuredListCell colSpan={2}>
                  No properties available
                </StructuredListCell>
              </StructuredListRow>
            )}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h5 style={{ marginBottom: "0.5rem" }}>
          Labels ({Object.keys(labels).length})
        </h5>
        <StructuredListWrapper isCondensed ariaLabel="Labels list">
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Key</StructuredListCell>
              <StructuredListCell head>Value</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {Object.entries(labels).length > 0 ? (
              Object.entries(labels).map(([key, value]) => (
                <StructuredListRow key={key}>
                  <StructuredListCell
                    style={{ width: "30%", wordBreak: "break-all" }}
                  >
                    {key}
                  </StructuredListCell>
                  <StructuredListCell style={{ wordBreak: "break-all" }}>
                    {String(value)}
                  </StructuredListCell>
                </StructuredListRow>
              ))
            ) : (
              <StructuredListRow>
                <StructuredListCell colSpan={2}>
                  No labels available
                </StructuredListCell>
              </StructuredListRow>
            )}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </Modal>
  );
};

export default AssetDetailsModal;
