import PropTypes from "prop-types";
import { Modal, ModalBody } from "@carbon/react";
import { Money, DataBase, Analytics } from "@carbon/icons-react";
import {
  bytesToGB,
  formatCurrency,
  getAssetStatus,
} from "../../utils/assetCalculations";
import "../../styles/assets/detail-panel.css";

const AssetDetailPanel = ({ asset, isOpen, onClose }) => {
  if (!asset) return null;

  const status = getAssetStatus(asset);
  const size = bytesToGB(asset.bytes);
  const days = asset.minutes ? asset.minutes / 1440 : 1;
  const dailyRate = (asset.totalCost || 0) / days;
  const wastedCost = (asset.totalCost || 0) * (asset.breakdown?.idle || 0);

  const breakdown = asset.breakdown || {};
  const idle = ((breakdown.idle || 0) * 100).toFixed(1);
  const system = ((breakdown.system || 0) * 100).toFixed(1);
  const user = ((breakdown.user || 0) * 100).toFixed(1);
  const other = ((breakdown.other || 0) * 100).toFixed(1);

  return (
    <Modal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading={asset.name}
      size="md"
      passiveModal
    >
      <ModalBody>
        <div className="asset-detail-panel">
          {/* Header Section */}
          <div className="detail-header">
            <div className="detail-meta">
              <span className="detail-type">{asset.assetType}</span>
              <span className="detail-separator">•</span>
              <span className="detail-cluster">{asset.cluster}</span>
            </div>
            <div className={`detail-status status-${status.type}`}>
              {status.label}
            </div>
          </div>

          {/* Cost Section */}
          <section className="detail-section">
            <h4 className="section-title">
              <Money size={20} />
              <span>Cost Details</span>
            </h4>
            <dl className="detail-grid">
              <dt>Total Cost</dt>
              <dd className="detail-value-primary">{formatCurrency(asset.totalCost)}</dd>

              <dt>Daily Rate</dt>
              <dd>{formatCurrency(dailyRate)}</dd>

              <dt>Wasted Cost</dt>
              <dd className="detail-value-error">{formatCurrency(wastedCost)}</dd>

              <dt>Efficiency</dt>
              <dd>
                {((1 - (breakdown.idle || 0)) * 100).toFixed(1)}% utilized
              </dd>
            </dl>
          </section>

          {/* Storage Section */}
          <section className="detail-section">
            <h4 className="section-title">
              <DataBase size={20} />
              <span>Storage Information</span>
            </h4>
            <dl className="detail-grid">
              <dt>Total Size</dt>
              <dd className="detail-value-primary">{size} GB</dd>

              <dt>Storage Class</dt>
              <dd>{asset.storageClass || "N/A"}</dd>

              <dt>Provider ID</dt>
              <dd className="detail-mono">{asset.providerID || asset.id}</dd>

              {asset.volumeName && (
                <>
                  <dt>Volume Name</dt>
                  <dd className="detail-mono">{asset.volumeName}</dd>
                </>
              )}
            </dl>
          </section>

          {/* Utilization Breakdown */}
          <section className="detail-section">
            <h4 className="section-title">
              <Analytics size={20} />
              <span>Utilization Breakdown</span>
            </h4>
            <div className="breakdown-bars">
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-name">Idle</span>
                  <span className="breakdown-percent">{idle}%</span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill breakdown-fill-idle"
                    style={{ width: `${idle}%` }}
                  />
                </div>
              </div>

              {parseFloat(system) > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-name">System</span>
                    <span className="breakdown-percent">{system}%</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill breakdown-fill-system"
                      style={{ width: `${system}%` }}
                    />
                  </div>
                </div>
              )}

              {parseFloat(user) > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-name">User</span>
                    <span className="breakdown-percent">{user}%</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill breakdown-fill-user"
                      style={{ width: `${user}%` }}
                    />
                  </div>
                </div>
              )}

              {parseFloat(other) > 0 && (
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-name">Other</span>
                    <span className="breakdown-percent">{other}%</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill breakdown-fill-other"
                      style={{ width: `${other}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Kubernetes Info (for PVCs) */}
          {asset.claimNamespace && (
            <section className="detail-section">
              <h4 className="section-title">
                <span>Kubernetes Information</span>
              </h4>
              <dl className="detail-grid">
                <dt>Namespace</dt>
                <dd className="detail-mono">{asset.claimNamespace}</dd>

                <dt>Claim Name</dt>
                <dd className="detail-mono">{asset.claimName}</dd>

                {asset.local !== undefined && (
                  <>
                    <dt>Type</dt>
                    <dd>{asset.local ? "Local Storage" : "Network Storage"}</dd>
                  </>
                )}
              </dl>
            </section>
          )}

          {/* Time Window Info */}
          {asset.window && (
            <section className="detail-section detail-section-last">
              <h4 className="section-title">
                <span>Measurement Window</span>
              </h4>
              <dl className="detail-grid">
                <dt>Start</dt>
                <dd className="detail-mono">{new Date(asset.window.start).toLocaleString()}</dd>

                <dt>End</dt>
                <dd className="detail-mono">{new Date(asset.window.end).toLocaleString()}</dd>

                {asset.minutes && (
                  <>
                    <dt>Duration</dt>
                    <dd>{(asset.minutes / 60).toFixed(1)} hours</dd>
                  </>
                )}
              </dl>
            </section>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

AssetDetailPanel.propTypes = {
  asset: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    assetType: PropTypes.string,
    cluster: PropTypes.string,
    totalCost: PropTypes.number,
    bytes: PropTypes.number,
    storageClass: PropTypes.string,
    providerID: PropTypes.string,
    volumeName: PropTypes.string,
    claimName: PropTypes.string,
    claimNamespace: PropTypes.string,
    local: PropTypes.number,
    window: PropTypes.shape({
      start: PropTypes.string,
      end: PropTypes.string,
    }),
    minutes: PropTypes.number,
    breakdown: PropTypes.shape({
      idle: PropTypes.number,
      system: PropTypes.number,
      user: PropTypes.number,
      other: PropTypes.number,
    }),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AssetDetailPanel;
