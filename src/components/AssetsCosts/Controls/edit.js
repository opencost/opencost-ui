import React from "react";
import SelectWindow from "../../SelectWindow";

function EditControl({windowOptions,window,setWindow,useSample}) {
    return <>
      <div style={{ display: "inline-flex" }}>
          <SelectWindow
            windowOptions={windowOptions}
            window={window}
                setWindow={setWindow}
                useSample={useSample}
            />

        </div>
    </>


}

export default EditControl