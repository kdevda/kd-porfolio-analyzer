
import React, { useState, useEffect } from "react";
import { InvestmentFormData } from "@/types";
import InvestmentForm from "@/components/InvestmentForm";
import { fetchStockData } from "@/lib/api";
import { calculatePerformance, generateInvestmentSchedule } from "@/lib/calculations";
import { toast } from "@/hooks/use-toast";
import BlurBackground from "@/components/ui/BlurBackground";
import { useNavigate, useLocation } from "react-router-dom";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get previous form data if returning from results
  const [initialFormData, setInitialFormData] = useState<InvestmentFormData | null>(null);
  
  useEffect(() => {
    if (location.state?.previousFormData) {
      setInitialFormData(location.state.previousFormData);
    }
  }, [location.state]);
  
  const handleFormSubmit = async (data: InvestmentFormData) => {
    try {
      setIsLoading(true);
      
      // 1. Fetch stock data
      const fetchedData = await fetchStockData(
        data.symbol,
        data.startDate,
        data.endDate
      );
      
      if (fetchedData.length === 0) {
        toast({
          title: "No Data Available",
          description: `Could not find data for ${data.symbol} in the selected date range.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // 2. Generate investment schedule
      const investmentSchedule = generateInvestmentSchedule(data, fetchedData);
      
      if (investmentSchedule.length === 0) {
        toast({
          title: "No Investment Dates",
          description: "No valid investment dates found in the selected range.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // 3. Calculate performance metrics
      const performanceMetrics = calculatePerformance(investmentSchedule);
      
      // 4. Navigate to results page with data
      navigate("/results", {
        state: {
          formData: data,
          schedule: investmentSchedule,
          performance: performanceMetrics
        }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">KD Portfolio Analyzer</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Analyze investment performance with dollar-cost averaging. Enter your investment details below to see how your portfolio would have performed over time.
          </p>
        </div>
        
        <div className="mb-10">
          <InvestmentForm 
            onSubmit={handleFormSubmit} 
            isLoading={isLoading} 
            initialData={initialFormData}
          />
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-20 animate-pulse-slow">
            <BlurBackground className="p-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-portfolio-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Analyzing Portfolio</h3>
                <p className="text-gray-600">
                  Fetching historical data for {isLoading ? "your investment" : ""}...
                </p>
              </div>
            </BlurBackground>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
