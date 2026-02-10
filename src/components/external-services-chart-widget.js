'use client';

import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Tile, Tag, DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { SimpleBarChart } from '@carbon/charts-react';

const chartData = [
  { group: '15/05/2025', key: 'Datadog', value: 0.45 },
  { group: '15/05/2025', key: 'OpenAI', value: 0.12 },
  { group: '15/05/2025', key: 'MongoDB', value: 0.08 },
  { group: '15/05/2025', key: 'Snowflake', value: 0.05 },
  { group: '16/05/2025', key: 'Datadog', value: 0.52 },
  { group: '16/05/2025', key: 'OpenAI', value: 0.15 },
  { group: '16/05/2025', key: 'MongoDB', value: 0.09 },
  { group: '16/05/2025', key: 'Snowflake', value: 0.06 },
  { group: '17/05/2025', key: 'Datadog', value: 0.48 },
  { group: '17/05/2025', key: 'OpenAI', value: 0.18 },
  { group: '17/05/2025', key: 'MongoDB', value: 0.11 },
  { group: '17/05/2025', key: 'Snowflake', value: 0.08 },
  { group: '18/05/2025', key: 'Datadog', value: 0.65 },
  { group: '18/05/2025', key: 'OpenAI', value: 0.22 },
  { group: '18/05/2025', key: 'MongoDB', value: 0.13 },
  { group: '18/05/2025', key: 'Snowflake', value: 0.12 },
  { group: '19/05/2025', key: 'Datadog', value: 0.78 },
  { group: '19/05/2025', key: 'OpenAI', value: 0.28 },
  { group: '19/05/2025', key: 'MongoDB', value: 0.15 },
  { group: '19/05/2025', key: 'Snowflake', value: 0.18 },
  { group: '20/05/2025', key: 'Datadog', value: 0.82 },
  { group: '20/05/2025', key: 'OpenAI', value: 0.35 },
  { group: '20/05/2025', key: 'MongoDB', value: 0.18 },
  { group: '20/05/2025', key: 'Snowflake', value: 0.22 },
  { group: '21/05/2025', key: 'Datadog', value: 0.95 },
  { group: '21/05/2025', key: 'OpenAI', value: 0.42 },
  { group: '21/05/2025', key: 'MongoDB', value: 0.21 },
  { group: '21/05/2025', key: 'Snowflake', value: 0.28 },
];

const servicesData = [
  { id: '1', name: 'Datadog', cost: '$4.21', type: 'Monitoring', trend: '+12%', status: 'Billed' },
  { id: '2', name: 'OpenAI', cost: '$0.02', type: 'AI/ML', trend: '+8%', status: 'Billed' },
  { id: '3', name: 'MongoDB', cost: '-$0.01', type: 'Database', trend: '-5%', status: 'Billed' },
  { id: '4', name: 'Snowflake', cost: '$0.31', type: 'Data Warehouse', trend: '+15%', status: 'Billed' },
];

const chartOptions = {
  title: 'External Services Cost Trend',
  axes: {
    left: {
      mapsTo: 'value',
      scaleType: 'linear',
    },
    bottom: {
      mapsTo: 'group',
      scaleType: 'labels',
    },
  },
  height: '400px',
};

const headers = [
  { key: 'name', header: 'Service' },
  { key: 'cost', header: 'Cost' },
  { key: 'type', header: 'Type' },
  { key: 'trend', header: 'Trend' },
  { key: 'status', header: 'Status' },
];

export default function ExternalServicesChartWidget() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div style={{ width: '100%' }}>
      <Tabs>
        <TabList aria-label="External Services Tabs">
          <Tab>Chart</Tab>
          <Tab>Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div style={{ width: '100%', height: '400px', marginTop: '1rem' }}>
              <SimpleBarChart data={chartData} options={chartOptions} />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              <DataTable rows={servicesData} headers={headers}>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            {...getRowProps({ row })}
                            key={row.id}
                            onClick={() => setSelectedService(row.cells[0].value)}
                            style={{ cursor: 'pointer' }}
                          >
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.info.header === 'type' ? (
                                  <Tag type="outline">{cell.value}</Tag>
                                ) : cell.info.header === 'status' ? (
                                  <Tag type="gray">{cell.value}</Tag>
                                ) : cell.info.header === 'trend' ? (
                                  <span style={{ color: cell.value.startsWith('+') ? '#da1e28' : '#198038' }}>
                                    {cell.value}
                                  </span>
                                ) : (
                                  cell.value
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>

              {selectedService && (
                <Tile style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f4f4f4' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{selectedService} Details</h4>
                  <div style={{ fontSize: '0.875rem' }}>
                    <p>Click on a service in the table above to see detailed breakdown.</p>
                    <p style={{ color: '#525252', marginTop: '0.25rem' }}>Service: {selectedService}</p>
                  </div>
                </Tile>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
