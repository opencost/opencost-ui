import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const trendConfig = {
  success: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  error: { bg: "#ffebee", color: "#c62828", border: "#ef9a9a" },
  warning: { bg: "#fff8e1", color: "#e65100", border: "#ffe082" },
  default: { bg: "#f5f5f5", color: "#616161", border: "#e0e0e0" },
};

const TrendIcon = ({ direction, size = 13, color }) => {
  const sx = { fontSize: size, color };
  if (direction === "up") return <TrendingUpIcon sx={sx} />;
  if (direction === "down") return <TrendingDownIcon sx={sx} />;
  return <TrendingFlatIcon sx={sx} />;
};

const SummaryCard = ({ label, value, secondary, icon, trend, accent, highlight }) => {
  const strip = accent || highlight || "#1976d2";
  const tc = trend ? trendConfig[trend.color] || trendConfig.default : null;

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e4e7ec",
        overflow: "hidden",
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.15s",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ height: 3, background: strip, flexShrink: 0 }} />

      <Box sx={{ p: "14px 16px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: "0.62rem",
              fontWeight: 600,
              color: "#667085",
              lineHeight: 1,
            }}
          >
            {label}
          </Typography>
          {icon && (
            <Box sx={{ color: strip, display: "flex", alignItems: "center", opacity: 0.7 }}>
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#101828",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.15,
            fontSize: "1.35rem",
          }}
          title={typeof value === "string" ? value : String(value)}
        >
          {value}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 0.75, gap: 1 }}>
          {secondary ? (
            <Typography
              variant="caption"
              sx={{ color: "#667085", fontSize: "0.68rem", lineHeight: 1.3, flexShrink: 1, minWidth: 0 }}
            >
              {secondary}
            </Typography>
          ) : <span />}

          {tc && trend && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                px: 0.75,
                py: "2px",
                borderRadius: "10px",
                backgroundColor: tc.bg,
                border: `1px solid ${tc.border}`,
                flexShrink: 0,
              }}
            >
              <TrendIcon direction={trend.direction} color={tc.color} />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.58rem", fontWeight: 600, color: tc.color, whiteSpace: "nowrap" }}
              >
                {trend.label}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(SummaryCard);
