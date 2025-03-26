
import { StockData } from "@/types";
import { toast } from "@/hooks/use-toast";

// Simulated historical data API (would normally be a real API call)
export const fetchStockData = async (
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockData[]> => {
  try {
    // For development purposes, we're simulating an API call
    // In production, this would be replaced with a real backend API call to yfinance
    console.log(`Fetching data for ${symbol} from ${startDate} to ${endDate}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
    
    // Generate mock data for demonstration
    const data = generateMockStockData(symbol, startDate, endDate);
    return data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    toast({
      title: "Error fetching data",
      description: "Could not retrieve stock data. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};

// Mock data generator (for demo purposes)
const generateMockStockData = (
  symbol: string,
  startDate: string,
  endDate: string
): StockData[] => {
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  const data: StockData[] = [];
  
  // Use a seed based on the symbol for consistent but different data per symbol
  const seedValue = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = seedValue / 100;
  
  // Initial price (pseudorandom based on symbol)
  let price = 50 + (seed % 200);
  
  // Generate daily data
  for (let timestamp = startTimestamp; timestamp <= endTimestamp; timestamp += 86400000) {
    // Skip weekends
    const date = new Date(timestamp);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Add some random movement, with slight upward bias
    const change = ((Math.random() - 0.48) * 2) * (price * 0.03);
    price += change;
    price = Math.max(price, 1); // Ensure price doesn't go below 1
    
    data.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  
  return data;
};
