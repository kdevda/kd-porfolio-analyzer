
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { InvestmentFormData, InvestmentSchedule, PortfolioPerformance } from "@/types";
import PortfolioChart from "@/components/PortfolioChart";
import InvestmentTable from "@/components/InvestmentTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, LightbulbIcon, TrendingUp, Coins, AreaChart, Calendar, Award } from "lucide-react";
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
    if (type === 'positive') return 'bg-gradient-to-br from-emerald-50 to-emerald-100';
    if (type === 'negative') return 'bg-gradient-to-br from-rose-50 to-rose-100';
    if (type === 'neutral') return 'bg-gradient-to-br from-sky-50 to-sky-100';
    if (type === 'insight') return 'bg-gradient-to-br from-violet-50 to-violet-100';
    if (type === 'warning') return 'bg-gradient-to-br from-amber-50 to-amber-100';
    return 'bg-gradient-to-br from-gray-50 to-gray-100';
  };

  // Calculate annualized return for specific time periods
  const getForwardProjection = () => {
    if (!performance) return null;
    
    const { annualizedReturn, totalInvested } = performance;
    const monthlyInvestment = formData.amount;
    
    // Project future balances
    const projections = [
      { 
        period: "1 Year", 
        value: totalInvested + (monthlyInvestment * 12),
        projected: calculateFutureValue(totalInvested, annualizedReturn / 100, 1, monthlyInvestment * 12)
      },
      { 
        period: "5 Years", 
        value: totalInvested + (monthlyInvestment * 12 * 5),
        projected: calculateFutureValue(totalInvested, annualizedReturn / 100, 5, monthlyInvestment * 12)
      },
      { 
        period: "10 Years", 
        value: totalInvested + (monthlyInvestment * 12 * 10),
        projected: calculateFutureValue(totalInvested, annualizedReturn / 100, 10, monthlyInvestment * 12)
      }
    ];
    
    return projections;
  };
  
  // Calculate future value with additional contributions
  const calculateFutureValue = (
    principal: number, 
    annualRate: number, 
    years: number, 
    yearlyContribution: number
  ) => {
    if (annualRate <= -1) return principal + (yearlyContribution * years); // Handle extreme negative returns
    
    // Future value of principal
    const futureValueOfPrincipal = principal * Math.pow(1 + annualRate, years);
    
    // Future value of regular additions (if rate is not 0)
    let futureValueOfAdditions = 0;
    if (annualRate !== 0) {
      futureValueOfAdditions = yearlyContribution * (Math.pow(1 + annualRate, years) - 1) / annualRate;
    } else {
      futureValueOfAdditions = yearlyContribution * years;
    }
    
    return futureValueOfPrincipal + futureValueOfAdditions;
  };
  
  const projections = getForwardProjection();
  
  // Calculate DCA effectiveness
  const dcaEffectiveness = () => {
    if (schedule.length < 2) return null;
    
    // Find highest and lowest purchase prices
    const prices = schedule.map(entry => entry.price);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const avgPrice = schedule.reduce((sum, entry) => sum + entry.price, 0) / schedule.length;
    const priceVolatility = (highestPrice - lowestPrice) / avgPrice;
    
    let effectiveness = "Low";
    let description = "With low price volatility, dollar-cost averaging provided limited benefits compared to lump-sum investing.";
    
    if (priceVolatility > 0.3) {
      effectiveness = "High";
      description = "With significant price volatility, your dollar-cost averaging strategy was highly effective at reducing average cost basis.";
    } else if (priceVolatility > 0.15) {
      effectiveness = "Medium";
      description = "With moderate price volatility, your dollar-cost averaging strategy provided some benefits in reducing average cost basis.";
    }
    
    return { effectiveness, description, volatility: priceVolatility };
  };
  
  const dcaInsight = dcaEffectiveness();

  // Calculate time in market in years and months
  const calculateTimeInMarket = () => {
    if (schedule.length < 2) return { investmentDates: 0, months: 0, years: 0 };
    
    const firstDate = new Date(schedule[0].date);
    const lastDate = new Date(schedule[schedule.length - 1].date);
    
    // Calculate total days
    const totalDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const years = totalDays / 365;
    const months = totalDays / 30.44; // average days in a month
    
    return {
      investmentDates: schedule.length,
      months: months,
      years: years,
    };
  };
  
  const timeInMarket = calculateTimeInMarket();

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
            <BlurBackground className="p-4 md:p-6 h-[468px] overflow-auto shadow-lg rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <LightbulbIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl md:text-2xl font-medium text-gray-800">Investment Insights</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100">
                  <div className="flex items-start gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-violet-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-xs text-gray-800">Time in Market</h3>
                      <p className="text-[10px] text-gray-600">
                        {timeInMarket.investmentDates} investment dates over {timeInMarket.years.toFixed(1)} years
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100">
                  <div className="flex items-start gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-700 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-xs text-gray-800">Performance</h3>
                      <p className="text-[10px] text-gray-600">
                        {formatPercentage(performance?.percentageReturn || 0)} return on {formData?.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {dcaInsight && (
                <div className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100 my-2">
                  <div className="flex items-start gap-1.5">
                    <AreaChart className="h-3.5 w-3.5 text-sky-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-xs text-gray-800">Dollar-Cost Averaging: {dcaInsight.effectiveness}</h3>
                      <p className="text-[10px] text-gray-600">{dcaInsight.description}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Price volatility: {(dcaInsight.volatility * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {projections && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-2 text-gray-800 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Future Projections
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {projections.map((projection, index) => (
                      <div key={index} className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100">
                        <div>
                          <h4 className="font-medium text-xs text-gray-800">{projection.period}</h4>
                          <div className="flex flex-col text-[10px]">
                            <span className="font-semibold text-emerald-700">
                              {formatCurrency(projection.projected)}
                            </span>
                            <span className="text-gray-500 text-[9px] mt-0.5">
                              Invested: {formatCurrency(projection.value)}
                            </span>
                            <span className="text-[9px] text-emerald-600">
                              {formatPercentage((projection.projected/projection.value - 1) * 100)} growth
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                            
              <div className="pt-3 mt-3 border-t border-gray-100">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Coins className="h-4 w-4 text-gray-600 mr-1.5" />
                  Investment Details
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100">
                    <p className="text-xs text-gray-800">
                      <span className="font-medium">Stock:</span> {formData?.symbol}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Frequency:</span> {formData?.frequency}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg shadow-sm bg-white border border-gray-100">
                    <p className="text-xs text-gray-800">
                      <span className="font-medium">Amount:</span> ${formData?.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Period:</span> {formData ? new Date(formData.startDate).toLocaleDateString('en-US', {year: '2-digit', month: '2-digit', day: '2-digit'}) : ''} to {formData ? new Date(formData.endDate).toLocaleDateString('en-US', {year: '2-digit', month: '2-digit', day: '2-digit'}) : ''}
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
