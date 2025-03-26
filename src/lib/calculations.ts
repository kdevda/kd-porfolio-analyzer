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
  
  // Sort stock data by date to ensure chronological order
  const sortedStockData = [...stockData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Create a map of dates to prices and dividends for quick lookup
  const dataMap = new Map<string, { price: number, dividend?: number }>();
  sortedStockData.forEach(data => {
    dataMap.set(data.date, { 
      price: data.price,
      dividend: data.dividend || 0
    });
  });
  
  // Find the first available trading day on or after the start date
  let adjustedStartDate = startDate;
  const startDateTime = new Date(startDate).getTime();
  const availableDates = sortedStockData.map(data => data.date);
  
  // Find the first available date that is on or after the requested start date
  for (const date of availableDates) {
    if (new Date(date).getTime() >= startDateTime) {
      adjustedStartDate = date;
      break;
    }
  }
  
  console.log(`Adjusted start date from ${startDate} to ${adjustedStartDate} due to data availability`);
  
  // Generate investment dates based on frequency
  const investmentDates = getInvestmentDates(adjustedStartDate, endDate, frequency);
  
  // Process regular investments
  const processedDates = new Set<string>();
  for (const date of investmentDates) {
    const data = dataMap.get(date);
    
    // Skip if no price data for this date
    if (!data || !data.price) continue;
    
    processedDates.add(date);
    const price = data.price;
    
    // Calculate shares purchased
    const sharesPurchased = parseFloat((amount / price).toFixed(6));
    totalShares += sharesPurchased;
    totalInvested += amount;
    
    // Update the schedule entry
    const currentValue = parseFloat((totalShares * price).toFixed(2));
    schedule.push({
      date,
      amount,
      sharesPurchased,
      price,
      totalShares,
      totalInvested,
      currentValue,
      dividend: 0,
      cumulativeDividends
    });
  }
  
  // Add dividend entries and process dividend reinvestment separately
  if (sortedStockData.some(data => data.dividend && data.dividend > 0)) {
    const dividendDates = sortedStockData
      .filter(data => data.dividend && data.dividend > 0)
      .map(data => data.date);
    
    // For each dividend date, check if we should add a dividend entry
    for (const date of dividendDates) {
      // Skip dividend dates that are before our first investment or after our last one
      if (new Date(date) < new Date(adjustedStartDate) ||
          new Date(date) > new Date(endDate)) {
        continue;
      }
      
      // Find the latest schedule entry before this dividend date
      const latestEntryBeforeDividend = findLatestEntryBeforeDate(schedule, date);
      if (!latestEntryBeforeDividend) continue;
      
      const data = dataMap.get(date);
      if (!data || !data.price || !data.dividend) continue;
      
      const price = data.price;
      const dividend = data.dividend;
      
      // Calculate dividend amount based on shares owned
      const sharesOwned = latestEntryBeforeDividend.totalShares;
      const dividendAmount = parseFloat((sharesOwned * dividend).toFixed(2));
      
      if (dividendAmount <= 0) continue;
      
      cumulativeDividends += dividendAmount;
      
      // If we already have an entry for this date, update it instead of creating a new one
      if (processedDates.has(date)) {
        const existingEntry = schedule.find(entry => entry.date === date);
        if (existingEntry) {
          existingEntry.dividend = dividend;
          existingEntry.cumulativeDividends = cumulativeDividends;
          
          // If reinvesting dividends, add more shares
          if (reinvestDividends) {
            const additionalShares = parseFloat((dividendAmount / price).toFixed(6));
            existingEntry.sharesPurchased += additionalShares;
            existingEntry.amount += dividendAmount;
            existingEntry.totalShares += additionalShares;
            existingEntry.currentValue = parseFloat((existingEntry.totalShares * price).toFixed(2));
          }
          continue;
        }
      }
      
      // Only create dividend entries if reinvestDividends is enabled
      if (reinvestDividends) {
          const additionalShares = parseFloat((dividendAmount / price).toFixed(6));
          totalShares += additionalShares;
      
          // Fix Total Invested Calculation
          const previousTotalInvested = latestEntryBeforeDividend.totalInvested;
          const entryTotalInvested = previousTotalInvested + dividendAmount;
      
          // Fix Value Calculation
          const correctValue = parseFloat((totalShares * price).toFixed(2));
      
          schedule.push({
              date,
              amount: dividendAmount,
              sharesPurchased: additionalShares,
              price,
              totalShares,
              totalInvested: entryTotalInvested,
              currentValue: correctValue, // Corrected Value Column
              dividend,
              cumulativeDividends
          });
      }
        
        processedDates.add(date);
      }
    }
  }
  
  // Sort the schedule by date
  schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return schedule;
};

// Helper function to find the latest entry before a given date
function findLatestEntryBeforeDate(schedule: InvestmentSchedule[], targetDate: string): InvestmentSchedule | null {
  const targetTime = new Date(targetDate).getTime();
  
  let latestEntry = null;
  let latestTime = 0;
  
  for (const entry of schedule) {
    const entryTime = new Date(entry.date).getTime();
    if (entryTime < targetTime && entryTime > latestTime) {
      latestEntry = entry;
      latestTime = entryTime;
    }
  }
  
  return latestEntry;
}

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
}

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
