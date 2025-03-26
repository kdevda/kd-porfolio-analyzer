
export interface StockData {
  date: string;
  price: number;
  dividend?: number;
}

export interface InvestmentSchedule {
  date: string;
  amount: number;
  sharesPurchased: number;
  price: number;
  totalShares: number;
  totalInvested: number;
  currentValue: number;
  dividend?: number;
  cumulativeDividends?: number;
}

export interface PortfolioPerformance {
  totalInvested: number;
  finalValue: number;
  totalReturn: number;
  percentageReturn: number;
  annualizedReturn: number;
  dividendsReceived: number;
}

export interface InvestmentFormData {
  symbol: string;
  startDate: string;
  endDate: string;
  frequency: "daily" | "weekly" | "monthly";
  amount: number;
  reinvestDividends?: boolean;
}

export interface RouteParams {
  formData?: InvestmentFormData;
  schedule?: InvestmentSchedule[];
  performance?: PortfolioPerformance;
}

export interface StockInfo {
  symbol: string;
  name: string;
  exchange?: string;
  logo?: string;
}
