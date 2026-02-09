import * as React from "react";
import Page from "../components/Page";
import Header from "../components/Header";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssetsCostsService from "../services/assetsCosts.js";
import {SampleAssetsData} from "../services/assets.mock.js";
import { useLocation, useNavigate } from "react-router";
import Warnings from "../components/Warnings";
import Typography from "@mui/material/Typography";
import { find, get, sortBy, toArray } from "lodash";
import Controls from "../components/AssetsCosts/Controls";
import {
  checkCustomWindow,
 toVerboseTimeRange,
} from "../util";
import CircularProgress from "@mui/material/CircularProgress";
import ChartsMain from "../components/AssetsCosts/Charts/main.js";
//choosing dates not the manual date picking here 
const windowOptions = [
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "Last 24h", value: "24h" },
  { name: "Last 48h", value: "48h" },
  { name: "Week-to-date", value: "week" },
  { name: "Last week", value: "lastweek" },
  { name: "Last 7 days", value: "7d" },
  { name: "Last 14 days", value: "14d" },
];
const aggregationOptions = [
  { name: "Cloud", value: "cloud" },
  { name: "Disk", value: "disk" },
  { name: "Loadbalancer", value: "loadbalancer" },
  { name: "Network", value: "network" },
  { name: "Node", value: "node" },
  { name: "Shared", value: "shared" },
  { name: "ClusterManagement", value: "clustermanagement" },
];

// generateTitle generates a string title from a report object
function generateTitle({ window, aggregateBy }) {
  let windowName = get(find(windowOptions, { value: window }), "name", "");
  if (windowName === "") {
    if (checkCustomWindow(window)) {
      windowName = toVerboseTimeRange(window);
    } else {
      console.warn(`unknown window: ${window}`);
    }
  }

  let aggregationName = get(
    find(aggregationOptions, { value: aggregateBy }),
    "name",
    "",
  ).toLowerCase();
  if (aggregateBy !== "" && aggregationName === "") {
  console.warn(`unknown aggregation: ${aggregateBy}`);
   }

   let str = aggregationName
  ? `${windowName} by ${aggregationName}`
  : windowName;

  

  return str;
}
//used for calculation(data based on the choosen time) of sample data when the real data is not available
function calculatingWindow(dataObj, win) {
  if (!dataObj) return [];

  // 1. Object → Array
  const data = Object.values(dataObj);

  const now = new Date();

  // Normalize "today" to midnight
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let from = null;
  let to = now;

  switch (win) {
    case "today":
      from = todayStart;
      break;

    case "yesterday": {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);

      from = y;
      to = todayStart;
      break;
    }

    case "24h":
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;

    case "48h":
      from = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      break;

    case "week": { // Week-to-date (Mon → now)
      const day = todayStart.getDay(); // 0 = Sun
      const diff = day === 0 ? 6 : day - 1;

      from = new Date(todayStart);
      from.setDate(from.getDate() - diff);
      break;
    }

    case "lastweek": { // Previous Mon → Sun
      const day = todayStart.getDay();
      const diff = day === 0 ? 6 : day - 1;

      const thisWeekStart = new Date(todayStart);
      thisWeekStart.setDate(thisWeekStart.getDate() - diff);

      to = thisWeekStart;

      from = new Date(to);
      from.setDate(from.getDate() - 7);
      break;
    }

    case "7d":
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;

    case "14d":
      from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;

    default:
      return data; // No filter
  }

  // 2. Filter by start date
  return data.filter(item => {
    if (!item.start) return false;

    const start = new Date(item.start);

    return start >= from && start <= to;
  });
}

export default function AssetsCosts() {
    // data
    const [assetCostData, setAssetCostData] = React.useState(null);
  //the below state is used for keep track whether to use sample data or not
   const [useSample , setUseSample] = React.useState(false)
    //page and settings state
    const [errors, setErrors] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
     const [init, setInit] = React.useState(false);
  const [fetch, setFetch] = React.useState(false);
  //we are using the below state to check we are working with the network data or the sample data
    const [check2, setCheck2] = React.useState(false);

    
    //this below function is used to make everything ready before fetching up the data
    async function initialize() {
    setInit(true);
  }

    
  //this below function is going to assetCost.js file , where we are going to make the client request
  
  async function fetchChartData() {
    //when the user wants to work on the sample data dont even touch anything like going into the network
    if (useSample) {
      var calculatedSampleData = calculatingWindow(SampleAssetsData, win)
      // console.log(calculatedSampleData)
       setLoading(false); 
      setAssetCostData(calculatedSampleData)
      
          return
       }
    try {
          // console.log("hello i am inside the request")
          setLoading(true)
          const resp = await AssetsCostsService.fetchAssetsGraphCosts(   
          );
      if (resp) {
            setCheck2(true)
              setAssetCostData(Object.values(resp.data));
              // console.log(Object.values(resp.data)) //returns an object
          } else {
            if (resp.message && resp.message.indexOf("boundary error") >= 0) {
              let match = resp.message.match(/(ETL is \d+\.\d+% complete)/);
              let secondary = "Try again after ETL build is complete";
              if (match.length > 0) {
                secondary = `${match[1]}. ${secondary}`;
              }
              setErrors([
                {
                  primary: "Data unavailable while ETL is building",
                  secondary: secondary,
                },
              ]);
            }
            setAssetCostData([]);
          }
        } catch (err) {
          console.log(err);
          if (err.message.indexOf("404") === 0) {
            setErrors([
              {
                primary: "Failed to load report data",
                secondary:
                  "Please update OpenCost to the latest version, and open an Issue if problems persist.",
              },
            ]);
          } else {
            let secondary =
              "Please open an Issue with OpenCost if problems persist.";
            if (err.message.length > 0) {
              secondary = err.message;
            }
            setErrors([
              {
                primary: "Failed to load report data",
                secondary: secondary,
              },
            ]);
          }
          setAssetCostData([]);
    } finally {
         setLoading(false); // always stop loader
        }
    }
    
  //this is where we are goona call the fetchChartData(parent function)
  
     async function fetchData() {
    setLoading(true);
    setErrors([]);
    // todo: come back and have inidividual loading
    await fetchChartData();
    
    setLoading(false);
  }
   
     
    /*
    1.Buttons, dropdows , filters etc get there value from the url
    2.when the user changes something on the page we update the url
    3.if url does not have something we use a default value
    */
  //the below line does give me the current page URL info
  const routerLocation = useLocation();
  //take the part that is after ? and make it something into like an object that i can read (URLSear....-> built in browser tool)
  const searchParams = new URLSearchParams(routerLocation.search); 
  const navigate = useNavigate();
  const win = searchParams.get("window") || "7d";
  const aggregateBy = searchParams.get("agg") || "";
  const title =
      searchParams.get("title") ||
    generateTitle({ window: win, aggregateBy });
  
   var finalData = null
  //the below logic is used for showing the right things ,when we get the data , or when we want to use the sample data 
  var check = false
  
  if (!loading && errors.length == 0 &&   assetCostData != null && !useSample) {
    finalData = assetCostData
    //  we dont want error appearing on our page even if we are working on the real network that is why the below line exist
    check = check2 ? false : true;
    
    // console.log(finalData)
  } else if (!loading && useSample) {
    finalData = calculatingWindow(SampleAssetsData, win)
    check = true
    
    console.log(finalData)
  } else if (!loading && !useSample) {
      finalData = null
    }
    //the below useEffect is used to run 2 request trading between safe/slow
    React.useEffect(() => {
         //the below condition is there to avoid the loop 
        if (!init) {
          initialize();
        }
        if (init || fetch) {
          fetchData();
        }
      }, [init, fetch]);
    
      React.useEffect(() => {
        setFetch(!fetch);
      }, [win]);
  React.useEffect(() => {
  if (!useSample) {
    setAssetCostData(null);   // 🔥 Clear old sample data
    setCheck2(false);
  }
}, [useSample]);

    return (
        <Page>
             <Header headerTitle="Assets Costs">
               {!useSample && <IconButton
               aria-label="refresh"
               onClick={() => fetchData()}
               style={{ padding: 12 }}
               >
               <RefreshIcon />
            </IconButton>}
            </Header>
        
        {/* the below block is only going to execute when we can't get the real data from backend */}
        {!loading && (errors.length > 0 || check || useSample) && (
          <div>
            <div style={{ marginBottom: 20 }}>
                <Warnings warnings={errors} />
              </div>
                <div>
                {  <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                   <input
                     type="checkbox"
                     checked={useSample}
                     onChange={(e) => setUseSample(e.target.checked)}
                />
                   {!useSample ? "Use sample data or (refresh again for the connection)" : "use sample data"}
                  </label>}
            </div>
            
          </div>
               
        )}
        
        {finalData && <div  style={{
    background: 'var(--cds-background)',
    padding: '24px',
  }}>
          <Paper id="assets">
          <div style={{ display: "flex", flexFlow: "row", padding: 24 }}>
             <div style={{ flexGrow: 1 }}>
              <Typography variant="h5">{title}</Typography>
              
            </div>
            {/* we have Controls beautifully controlling the data system irrespective of whether sample or real data */}
            <Controls windowOptions={windowOptions}
              window={win}
            //its because of this funcition the url is getting changed
              //AssetsCosts gives Controls permission to change the URL.
              setWindow={(win) => {
                searchParams.set("window", win);
                navigate({
                  search: `?${searchParams.toString()}`,
                });
              }}
              useSample={useSample}
            ></Controls>
          </div>

          {/* at this point we have all the data based on the window time  */}
           {loading && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ paddingTop: 100, paddingBottom: 100 }}>
                        <CircularProgress />
                      </div>
                    </div>
          )}
          {
          finalData && finalData.length > 0 ? (
             <ChartsMain finalData={finalData} />
               ) : (
            "no data to show here"
             )
}

        </Paper>
        </div>
        }
           
        </Page>
    )
}