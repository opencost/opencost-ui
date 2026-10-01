import { Modal, Paper } from "@mui/material";
import {
  TableContainer,
  TableCell,
  TableRow,
  Table,
  TableBody,
} from "@mui/material";
import {
  ThemedModalHeader,
  modalCenterStyle,
  paperBaseStyle,
} from "../themed-modal";

const paperStyle = {
  ...paperBaseStyle,
  maxWidth: "600px",
  maxHeight: "80vh",
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
    <Modal open={true} onClose={onClose} style={modalCenterStyle}>
      <Paper
        style={paperStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-cost-details-title"
      >
        <ThemedModalHeader
          title={row.resource_type || "External Cost Details"}
          titleId="external-cost-details-title"
          onClose={onClose}
        />
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

