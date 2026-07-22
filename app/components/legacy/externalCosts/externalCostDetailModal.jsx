import { Modal, Paper } from "@mui/material";
import {
  TableContainer,
  TableCell,
  TableRow,
  Table,
  TableBody,
} from "@mui/material";

const modalStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const paperStyle = {
  backgroundColor: "var(--cds-layer)",
  color: "var(--cds-text-primary)",
  border: "1px solid var(--cds-border-subtle)",
  borderRadius: "8px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  padding: "24px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "80vh",
  overflowY: "auto",
  outline: "none",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  borderBottom: "1px solid var(--cds-border-subtle)",
  paddingBottom: "12px",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "var(--cds-text-primary)",
  fontFamily: '"IBM Plex Sans", sans-serif',
};

const cellKeyStyle = {
  color: "var(--cds-text-secondary)",
  fontWeight: 600,
  borderColor: "var(--cds-border-subtle)",
  fontFamily: '"IBM Plex Sans", sans-serif',
};

const cellValStyle = {
  color: "var(--cds-text-primary)",
  borderColor: "var(--cds-border-subtle)",
  fontFamily: '"IBM Plex Sans", sans-serif',
};

// for now, we can assume that the "Name" is resourceType
export const ExternalCostDetails = ({ row, onClose }) => (
  <div>
    <Modal
      open={true}
      onClose={onClose}
      title={row.resource_type}
      style={modalStyle}
    >
      <Paper style={paperStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            {row.resource_type || "External Cost Details"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--cds-text-primary)",
              cursor: "pointer",
              fontSize: "1.5rem",
              lineHeight: 1,
              padding: "4px 8px",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--cds-layer-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            &times;
          </button>
        </div>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={cellKeyStyle}>account_name</TableCell>
                <TableCell style={cellValStyle}>{row.account_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>aggregate</TableCell>
                <TableCell style={cellValStyle}>{row.aggregate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>charge_category</TableCell>
                <TableCell style={cellValStyle}>{row.charge_category}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>cost</TableCell>
                <TableCell style={cellValStyle}>{row.cost}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>cost_source</TableCell>
                <TableCell style={cellValStyle}>{row.cost_source}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>cost_type</TableCell>
                <TableCell style={cellValStyle}>{row.cost_type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>description</TableCell>
                <TableCell style={cellValStyle}>{row.description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>domain</TableCell>
                <TableCell style={cellValStyle}>{row.domain}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>id</TableCell>
                <TableCell style={cellValStyle}>{row.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>list_unit_price</TableCell>
                <TableCell style={cellValStyle}>{row.list_unit_price}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>provider_id</TableCell>
                <TableCell style={cellValStyle}>{row.provider_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>resource_name</TableCell>
                <TableCell style={cellValStyle}>{row.resource_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>resource_type</TableCell>
                <TableCell style={cellValStyle}>{row.resource_type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>usage_quantity</TableCell>
                <TableCell style={cellValStyle}>{row.usage_quantity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>usage_unit</TableCell>
                <TableCell style={cellValStyle}>{row.usage_unit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={cellKeyStyle}>zone</TableCell>
                <TableCell style={cellValStyle}>{row.zone}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Modal>
  </div>
);

