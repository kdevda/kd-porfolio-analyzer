
import React, { useState } from "react";
import { InvestmentFormData, InvestmentSchedule, PortfolioPerformance, StockData } from "@/types";
import InvestmentForm from "@/components/InvestmentForm";
import PortfolioChart from "@/components/PortfolioChart";
import InvestmentTable from "@/components/InvestmentTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { fetchStockData } from "@/lib/api";
import { calculatePerformance, generateInvestmentSchedule } from "@/lib/calculations";
import { toast } from "@/hooks/use-toast";
import BlurBackground from "@/components/ui/BlurBackground";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [schedule, setSchedule] = useState<InvestmentSchedule[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [formData, setFormData] = useState<InvestmentFormData | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleFormSubmit = async (data: InvestmentFormData) => {
    try {
      setIsLoading(true);
      setFormData(data);
      
      // 1. Fetch stock data
      const fetchedData = await fetchStockData(
        data.symbol,
        data.startDate,
        data.endDate
      );
      setStockData(fetchedData);
      
      // 2. Generate investment schedule
      const investmentSchedule = generateInvestmentSchedule(data, fetchedData);
      setSchedule(investmentSchedule);
      
      // 3. Calculate performance metrics
      const performanceMetrics = calculatePerformance(investmentSchedule);
      setPerformance(performanceMetrics);
      
      setHasResults(true);
      toast({
        title: "Analysis Complete",
        description: "Your portfolio analysis is ready.",
      });
    } catch (error) {
      console.error("Error analyzing portfolio:", error);
      toast({
        title: "Analysis Error",
        description: "There was an error analyzing your portfolio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Portfolio Analyzer</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Analyze investment performance with dollar-cost averaging. Enter your investment details below to see how your portfolio would have performed over time.
          </p>
        </div>
        
        <div className="mb-10">
          <InvestmentForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-20 animate-pulse-slow">
            <BlurBackground className="p-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-portfolio-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Analyzing Portfolio</h3>
                <p className="text-gray-600">
                  Fetching historical data for {formData?.symbol}...
                </p>
              </div>
            </BlurBackground>
          </div>
        )}
        
        {hasResults && !isLoading && (
          <div className="space-y-8 animate-slide-up">
            {performance && formData && (
              <PerformanceMetrics 
                performance={performance} 
                stockSymbol={formData.symbol} 
              />
            )}
            
            {schedule.length > 0 && (
              <PortfolioChart data={schedule} />
            )}
            
            {schedule.length > 0 && (
              <InvestmentTable data={schedule} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
