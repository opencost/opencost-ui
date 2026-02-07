import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { toCurrency } from "../../util";
import { formatBytes } from "./tokens";

/**
 * AssetDetailModal - Detailed view of asset properties, labels, and breakdowns
 */
const AssetDetailModal = ({ asset, currency, open, onClose }) => {
  if (!asset) return null;

  const typeColors = {
    Node: "#0f62fe",
    Disk: "#8a3ffc",
    Network: "#0072c3",
    LoadBalancer: "#198038",
    Management: "#fa4d56",
    Other: "#878d96",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5">{asset.name}</Typography>
          <Chip
            label={asset.type}
            size="small"
            sx={{
              backgroundColor: typeColors[asset.type] || typeColors.Other,
              color: "white",
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Cost Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cost Summary
          </Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Total Cost
              </Typography>
              <Typography variant="h5">
                {toCurrency(asset.totalCost, currency)}
              </Typography>
            </Box>
            {asset.adjustment !== undefined && asset.adjustment !== 0 && (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Adjustment
                </Typography>
                <Typography variant="h5">
                  {toCurrency(asset.adjustment, currency)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Properties */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Properties
          </Typography>
          <Table size="small">
            <TableBody>
              {asset.properties &&
                Object.entries(asset.properties).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 600, width: "30%" }}>
                      {key}
                    </TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>

        {/* Labels */}
        {asset.labels && Object.keys(asset.labels).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Labels
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Object.entries(asset.labels).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Node-specific breakdowns */}
        {asset.type === "Node" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resource Breakdown
              </Typography>

              {/* CPU */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  CPU ({asset.cpuCores} cores) - Total:{" "}
                  {toCurrency(asset.cpuCost, currency)}
                </Typography>
                {asset.cpuBreakdown && (
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Used: {toCurrency(asset.cpuBreakdown.used, currency)} (
                      {(
                        (asset.cpuBreakdown.used / asset.cpuCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                    <Typography variant="body2">
                      Idle: {toCurrency(asset.cpuBreakdown.idle, currency)} (
                      {(
                        (asset.cpuBreakdown.idle / asset.cpuCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                    <Typography variant="body2">
                      System: {toCurrency(asset.cpuBreakdown.system, currency)}{" "}
                      (
                      {(
                        (asset.cpuBreakdown.system / asset.cpuCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* RAM */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  RAM ({formatBytes(asset.ramBytes)}) - Total:{" "}
                  {toCurrency(asset.ramCost, currency)}
                </Typography>
                {asset.ramBreakdown && (
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      Used: {toCurrency(asset.ramBreakdown.used, currency)} (
                      {(
                        (asset.ramBreakdown.used / asset.ramCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                    <Typography variant="body2">
                      Idle: {toCurrency(asset.ramBreakdown.idle, currency)} (
                      {(
                        (asset.ramBreakdown.idle / asset.ramCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                    <Typography variant="body2">
                      System: {toCurrency(asset.ramBreakdown.system, currency)}{" "}
                      (
                      {(
                        (asset.ramBreakdown.system / asset.ramCost) *
                        100
                      ).toFixed(1)}
                      %)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Disk-specific info */}
        {asset.type === "Disk" && asset.bytes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Storage Details
              </Typography>
              <Typography variant="body2">
                Size: {formatBytes(asset.bytes)}
              </Typography>
              {asset.byteHours && (
                <Typography variant="body2">
                  Byte Hours: {formatBytes(asset.byteHours)}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDetailModal;
