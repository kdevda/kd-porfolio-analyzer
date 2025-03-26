
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvestmentFormData, StockInfo } from "@/types";
import BlurBackground from "./ui/BlurBackground";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchStocks } from "@/lib/api";

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => void;
  isLoading: boolean;
  initialData?: InvestmentFormData | null;
}

const InvestmentForm = ({ onSubmit, isLoading, initialData }: InvestmentFormProps) => {
  const [formData, setFormData] = useState<InvestmentFormData>({
    symbol: "",
    startDate: "",
    endDate: "",
    frequency: "monthly",
    amount: 0,
  });
  const [open, setOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [stockSearchResults, setStockSearchResults] = useState<StockInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string | number }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFrequencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, frequency: value as "daily" | "weekly" | "monthly" }));
  };

  const handleStockSelect = (symbol: string) => {
    setFormData((prev) => ({ ...prev, symbol }));
    setOpen(false);
  };

  const handleStockSearch = async (query: string) => {
    setStockSearchQuery(query);
    
    if (query.length < 2) {
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchStocks(query);
      setStockSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Error searching stocks:", error);
      setStockSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Generate today's date for max value in date inputs
  const today = new Date().toISOString().split("T")[0];

  // Set default dates if not provided
  useEffect(() => {
    if (!formData.endDate) {
      setFormData((prev) => ({ ...prev, endDate: today }));
    }
    
    if (!formData.startDate) {
      // Default to 1 year ago
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      setFormData((prev) => ({ 
        ...prev, 
        startDate: oneYearAgo.toISOString().split("T")[0] 
      }));
    }
  }, []);

  // Popular stocks and indices for quick selection
  const popularStocks = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    // ETFs and Indices
    { symbol: "SPY", name: "SPDR S&P 500 ETF Trust" },
    { symbol: "QQQ", name: "Invesco QQQ Trust" },
    { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
    { symbol: "VTI", name: "Vanguard Total Stock Market ETF" },
    { symbol: "IWM", name: "iShares Russell 2000 ETF" },
    { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF" },
    { symbol: "XLF", name: "Financial Select Sector SPDR Fund" },
    { symbol: "XLE", name: "Energy Select Sector SPDR Fund" },
    { symbol: "XLK", name: "Technology Select Sector SPDR Fund" },
    // Additional popular stocks
    { symbol: "BRK.B", name: "Berkshire Hathaway Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "PG", name: "Procter & Gamble Co." },
    { symbol: "UNH", name: "UnitedHealth Group Inc." },
    { symbol: "HD", name: "Home Depot Inc." },
    { symbol: "BAC", name: "Bank of America Corp." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "DIS", name: "Walt Disney Co." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "VZ", name: "Verizon Communications Inc." },
    { symbol: "KO", name: "Coca-Cola Co." },
    { symbol: "PFE", name: "Pfizer Inc." },
    // International indices
    { symbol: "EFA", name: "iShares MSCI EAFE ETF" },
    { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF" },
    { symbol: "FXI", name: "iShares China Large-Cap ETF" },
    { symbol: "EWJ", name: "iShares MSCI Japan ETF" },
    { symbol: "EWG", name: "iShares MSCI Germany ETF" },
    { symbol: "EWU", name: "iShares MSCI United Kingdom ETF" }
  ];

  return (
    <BlurBackground className="p-6 animate-fade-in max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-gray-800">Investment Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between text-left font-normal bg-white hover:bg-gray-100 text-gray-800 border-gray-300"
                  >
                    {formData.symbol
                      ? stockSearchResults.find((stock) => stock.symbol === formData.symbol)?.symbol || formData.symbol
                      : "Select stock..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        value={stockSearchQuery}
                        onChange={(e) => handleStockSearch(e.target.value)}
                        placeholder="Search stock or index..."
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <CommandList>
                      <CommandEmpty>
                        {isSearching ? "Searching..." : "No stocks found."}
                      </CommandEmpty>
                      
                      {stockSearchResults && stockSearchResults.length > 0 ? (
                        <CommandGroup heading="Search Results">
                          {stockSearchResults.map((stock) => (
                            <CommandItem
                              key={stock.symbol}
                              value={stock.symbol}
                              onSelect={() => handleStockSelect(stock.symbol)}
                              className="data-[selected=true]:bg-gray-800 data-[selected=true]:text-white hover:bg-gray-800 hover:text-white"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.symbol === stock.symbol ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium">{stock.symbol}</span>
                              <span className="ml-2 text-gray-500 text-xs">{stock.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandGroup heading="Popular Stocks & Indexes">
                          {popularStocks.map((stock) => (
                            <CommandItem
                              key={stock.symbol}
                              value={stock.symbol}
                              onSelect={() => handleStockSelect(stock.symbol)}
                              className="data-[selected=true]:bg-gray-800 data-[selected=true]:text-white hover:bg-gray-800 hover:text-white"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.symbol === stock.symbol ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium">{stock.symbol}</span>
                              <span className="ml-2 text-gray-500 text-xs">{stock.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="1"
                placeholder="1000"
                value={formData.amount || ""}
                onChange={(e) => handleChange({ name: "amount", value: Number(e.target.value) })}
                required
                className="transition-all duration-300 focus:ring-gray-800 focus:border-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                max={formData.endDate || today}
                value={formData.startDate}
                onChange={handleChange}
                required
                className="transition-all duration-300 focus:ring-gray-800 focus:border-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                min={formData.startDate}
                max={today}
                value={formData.endDate}
                onChange={handleChange}
                required
                className="transition-all duration-300 focus:ring-gray-800 focus:border-gray-800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Investment Frequency</Label>
              <Select 
                value={formData.frequency} 
                onValueChange={handleFrequencyChange}
              >
                <SelectTrigger id="frequency" className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white transition-all"
          disabled={isLoading || !formData.symbol}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            "Calculate Portfolio Performance"
          )}
        </Button>
      </form>
    </BlurBackground>
  );
};

export default InvestmentForm;
