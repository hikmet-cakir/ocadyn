export interface SavingsDataPoint {
  month: string;
  savings: number;
}

export const mockSavingsChart: SavingsDataPoint[] = [
  { month: 'Jan', savings: 42 },
  { month: 'Feb', savings: 68 },
  { month: 'Mar', savings: 55 },
  { month: 'Apr', savings: 91 },
  { month: 'May', savings: 74 },
  { month: 'Jun', savings: 120 },
];

export const mockReportSummary = {
  averageSavings: 84.5,
  totalNotifications: 128,
  mostTrackedMarketplace: 'Amazon',
  alertSuccessRate: 92,
};
