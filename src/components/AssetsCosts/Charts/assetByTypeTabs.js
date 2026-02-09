import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@carbon/react";

function AssetsByTypeTabs({ data, aggregationOptions }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
function formatDate(iso) {
  if (!iso) return "-";
  return iso.split("T")[0]; // YYYY-MM-DD
    }
    function filterByType(data, type) {
  if (!Array.isArray(data)) return [];

  return data.filter(item => item.type?.toLowerCase() === type);
}
  return (
    <Tabs>
      <TabList aria-label="Asset types">
        {aggregationOptions.map(opt => (
          <Tab key={opt.value}>{opt.name}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {aggregationOptions.map(opt => {
          const items = filterByType(data, opt.value);

          return (
            <TabPanel key={opt.value}>
              {items.length === 0 ? (
                <p style={{ marginTop: 16, color: "#6f6f6f" }}>
                  No {opt.name} assets for selected window
                </p>
              ) : (
                <ul style={{ marginTop: 16 }}>
                  {items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <strong>{item.properties?.name || "Unnamed asset"}</strong>
                      {" — "}
                      {formatDate(item.start)}
                    </li>
                  ))}
                </ul>
              )}
            </TabPanel>
          );
        })}
      </TabPanels>
    </Tabs>
  );
}

export default AssetsByTypeTabs;
