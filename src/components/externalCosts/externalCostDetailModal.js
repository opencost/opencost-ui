import { Modal, Paper } from "@mui/material";
import {
  TableContainer,
  TableCell,
  TableRow,
  Table,
  TableBody,
} from "@mui/material";
import { toCurrency } from "../../util";

// for now, we can assume that the "Name" is resourceType
export const ExternalCostDetails = ({ row, onClose, currency = "USD" }) => (
  <div>
    <Modal
      open={true}
      onClose={onClose}
      title={row.resource_type}
      style={{ margin: "10%" }}
    >
      <Paper style={{ padding: 20 }}>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>account_name</TableCell>
                <TableCell>{row.account_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>aggregate</TableCell>
                <TableCell>{row.aggregate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>charge_category</TableCell>
                <TableCell>{row.charge_category}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cost</TableCell>
                <TableCell>{toCurrency(row.cost, currency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cost_source</TableCell>
                <TableCell>{row.cost_source}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>cost_type</TableCell>
                <TableCell>{row.cost_type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>description</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>domain</TableCell>
                <TableCell>{row.domain}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>id</TableCell>
                <TableCell>{row.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>list_unit_price</TableCell>
                <TableCell>
                  {row.list_unit_price
                    ? toCurrency(row.list_unit_price, currency)
                    : row.list_unit_price}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>provider_id</TableCell>
                <TableCell>{row.provider_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>resource_name</TableCell>
                <TableCell>{row.resource_name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>resource_type</TableCell>
                <TableCell>{row.resource_type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>usage_quantity</TableCell>
                <TableCell>{row.usage_quantity}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>usage_unit</TableCell>
                <TableCell>{row.usage_unit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>zone</TableCell>
                <TableCell>{row.zone}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Modal>
  </div>
);
