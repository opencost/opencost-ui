import React from 'react';
import { Button, TextInput, Grid, Column } from '@carbon/react';

const CarbonTestComponent = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Carbon Design System Test</h2>

      <Grid>
        <Column sm={4} md={8} lg={16}>
          <TextInput
            id="test-input"
            labelText="Test Input"
            placeholder="Type something..."
          />
        </Column>
      </Grid>

      <div style={{ marginTop: '20px' }}>
        <Button kind="primary">Primary Button</Button>
        <Button kind="secondary" style={{ marginLeft: '10px' }}>Secondary Button</Button>
      </div>
    </div>
  );
};

export default CarbonTestComponent;