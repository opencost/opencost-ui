import React from "react";
import EditControl from "../../AssetsCosts/Controls/edit";

function Controls({  windowOptions , window, setWindow , useSample}) {
    return (
        <EditControl
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
        useSample={useSample}    
        ></EditControl>
    )
}

export default Controls