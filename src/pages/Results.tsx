import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InvestmentFormData, InvestmentSchedule, PortfolioPerformance } from "@/types";
import PortfolioChart from "@/components/PortfolioChart";
import InvestmentTable from "@/components/InvestmentTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { calculatePerformance, generateInvestmentSchedule, formatCurrency, formatPercentage } from "@/lib/calculations";
import BlurBackground from "@/components/ui/BlurBackground";
import { toast } from "@/hooks/use-toast";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState<InvestmentFormData | null>(null);
  const [schedule, setSchedule] = useState<InvestmentSchedule[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [stockData, setStockData] = useState<any[]>([]);
  const [reinvestDividends, setReinvestDividends] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  useEffect(() => {
    const { formData: initialFormData, schedule: initialSchedule, performance: initialPerformance, stockData: initialStockData } = location.state || {};
    
    if (initialFormData) setFormData({ ...initialFormData, reinvestDividends: false });
    if (initialSchedule) setSchedule(initialSchedule);
    if (initialPerformance) setPerformance(initialPerformance);
    if (initialStockData) setStockData(initialStockData);
    
    if (!initialFormData || !initialSchedule || !initialPerformance) {
      navigate("/");
    }
  }, [location.state, navigate]);
  
  const handleBack = () => {
    navigate("/", { state: { previousFormData: formData } });
  };
  
  const handleReinvestToggle = async (checked: boolean) => {
    if (!formData || !stockData.length) return;
    
    setReinvestDividends(checked);
    setIsRecalculating(true);
    
    try {
      const updatedFormData = {
        ...formData,
        reinvestDividends: checked
      };
      setFormData(updatedFormData);
      
      const updatedSchedule = generateInvestmentSchedule(updatedFormData, stockData);
      setSchedule(updatedSchedule);
      
      const updatedPerformance = calculatePerformance(updatedSchedule);
      setPerformance(updatedPerformance);
      
      toast({
        title: "Calculations updated",
        description: checked 
          ? "Dividend reinvestment has been enabled"
          : "Dividend reinvestment has been disabled",
      });
    } catch (error) {
      console.error("Error recalculating with dividend toggle:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error updating the calculations",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };
  
  if (!formData || !schedule || !performance) {
    return null;
  }
  
  const getInfoCardColor = (type: string) => {
    if (type === 'positive') return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200';
    if (type === 'negative') return 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200';
    if (type === 'neutral') return 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200';
    return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">KD's Portfolio Analyzer</h1>
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center gap-2 bg-white hover:bg-gray-800 hover:text-white border-gray-300 text-gray-800"
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
        
        <div className="mt-4 flex items-center justify-end space-x-2">
          <Switch 
            id="reinvest-dividends"
            checked={reinvestDividends}
            onCheckedChange={handleReinvestToggle}
            disabled={isRecalculating}
          />
          <Label htmlFor="reinvest-dividends" className="text-sm">
            Reinvest Dividends
          </Label>
          {isRecalculating && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
        </div>
        
        <div className={`mt-4 ${isMobile ? 'grid-cols-1 gap-8' : 'grid grid-cols-2 gap-6'}`}>
          <div className="h-fit mb-8">
            {schedule.length > 0 && (
              <PortfolioChart data={schedule} />
            )}
          </div>
          
          <div className="h-fit mb-8">
            <BlurBackground className="p-6 border-l-4 border-l-gray-800">
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
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Investment Insights</h3>
                  <div className={`p-4 rounded-lg border ${getInfoCardColor(performance.totalReturn >= 0 ? 'positive' : 'negative')}`}>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Strategy Analysis:</strong> Your {formData.frequency} dollar-cost averaging approach for {formData.symbol} has {performance.totalReturn >= 0 ? "yielded positive returns" : "faced some challenges"}.
                    </p>
                    
                    {performance.totalReturn > 0 && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Consider:</strong> With a return of {formatPercentage(performance.percentageReturn)}, you might explore increasing your position or diversifying with similar assets in this sector.
                      </p>
                    )}
                    
                    {performance.totalReturn <= 0 && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Consider:</strong> Market timing can be challenging. Extending your investment horizon might help weather short-term volatility.
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-700">
                      <strong>Dividend Impact:</strong> {performance.dividendsReceived > 0 
                        ? `Dividends contribute ${formatCurrency(performance.dividendsReceived)} (${((performance.dividendsReceived / performance.totalInvested) * 100).toFixed(2)}%) to your returns. ${reinvestDividends ? "Reinvesting them compounds your growth potential." : "Consider reinvesting them for compound growth."}`
                        : "This asset doesn't appear to pay significant dividends. Consider diversifying with some dividend-paying stocks for income."}
                    </p>
                  </div>
                </div>
              </div>
            </BlurBackground>
          </div>
        </div>
        
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
