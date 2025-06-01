import React from 'react'
import { makeStyles } from '@material-ui/styles'
import EditControl from './Edit'
import DownloadControl from './Download'

const Controls = ({
  windowOptions,
  window,
  setWindow,
  aggregationOptions,
  aggregateBy,
  setAggregateBy,
  accumulateOptions,
  accumulate,
  setAccumulate,
  title,
  cumulativeData,
  currency,
  currencyOptions,
  setCurrency,
  conversionRate,
  setConversionRate,
}) => {

  return (
    <div>
      <EditControl
        windowOptions={windowOptions}
        window={window}
        setWindow={setWindow}
        aggregationOptions={aggregationOptions}
        aggregateBy={aggregateBy}
        setAggregateBy={setAggregateBy}
        accumulateOptions={accumulateOptions}
        accumulate={accumulate}
        setAccumulate={setAccumulate}
        currency={currency}
        currencyOptions={currencyOptions}
        setCurrency={setCurrency}
        conversionRate={conversionRate}
        setConversionRate={setConversionRate}
      />

      <DownloadControl
        cumulativeData={cumulativeData}
        title={title}
      />
    </div>
  )
}

export default React.memo(Controls)
