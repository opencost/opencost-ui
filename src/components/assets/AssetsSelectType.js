import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Popover from "@mui/material/Popover";

const AssetsSelectType = ({ assetType, setAssetType, assetTypeOptions }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const typeOptions = [
    { id: "all", text: "All Types" },
    ...assetTypeOptions.map((type) => ({ id: type, text: type })),
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (id) => {
    setAssetType(id);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const selectedText =
    typeOptions.find((opt) => opt.id === assetType)?.text || "All Types";

  return (
    <>
      <TextField
        id="assets-type-select"
        label="Asset Type"
        value={selectedText}
        onClick={handleClick}
        slotProps={{
          htmlInput: {
            readOnly: true,
            style: { cursor: "pointer" },
          },
        }}
        sx={{
          width: 150,
          "& .MuiInputBase-root": {
            backgroundColor: "#ffffff",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e0e0e0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0f62fe",
          },
        }}
        variant="outlined"
        size="small"
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              mt: 1,
              overflow: "hidden",
              minWidth: 180,
            },
          },
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {typeOptions.map((opt) => (
            <span
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                color: assetType === opt.id ? "#0f62fe" : "#525252",
                fontWeight: assetType === opt.id ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#0f62fe";
                e.target.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.target.style.color =
                  assetType === opt.id ? "#0f62fe" : "#525252";
                e.target.style.textDecoration = "none";
              }}
            >
              {opt.text}
            </span>
          ))}
        </div>
      </Popover>
    </>
  );
};

export default AssetsSelectType;
