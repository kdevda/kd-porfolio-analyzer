
export interface StockData {
  date: string;
  price: number;
}

export interface InvestmentSchedule {
  date: string;
  amount: number;
  sharesPurchased: number;
  price: number;
  totalShares: number;
  totalInvested: number;
  currentValue: number;
}

export interface PortfolioPerformance {
  totalInvested: number;
  finalValue: number;
  totalReturn: number;
  percentageReturn: number;
  annualizedReturn: number;
}

export interface InvestmentFormData {
  symbol: string;
  startDate: string;
  endDate: string;
  frequency: "daily" | "weekly" | "monthly";
  amount: number;
}

export interface RouteParams {
  formData?: InvestmentFormData;
  schedule?: InvestmentSchedule[];
  performance?: PortfolioPerformance;
}
