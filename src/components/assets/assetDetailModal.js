import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { toCurrency } from "../../util";

function bytesToReadable(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function hoursToReadable(hours) {
  if (!hours) return "0h";
  if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

const UtilizationBar = ({ label, breakdown }) => {
  if (!breakdown) return null;
  const used = ((1 - (breakdown.idle || 0)) * 100).toFixed(1);
  const system = ((breakdown.system || 0) * 100).toFixed(1);
  const user = ((breakdown.user || 0) * 100).toFixed(1);
  const color = parseFloat(used) < 30 ? "#f44336" : parseFloat(used) < 70 ? "#ff9800" : "#4caf50";
  const statusLabel = parseFloat(used) < 30 ? "Low — consider right-sizing" : parseFloat(used) < 70 ? "Moderate" : "Healthy";
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" fontWeight="bold">{label} Utilization</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" sx={{ color, fontWeight: 600 }}>{used}%</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>({statusLabel})</Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(parseFloat(used), 100)}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: "#e0e0e0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
          },
        }}
      />
      <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">System: {system}%</Typography>
        <Typography variant="caption" color="text.secondary">User: {user}%</Typography>
        <Typography variant="caption" color="text.secondary">Idle: {((breakdown.idle || 0) * 100).toFixed(1)}%</Typography>
      </Box>
    </Box>
  );
};

const AssetDetailModal = ({ open, onClose, asset, currency }) => {
  if (!asset) return null;

  const props = asset.properties || {};
  const labels = asset.labels || {};
  const isNode = asset.type === "Node";
  const isDisk = asset.type === "Disk";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={asset.type}
          color="primary"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
        <span>{props.name || asset.key || "Unknown Asset"}</span>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ textAlign: "center", minWidth: 120, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {toCurrency(asset.totalCost || 0, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">Total Cost</Typography>
          </Box>
          {asset.adjustment !== undefined && asset.adjustment !== 0 && (
            <Box sx={{ textAlign: "center", minWidth: 120, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" color={asset.adjustment < 0 ? "success.main" : "error.main"}>
                {toCurrency(asset.adjustment, currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Adjustment</Typography>
            </Box>
          )}
          {asset.minutes > 0 && (
            <Box sx={{ textAlign: "center", minWidth: 120, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {hoursToReadable(asset.minutes / 60)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Active Time</Typography>
            </Box>
          )}
          {isNode && asset.discount > 0 && (
            <Box sx={{ textAlign: "center", minWidth: 120, p: 2, bgcolor: "#e8f5e9", borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {(asset.discount * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">Discount</Typography>
            </Box>
          )}
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Properties
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableBody>
            {props.provider && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Provider</TableCell>
                <TableCell>{props.provider}</TableCell>
              </TableRow>
            )}
            {props.cluster && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Cluster</TableCell>
                <TableCell>{props.cluster}</TableCell>
              </TableRow>
            )}
            {props.project && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Project</TableCell>
                <TableCell>{props.project}</TableCell>
              </TableRow>
            )}
            {props.service && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Service</TableCell>
                <TableCell>{props.service}</TableCell>
              </TableRow>
            )}
            {props.category && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Category</TableCell>
                <TableCell>{props.category}</TableCell>
              </TableRow>
            )}
            {props.providerID && (
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Provider ID</TableCell>
                <TableCell sx={{ wordBreak: "break-all", fontSize: "0.8rem" }}>{props.providerID}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell sx={{ fontWeight: 500 }}>Window</TableCell>
              <TableCell>
                {asset.start ? new Date(asset.start).toLocaleString() : "N/A"} &mdash;{" "}
                {asset.end ? new Date(asset.end).toLocaleString() : "N/A"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {isNode && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Cost Breakdown
            </Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>CPU Cost</TableCell>
                  <TableCell>{toCurrency(asset.cpuCost || 0, currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>RAM Cost</TableCell>
                  <TableCell>{toCurrency(asset.ramCost || 0, currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>GPU Cost</TableCell>
                  <TableCell>{toCurrency(asset.gpuCost || 0, currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Adjustment</TableCell>
                  <TableCell>{toCurrency(asset.adjustment || 0, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hardware Specifications
            </Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                {asset.nodeType && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Instance Type</TableCell>
                    <TableCell>{asset.nodeType}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>CPU Cores</TableCell>
                  <TableCell>{asset.cpuCores || 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>RAM</TableCell>
                  <TableCell>{bytesToReadable(asset.ramBytes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>CPU Core-Hours</TableCell>
                  <TableCell>{(asset.cpuCoreHours || 0).toFixed(1)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>RAM Byte-Hours</TableCell>
                  <TableCell>{bytesToReadable(asset.ramByteHours)}</TableCell>
                </TableRow>
                {asset.gpuCount > 0 && (
                  <>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>GPU Count</TableCell>
                      <TableCell>{asset.gpuCount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>GPU Hours</TableCell>
                      <TableCell>{(asset.GPUHours || 0).toFixed(1)}</TableCell>
                    </TableRow>
                  </>
                )}
                {asset.preemptible !== undefined && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Preemptible</TableCell>
                    <TableCell>{asset.preemptible > 0 ? "Yes" : "No"}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Utilization
            </Typography>
            <UtilizationBar label="CPU" breakdown={asset.cpuBreakdown} />
            <UtilizationBar label="RAM" breakdown={asset.ramBreakdown} />
          </>
        )}

        {isDisk && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Disk Details
            </Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableBody>
                {asset.storageClass && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Storage Class</TableCell>
                    <TableCell>{asset.storageClass}</TableCell>
                  </TableRow>
                )}
                {asset.claimName && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>PVC Claim</TableCell>
                    <TableCell>{asset.claimNamespace}/{asset.claimName}</TableCell>
                  </TableRow>
                )}
                {asset.volumeName && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Volume</TableCell>
                    <TableCell>{asset.volumeName}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Total Size</TableCell>
                  <TableCell>{bytesToReadable(asset.bytes)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Byte-Hours Total</TableCell>
                  <TableCell>{bytesToReadable(asset.byteHours)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Byte-Hours Used</TableCell>
                  <TableCell>{bytesToReadable(asset.byteHoursUsed)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {asset.breakdown && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Storage Utilization
                </Typography>
                <UtilizationBar label="Storage" breakdown={asset.breakdown} />
              </>
            )}
          </>
        )}

        {Object.keys(labels).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Labels
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {Object.entries(labels).map(([k, v]) => (
                <Chip
                  key={k}
                  label={`${k}: ${v}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.75rem" }}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDetailModal;
