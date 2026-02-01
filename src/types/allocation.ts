/**
 * Type definitions for allocation data used across the application
 */

export interface AllocationData {
  name: string;
  cpuCost: number;
  gpuCost: number;
  ramCost: number;
  pvCost: number;
  networkCost: number;
  sharedCost: number;
  externalCost: number;
  totalCost: number;
  cpuEfficiency?: number;
  ramEfficiency?: number;
  totalEfficiency?: number;
}

export interface AllocationFilter {
  property: string;
  value: string;
}

export interface AllocationTotals {
  cpuCost: number;
  gpuCost: number;
  ramCost: number;
  pvCost: number;
  networkCost: number;
  sharedCost: number;
  externalCost: number;
  totalCost: number;
  cpuEfficiency: number;
  ramEfficiency: number;
  totalEfficiency: number;
}
