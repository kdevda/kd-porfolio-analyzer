
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KD Portfolio Analyzer</h1>
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
        
        <div className={`mt-8 grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 gap-6'}`}>
          <div className="h-fit">
            {schedule.length > 0 && (
              <InvestmentTable data={schedule} />
            )}
          </div>
          
          <div className="h-fit">
            {schedule.length > 0 && (
              <PortfolioChart data={schedule} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
