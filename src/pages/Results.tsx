
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InvestmentFormData, InvestmentSchedule, PortfolioPerformance } from "@/types";
import PortfolioChart from "@/components/PortfolioChart";
import InvestmentTable from "@/components/InvestmentTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get data from route state
  const { formData, schedule, performance } = location.state || {};
  
  // If no data, redirect to home
  React.useEffect(() => {
    if (!formData || !schedule || !performance) {
      navigate("/");
    }
  }, [formData, schedule, performance, navigate]);
  
  const handleBack = () => {
    navigate("/", { state: { previousFormData: formData } });
  };
  
  if (!formData || !schedule || !performance) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KD's Portfolio Analyzer</h1>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
        
        {performance && formData && (
          <PerformanceMetrics 
            performance={performance} 
            stockSymbol={formData.symbol} 
          />
        )}
        
        <div className={`mt-8 ${isMobile ? 'grid-cols-1 gap-8' : 'grid grid-cols-2 gap-6'}`}>
          {/* Chart on the left */}
          <div className="h-fit mb-8">
            {schedule.length > 0 && (
              <PortfolioChart data={schedule} />
            )}
          </div>
          
          {/* Additional details on the right - placeholder for now */}
          <div className="h-fit mb-8">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
              <div className="space-y-3">
                <p className="text-gray-600">
                  Stock: <span className="font-medium text-gray-800">{formData.symbol}</span>
                </p>
                <p className="text-gray-600">
                  Investment Period: <span className="font-medium text-gray-800">
                    {new Date(formData.startDate).toLocaleDateString()} to {new Date(formData.endDate).toLocaleDateString()}
                  </span>
                </p>
                <p className="text-gray-600">
                  Frequency: <span className="font-medium text-gray-800">{formData.frequency}</span>
                </p>
                <p className="text-gray-600">
                  Amount per Investment: <span className="font-medium text-gray-800">
                    ${formData.amount.toLocaleString()}
                  </span>
                </p>
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-2">Investment Strategy</h3>
                  <p className="text-sm text-gray-600">
                    Your dollar-cost averaging strategy has you investing ${formData.amount.toLocaleString()} 
                    {formData.frequency === "daily" ? " daily" : 
                     formData.frequency === "weekly" ? " weekly" : " monthly"} 
                    in {formData.symbol} over the selected period. This approach helps reduce the impact of 
                    market volatility on your investment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Investment table spanning full width */}
        <div className="mt-4 mb-12">
          {schedule.length > 0 && (
            <InvestmentTable data={schedule} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
