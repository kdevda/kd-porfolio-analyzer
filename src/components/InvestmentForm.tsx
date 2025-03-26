
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvestmentFormData } from "@/types";
import BlurBackground from "./ui/BlurBackground";

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => void;
  isLoading: boolean;
  initialData?: InvestmentFormData | null;
}

const InvestmentForm = ({ onSubmit, isLoading, initialData }: InvestmentFormProps) => {
  const [formData, setFormData] = React.useState<InvestmentFormData>({
    symbol: "",
    startDate: "",
    endDate: "",
    frequency: "monthly",
    amount: 0,
  });

  // Initialize form with initialData if provided
  React.useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Generate today's date for max value in date inputs
  const today = new Date().toISOString().split("T")[0];

  // Set default dates if not provided
  React.useEffect(() => {
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

  return (
    <BlurBackground className="p-6 animate-fade-in max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-gray-800">Investment Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="AAPL"
                value={formData.symbol}
                onChange={handleChange}
                required
                className="transition-all duration-300 focus:ring-gray-800 focus:border-gray-800"
              />
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
          disabled={isLoading}
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
