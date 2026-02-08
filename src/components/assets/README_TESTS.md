# Assets Page Tests

Simple unit tests for the Assets page components.

## Running Tests

```bash
npm test
```

## Test Coverage

### AssetsChart.test.js
- Renders chart with cost summary
- Displays "No data available" when data is empty
- Calculates CPU, RAM, and Storage costs correctly

### AssetsTable.test.js
- Renders table with asset data
- Displays "No asset data available" when data is empty

## Test Structure

Tests use:
- **Jest** as the test runner
- **React Testing Library** for component testing
- **@testing-library/jest-dom** for DOM assertions

## Adding More Tests

To add more test cases, follow the existing pattern:

```javascript
test('description of what you are testing', () => {
  render(<YourComponent prop1="value" />);
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```
