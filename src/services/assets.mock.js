export const getMockData = () => ({
  data: [
    {
      name: "node-group-1",
      type: "Node",
      properties: {
        providerID: "i-0abc123",
        instanceType: "m5.large",
        region: "us-east-1",
      },
      totalCost: 120.5,
    },
    {
      name: "s3-bucket-logs",
      type: "Cloud",
      properties: { service: "AmazonS3", region: "us-east-1" },
      totalCost: 45.2,
    },
    {
      name: "rds-primary",
      type: "Cloud",
      properties: { service: "AmazonRDS", engine: "postgres" },
      totalCost: 350.0,
    },
  ],
});
