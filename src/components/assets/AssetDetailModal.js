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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${typeColors[asset.type] || typeColors.Other}15 0%, ${typeColors[asset.type] || typeColors.Other}05 100%)`,
          borderBottom: `3px solid ${typeColors[asset.type] || typeColors.Other}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {asset.name}
          </Typography>
          <Chip
            label={asset.type}
            size="medium"
            sx={{
              backgroundColor: typeColors[asset.type] || typeColors.Other,
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Cost Summary */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${typeColors[asset.type] || typeColors.Other}15 0%, ${typeColors[asset.type] || typeColors.Other}05 100%)`,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
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

      <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetDetailModal;
