
import { StockData, StockInfo } from "@/types";
import { toast } from "@/hooks/use-toast";

// Yahoo Finance API endpoint
const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";

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
    const url = `${BASE_URL}${symbol}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d&includePrePost=false&events=div`;
    
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
    
    // Get dividend data if available
    const events = result.events || {};
    const dividends = events.dividends || {};
    
    if (!timestamps || !quotes || !quotes.open) {
      throw new Error("Missing timestamp or price data");
    }
    
    // Process the data - using OPEN prices now instead of close
    const stockData: StockData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.open[i] !== null) {
        const date = new Date(timestamps[i] * 1000);
        const dateStr = date.toISOString().split("T")[0];
        
        stockData.push({
          date: dateStr,
          price: parseFloat(quotes.open[i].toFixed(2)),
          dividend: 0 // Default to 0, will add dividends later
        });
      }
    }
    
    // Add dividends to the corresponding dates
    Object.keys(dividends).forEach(timestamp => {
      const divDate = new Date(parseInt(timestamp) * 1000).toISOString().split("T")[0];
      const stockDataIndex = stockData.findIndex(item => item.date === divDate);
      
      if (stockDataIndex !== -1) {
        stockData[stockDataIndex].dividend = parseFloat(dividends[timestamp].amount.toFixed(4));
      }
    });
    
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

export const searchStocks = async (query: string): Promise<StockInfo[]> => {
  try {
    if (!query || query.length < 2) return [];
    
    const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.quotes || !Array.isArray(data.quotes)) {
      return [];
    }
    
    return data.quotes
      .filter((quote: any) => quote.symbol && quote.shortname)
      .map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || "",
        exchange: quote.exchange || ""
      }));
  } catch (error) {
    console.error("Error searching stocks:", error);
    return getPopularStocks(query);
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
    
    // Add a dividend every quarter (roughly)
    const dividend = (date.getMonth() % 3 === 0 && date.getDate() < 7) 
      ? price * 0.005 * (Math.random() + 0.5) 
      : 0;
    
    data.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
      dividend: parseFloat(dividend.toFixed(4))
    });
  }
  
  return data;
};

// Fallback function for stock search
const getPopularStocks = (query: string): StockInfo[] => {
  const stocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "FB", name: "Meta Platforms, Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "MA", name: "Mastercard Incorporated" },
    { symbol: "UNH", name: "UnitedHealth Group Incorporated" },
    { symbol: "HD", name: "The Home Depot, Inc." },
    { symbol: "BAC", name: "Bank of America Corporation" },
    { symbol: "DIS", name: "The Walt Disney Company" },
    { symbol: "PYPL", name: "PayPal Holdings, Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "PFE", name: "Pfizer Inc." }
  ];
  
  return stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
    stock.name.toLowerCase().includes(query.toLowerCase())
  );
};
