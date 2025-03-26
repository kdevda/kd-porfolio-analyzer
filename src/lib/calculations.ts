
import { InvestmentFormData, InvestmentSchedule, PortfolioPerformance, StockData } from "@/types";

// Generate investment schedule based on form data and stock data
export const generateInvestmentSchedule = (
  formData: InvestmentFormData,
  stockData: StockData[]
): InvestmentSchedule[] => {
  const { startDate, endDate, frequency, amount, reinvestDividends } = formData;
  const schedule: InvestmentSchedule[] = [];
  let totalShares = 0;
  let totalInvested = 0;
  let cumulativeDividends = 0;
  
  // Create a map of dates to prices and dividends for quick lookup
  const dataMap = new Map<string, { price: number, dividend?: number }>();
  stockData.forEach(data => {
    dataMap.set(data.date, { 
      price: data.price,
      dividend: data.dividend || 0
    });
  });
  
  // Generate investment dates based on frequency
  const investmentDates = getInvestmentDates(startDate, endDate, frequency);
  
  // Fill the schedule
  investmentDates.forEach(date => {
    const data = dataMap.get(date);
    
    // Skip if no price data for this date
    if (!data || !data.price) return;
    
    const price = data.price;
    const dividend = data.dividend || 0;
    
    // Calculate dividend amount based on current shares
    const dividendAmount = totalShares * dividend;
    cumulativeDividends += dividendAmount;
    
    // Determine amount to invest (include reinvested dividends if enabled)
    let investmentAmount = amount;
    if (reinvestDividends && dividendAmount > 0) {
      investmentAmount += dividendAmount;
    }
    
    // Calculate shares purchased (round to 6 decimal places for accuracy)
    const sharesPurchased = parseFloat((investmentAmount / price).toFixed(6));
    totalShares += sharesPurchased;
    totalInvested += amount; // We only count the regular investment in totalInvested
    const currentValue = parseFloat((totalShares * price).toFixed(2));
    
    schedule.push({
      date,
      amount: investmentAmount,
      sharesPurchased,
      price,
      totalShares,
      totalInvested,
      currentValue,
      dividend,
      cumulativeDividends
    });
  });
  
  return schedule;
};

// Calculate overall portfolio performance
export const calculatePerformance = (
  schedule: InvestmentSchedule[]
): PortfolioPerformance => {
  if (schedule.length === 0) {
    return {
      totalInvested: 0,
      finalValue: 0,
      totalReturn: 0,
      percentageReturn: 0,
      annualizedReturn: 0,
      dividendsReceived: 0
    };
  }
  
  const totalInvested = schedule[schedule.length - 1].totalInvested;
  const finalValue = schedule[schedule.length - 1].currentValue;
  const dividendsReceived = schedule[schedule.length - 1].cumulativeDividends || 0;
  
  // Total return includes dividends whether they were reinvested or not
  const totalReturn = parseFloat((finalValue - totalInvested).toFixed(2));
  const percentageReturn = parseFloat(((totalReturn / totalInvested) * 100).toFixed(2));
  
  // Calculate annualized return
  const firstDate = new Date(schedule[0].date);
  const lastDate = new Date(schedule[schedule.length - 1].date);
  const yearsElapsed = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // Use CAGR formula: (final/initial)^(1/years) - 1
  let annualizedReturn = 0;
  if (yearsElapsed > 0) {
    annualizedReturn = parseFloat(((Math.pow(finalValue / totalInvested, 1 / yearsElapsed) - 1) * 100).toFixed(2));
  } else {
    annualizedReturn = percentageReturn;
  }
  
  return {
    totalInvested,
    finalValue,
    totalReturn,
    percentageReturn,
    annualizedReturn,
    dividendsReceived
  };
};

// Helper function to generate investment dates based on frequency
function getInvestmentDates(
  startDate: string,
  endDate: string,
  frequency: "daily" | "weekly" | "monthly"
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Adjust to market days (Mon-Fri)
  const currentDate = new Date(start);
  if (currentDate.getDay() === 0) { // Sunday
    currentDate.setDate(currentDate.getDate() + 1);
  } else if (currentDate.getDay() === 6) { // Saturday
    currentDate.setDate(currentDate.getDate() + 2);
  }
  
  while (currentDate <= end) {
    const isWeekday = currentDate.getDay() > 0 && currentDate.getDay() < 6;
    
    if (isWeekday) {
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    
    // Move to next date based on frequency
    switch (frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
    
    // Adjust for weekends if necessary
    if (frequency !== "daily") {
      if (currentDate.getDay() === 0) { // Sunday
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (currentDate.getDay() === 6) { // Saturday
        currentDate.setDate(currentDate.getDate() + 2);
      }
    }
  }
  
  return dates;
};

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format percentage values
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

// Format large numbers with abbreviations
export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
};
