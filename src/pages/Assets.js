import React, { useState } from "react";
import {
  Grid,
  Column,
  Dropdown,
  Button,
  Tile,
  Theme,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  ContentSwitcher,
  Switch,
  Tag,
  Pagination,
  Search,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from "@carbon/react";
import {
  Filter,
  Renew,
  Download,
  CurrencyDollar,
  ChartClusterBar,
  CloudServices,
  Flash,
  Settings,
} from "@carbon/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Page from "../components/Page";

const timeRangeOptions = [
  { id: "today", label: "Today" },
  { id: "last24h", label: "Last 24h" },
  { id: "last7d", label: "Last 7 Days" },
  { id: "last30d", label: "Last 30 Days" },
];

const aggregateOptions = [
  { id: "type", label: "Asset Type" },
  { id: "cluster", label: "Cluster" },
  { id: "service", label: "Service" },
];

const COLORS = ["#0f62fe", "#00d0bc", "#24a148", "#ffaf38", "#fa4d56"];

const dataCostDistribution = [
  { name: "Node", value: 4500 },
  { name: "Disk", value: 2500 },
  { name: "LoadBalancer", value: 1200 },
  { name: "Network", value: 800 },
  { name: "Shared", value: 5000 },
];

const dataTopExpensive = [
  { name: "Production-Node-01", cost: 4250 },
  { name: "Shared-Storage-01", cost: 3200 },
  { name: "Database-Volume-01", cost: 2150 },
  { name: "Staging-Node-01", cost: 1875 },
  { name: "API-LoadBalancer-01", cost: 945 },
  { name: "Development-Node-01", cost: 875 },
  { name: "VPC-Peering-Link", cost: 520 },
  { name: "Cache-Volume-01", cost: 450 },
];

const dataEfficiency = [
  { name: "Used", value: 76 },
  { name: "Idle", value: 24 },
];

const dataSpot = [
  { name: "Node", spot: 400, onDemand: 600 },
  { name: "Disk", spot: 200, onDemand: 800 },
  { name: "Network", spot: 100, onDemand: 900 },
];

const tableHeaders = [
  { key: "name", header: "Asset Name" },
  { key: "type", header: "Type" },
  { key: "cluster", header: "Cluster" },
  { key: "provider", header: "Provider" },
  { key: "totalCost", header: "Total Cost" },
  { key: "efficiency", header: "Efficiency" },
];

const tableData = [
  { 
    id: "1", 
    name: "Production-Node-01", 
    type: "Node", 
    cluster: "prod-us-east-1", 
    provider: "AWS", 
    totalCost: "$4,250.75", 
    efficiency: "72%",
    details: {
      costBreakdown: [
        { label: "CPU Cost", value: "$2,100.50" },
        { label: "RAM Cost", value: "$1,200.25" },
        { label: "GPU Cost", value: "$950.00" }
      ],
      properties: [
        { label: "Instance Type", value: "p3.2xlarge" },
        { label: "Region", value: "us-east-1" },
        { label: "Availability Zone", value: "us-east-1a" }
      ],
      labels: [
        { key: "env", value: "production" },
        { key: "team", value: "ml-platform" },
        { key: "cost-center", value: "engineering" }
      ],
      timeRange: "Start: 05/01/2026, 14:32:44 • End: 04/02/2026, 14:32:44"
    }
  },
  { 
    id: "2", 
    name: "Shared-Storage-01", 
    type: "Shared", 
    cluster: "prod-us-east-1", 
    provider: "AWS", 
    totalCost: "$3,200.00", 
    efficiency: "78%",
     details: {
      costBreakdown: [
        { label: "Storage Cost", value: "$3,000.00" },
        { label: "IOPS Cost", value: "$200.00" }
      ],
      properties: [
        { label: "Volume Type", value: "io1" },
        { label: "Size", value: "500 GB" },
        { label: "Region", value: "us-east-1" }
      ],
      labels: [
        { key: "env", value: "production" },
        { key: "app", value: "shared-db" }
      ],
      timeRange: "Start: 05/01/2026, 14:32:44 • End: 04/02/2026, 14:32:44"
    }
  },
  { id: "3", name: "Database-Volume-01", type: "Disk", cluster: "prod-us-east-1", provider: "AWS", totalCost: "$2,150.30", efficiency: "85%", details: null },
  { id: "4", name: "Staging-Node-01", type: "Node", cluster: "staging-us-west-2", provider: "GCP", totalCost: "$1,875.50", efficiency: "58%", details: null },
  { id: "5", name: "API-LoadBalancer-01", type: "LoadBalancer", cluster: "prod-us-east-1", provider: "AWS", totalCost: "$945.20", efficiency: "92%", details: null },
  { id: "6", name: "Development-Node-01", type: "Node", cluster: "dev-us-west-1", provider: "AWS", totalCost: "$875.40", efficiency: "45%", details: null },
  { id: "7", name: "VPC-Peering-Link", type: "Network", cluster: "prod-us-east-1", provider: "AWS", totalCost: "$520.75", efficiency: "88%", details: null },
  { id: "8", name: "Cache-Volume-01", type: "Disk", cluster: "prod-us-east-1", provider: "AWS", totalCost: "$450.50", efficiency: "90%", details: null },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#ffffff", padding: "10px", border: "1px solid #e0e0e0", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <p style={{ color: "#161616" }}>{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Assets = () => {
  const [timeRange, setTimeRange] = useState(timeRangeOptions[2]); 
  const [aggregateBy, setAggregateBy] = useState(aggregateOptions[0]);
  const [view, setView] = useState(0); 

  return (
    <Page active="assets">
      <Theme theme="white">
        <div className="assets-page-container" style={{ padding: "2rem", minHeight: "100vh", backgroundColor: "#ffffff", color: "#161616" }}>
          {/* Header Section */}
          <section className="assets-header" style={{ marginBottom: "2rem" }}>
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <h1 style={{ fontSize: "2rem", fontWeight: "600", marginBottom: "0.5rem" }}>Infrastructure Assets</h1>
                <p style={{ color: "#525252", marginBottom: "1.5rem" }}>Analyze infrastructure-level cost and efficiency</p>
              </Column>
            </Grid>
            <Grid>
              <Column lg={4} md={4} sm={4}>
                <Dropdown
                  id="time-range"
                  titleText="Time Range"
                  label="Select time range"
                  items={timeRangeOptions}
                  selectedItem={timeRange}
                  onChange={({ selectedItem }) => setTimeRange(selectedItem)}
                  itemToString={(item) => (item ? item.label : "")}
                />
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Dropdown
                  id="aggregate-by"
                  titleText="Aggregate By"
                  label="Select aggregation"
                  items={aggregateOptions}
                  selectedItem={aggregateBy}
                  onChange={({ selectedItem }) => setAggregateBy(selectedItem)}
                  itemToString={(item) => (item ? item.label : "")}
                />
              </Column>
              <Column lg={8} md={8} sm={4} style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: "1rem" }}>
                <Button kind="ghost" renderIcon={Renew}>Refresh</Button>
                <Button kind="ghost" renderIcon={Download}>Export CSV</Button>
              </Column>
            </Grid>
          </section>

          <section className="kpi-summary" style={{ marginBottom: "2rem" }}>
            <Grid>
              <Column lg={4} md={4} sm={4}>
                <Tile style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" }}>Total Infrastructure Cost</span>
                    <CurrencyDollar size={20} />
                  </div>
                  <h2 style={{ fontSize: "2.5rem", fontWeight: "400", marginTop: "1rem" }}>$14,268</h2>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#0f62fe", marginTop: "1rem" }}></div>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" }}>Total Number of Assets</span>
                     <CloudServices size={20} />
                  </div>
                  <h2 style={{ fontSize: "2.5rem", fontWeight: "400", marginTop: "1rem" }}>8</h2>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#0f62fe", marginTop: "1rem" }}></div>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" }}>Most Expensive Asset Type</span>
                    <ChartClusterBar size={20} />
                  </div>
                  <h2 style={{ fontSize: "2.5rem", fontWeight: "400", marginTop: "1rem" }}>Node</h2>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#0f62fe", marginTop: "1rem" }}></div>
                </Tile>
              </Column>
              <Column lg={4} md={4} sm={4}>
                <Tile style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase" }}>Infrastructure Efficiency Score</span>
                     <Flash size={20} />
                  </div>
                  <h2 style={{ fontSize: "2.5rem", fontWeight: "400", marginTop: "1rem" }}>76%</h2>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#0f62fe", marginTop: "1rem" }}></div>
                </Tile>
              </Column>
            </Grid>
          </section>

          <section className="charts-section" style={{ marginBottom: "2rem" }}>
             <Grid>
                <Column lg={8} md={8} sm={4}>
                  <Tile style={{ padding: "16px" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Cost by Asset Type</h4>
                    <p style={{ color: "#525252", fontSize: "0.875rem", marginBottom: "1rem" }}>Distribution of infrastructure costs</p>
                    <div style={{ height: "300px", width: "100%", position: "relative" }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={dataCostDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={90}
                           paddingAngle={2}
                           dataKey="value"
                         >
                           {dataCostDistribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                       </PieChart>
                     </ResponsiveContainer>
                    </div>
                  </Tile>
                </Column>
                <Column lg={8} md={8} sm={4}>
                  <Tile style={{ padding: "16px" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Top 10 Most Expensive Assets</h4>
                    <p style={{ color: "#525252", fontSize: "0.875rem", marginBottom: "1rem" }}>Sorted by total cost descending</p>
                    <div style={{ height: "300px", width: "100%", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dataTopExpensive}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                          <XAxis type="number" stroke="#525252" />
                          <YAxis type="category" dataKey="name" stroke="#525252" width={120} tick={{fontSize: 10}} />
                          <Tooltip cursor={{fill: '#f4f4f4'}} content={<CustomTooltip />} />
                          <Bar dataKey="cost" fill="#0f62fe" barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Tile>
                </Column>
             </Grid>
          </section>

          <section className="efficiency-section" style={{ marginBottom: "2rem" }}>
            <Grid>
               <Column lg={8} md={8} sm={4}>
                  <Tile style={{ padding: "16px" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Cluster Efficiency Gauge</h4>
                     <p style={{ color: "#525252", fontSize: "0.875rem", marginBottom: "1rem" }}>Actual vs Idle resources</p>
                    <div style={{ height: "250px", width: "100%", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataEfficiency}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={85}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            paddingAngle={0}
                            stroke="none"
                            cornerRadius={40}
                          >
                            <Cell key="cell-used" fill="#0f62fe" />
                            <Cell key="cell-idle" fill="#e0e0e0" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                         <h2 style={{ fontSize: "2.5rem", fontWeight: "600", marginBottom: 0, lineHeight: 1 }}>76%</h2>
                         <span style={{ color: "#525252", fontSize: "1rem" }}>Efficiency</span>
                      </div>
                    </div>
                  </Tile>
               </Column>
               <Column lg={8} md={8} sm={4}>
                  <Tile style={{ padding: "16px" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Spot vs On-Demand</h4>
                    <p style={{ color: "#525252", fontSize: "0.875rem", marginBottom: "1rem" }}>Instance type distribution</p>
                    <div style={{ height: "250px", width: "100%", position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dataSpot}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                          <XAxis dataKey="name" stroke="#525252" />
                          <YAxis stroke="#525252" />
                          <Tooltip cursor={{fill: '#f4f4f4'}} content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="spot" stackId="a" fill="#0f62fe" name="Spot" />
                          <Bar dataKey="onDemand" stackId="a" fill="#00d0bc" name="On-Demand" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Tile>
               </Column>
            </Grid>
          </section>

          <section className="table-controls" style={{ marginBottom: "1rem" }}>
             <Grid>
                <Column lg={16} md={8} sm={4} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ marginRight: "1rem" }}>View:</span>
                  <ContentSwitcher onChange={({ index }) => setView(index)}>
                    <Switch name="table" text="Table" />
                    <Switch name="treemap" text="Tree Map" />
                  </ContentSwitcher>
                </Column>
             </Grid>
          </section>

          <section className="assets-table">
            <Grid>
               <Column lg={16} md={8} sm={4}>
                {view === 0 ? (
                  <Tile style={{ padding: 0, overflow: "hidden" }}>
                     <DataTable rows={tableData} headers={tableHeaders} isSortable>
                        {({
                          rows,
                          headers,
                          getHeaderProps,
                          getRowProps,
                          getTableProps,
                          onInputChange,
                          getExpandHeaderProps, 
                        }) => (
                          <TableContainer>
                             <div className="assets-table-toolbar" style={{ padding: "0 1rem 1rem 1rem", backgroundColor: "#ffffff" }}>
                                <Grid>
                                  <Column lg={16} md={8} sm={4}>
                                    <h4 style={{ marginBottom: "1rem" }}>Assets</h4>
                                  </Column>
                                  <Column lg={8} md={4} sm={4}>
                                    <div style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#525252" }}>Search Assets</div>
                                    <Search
                                      id="assets-search-input"
                                      labelText="Search Assets"
                                      placeholder="Search by name, cluster, or provider"
                                      onChange={(e) => {
                                        if (typeof onInputChange === 'function') {
                                           onInputChange(e);
                                        }
                                      }}
                                    />
                                  </Column>
                                  <Column lg={4} md={2} sm={4}>
                                     <div style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#525252" }}>Filter by Type</div>
                                     <Dropdown
                                       id="filter-by-type"
                                       label="All Types"
                                       items={aggregateOptions} 
                                       itemToString={(item) => (item ? item.label : "")}
                                       titleText=""
                                       style={{ width: "100%" }}
                                     />
                                  </Column>
                                  <Column lg={4} md={2} sm={4}>
                                     <div style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#525252" }}>Sort by</div>
                                     <Dropdown
                                       id="sort-by"
                                       label="Cost (High to Low)"
                                       items={[{id: 'cost-desc', label: 'Cost (High to Low)'}, {id: 'cost-asc', label: 'Cost (Low to High)'}]}
                                       itemToString={(item) => (item ? item.label : "")}
                                       titleText=""
                                       style={{ width: "100%" }}
                                     />
                                  </Column>
                                </Grid>
                             </div>
                             <Table {...getTableProps()}>
                                <TableHead>
                                   <TableRow>
                                      {headers.map((header) => {
                                         const { key, ...headerProps } = getHeaderProps({ header });
                                         return (
                                            <TableHeader key={key} {...headerProps}>
                                               {header.header}
                                            </TableHeader>
                                         );
                                      })}
                                      <TableExpandHeader {...getExpandHeaderProps()} />
                                   </TableRow>
                                </TableHead>
                                <TableBody>
                                   {rows.map((row) => {
                                      // Find the data object to access 'details'
                                      const rowData = tableData.find(item => item.id === row.id);
                                      const details = rowData ? rowData.details : null;
                                      
                                      const { key, ...rowProps } = getRowProps({ row });
                                      const isExpanded = row.isExpanded;
                                      
                                      return (
                                         <React.Fragment key={key}>
                                           <TableRow {...rowProps} onClick={undefined}>
                                              {row.cells.map((cell) => (
                                                 <TableCell key={cell.id}>
                                                     {cell.info.header === "type" ? (
                                                       <Tag type={
                                                         cell.value === "Node" ? "blue" :
                                                         cell.value === "Disk" ? "cyan" :
                                                         cell.value === "LoadBalancer" ? "green" :
                                                         cell.value === "Network" ? "warm-gray" : "purple"
                                                       }>{cell.value}</Tag>
                                                     ) : cell.value}
                                                 </TableCell>
                                              ))}
                                              <TableCell className="cds--table-column-menu">
                                                  <button 
                                                    className="cds--btn--icon-only" 
                                                    style={{ 
                                                        background: 'transparent', 
                                                        border: 'none', 
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#161616',  // Dark chevron for white theme
                                                        margin: '0 auto'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click interaction if any
                                                        rowProps.onExpand(e);
                                                    }}
                                                  >
                                                      <div style={{ 
                                                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                                                          transition: 'transform 0.2s ease',
                                                          display: 'flex'
                                                      }}>
                                                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                              <path d="M8 11L3 6L3.7 5.3L8 9.6L12.3 5.3L13 6L8 11Z" />
                                                          </svg>
                                                      </div>
                                                  </button>
                                              </TableCell>
                                           </TableRow>
                                           {isExpanded && details && (
                                              <TableExpandedRow colSpan={headers.length + 1}>
                                                 <div className="expanded-row-content" style={{ padding: "1rem", backgroundColor: "#f4f4f4", color: "#161616" }}>
                                                    <Grid>
                                                       <Column lg={5} md={2} sm={4}>
                                                          <h6 style={{ marginBottom: "1rem", fontWeight: "600" }}>Cost Breakdown</h6>
                                                          {details.costBreakdown.map((item, i) => (
                                                             <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                                <span style={{ color: "#525252" }}>{item.label}</span>
                                                                <span style={{ fontWeight: "600" }}>{item.value}</span>
                                                             </div>
                                                          ))}
                                                       </Column>
                                                       <Column lg={5} md={2} sm={4}>
                                                          <h6 style={{ marginBottom: "1rem", fontWeight: "600" }}>Properties</h6>
                                                          {details.properties.map((item, i) => (
                                                             <div key={i} style={{ marginBottom: "0.75rem" }}>
                                                                <div style={{ color: "#525252", fontSize: "0.75rem" }}>{item.label}:</div>
                                                                <div>{item.value}</div>
                                                             </div>
                                                          ))}
                                                       </Column>
                                                       <Column lg={6} md={4} sm={4}>
                                                          <h6 style={{ marginBottom: "1rem", fontWeight: "600" }}>Labels</h6>
                                                           {details.labels.map((item, i) => (
                                                             <div key={i} style={{ marginBottom: "0.75rem" }}>
                                                                <div style={{ color: "#525252", fontSize: "0.75rem" }}>{item.key}:</div>
                                                                <div>{item.value}</div>
                                                             </div>
                                                          ))}
                                                       </Column>
                                                    </Grid>
                                                    <div style={{ width: "100%", borderTop: "1px solid #e0e0e0", marginTop: "1rem", paddingTop: "1rem", fontSize: "0.75rem", color: "#525252" }}>
                                                       {details.timeRange}
                                                    </div>
                                                 </div>
                                              </TableExpandedRow>
                                           )}
                                         </React.Fragment>
                                      );
                                   })}
                                </TableBody>
                             </Table>
                          </TableContainer>
                        )}
                     </DataTable>
                     <Pagination
                        totalItems={tableData.length}
                        pageSize={10}
                        pageSizes={[10, 20, 50]}
                        onChange={({ page, pageSize }) => console.log(`Page: ${page}, PageSize: ${pageSize}`)}
                     />
                  </Tile>
                ) : (
                  <Tile style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <h3>Tree Map Visualization (Placeholder)</h3>
                  </Tile>
                )}
               </Column>
            </Grid>
          </section>
        </div>
      </Theme>
    </Page>
  );
};

export default Assets;
