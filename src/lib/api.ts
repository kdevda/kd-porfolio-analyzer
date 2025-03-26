
import { StockData } from "@/types";
import { toast } from "@/hooks/use-toast";

// Yahoo Finance API endpoint
const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

export const fetchStockData = async (
  symbol: string,
  startDate: string,
  endDate: string
): Promise<StockData[]> => {
  try {
    console.log(`Fetching data for ${symbol} from ${startDate} to ${endDate}`);
    
    // Convert dates to UNIX timestamps (seconds)
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    
    // Build the Yahoo Finance API URL
    const url = `${BASE_URL}${symbol}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d&includePrePost=false`;
    
    // Set up CORS proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we have valid data
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("Invalid data received from Yahoo Finance");
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    if (!timestamps || !quotes || !quotes.close) {
      throw new Error("Missing timestamp or price data");
    }
    
    // Process the data
    const stockData: StockData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.close[i] !== null) {
        const date = new Date(timestamps[i] * 1000);
        stockData.push({
          date: date.toISOString().split("T")[0],
          price: parseFloat(quotes.close[i].toFixed(2)),
        });
      }
    }
    
    return stockData;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    
    // Fallback to mock data in case of errors (for development)
    toast({
      title: "Error fetching data",
      description: "Using simulated data due to API issues. Please try again later.",
      variant: "destructive",
    });
    
    return generateMockStockData(symbol, startDate, endDate);
  }
};

// Mock data generator (as fallback when API fails)
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
