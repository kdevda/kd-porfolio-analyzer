
import React, { useMemo } from "react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Line,
  ComposedChart,
  ResponsiveContainer, 
  Tooltip, 
  TooltipProps, 
  XAxis, 
  YAxis 
} from "recharts";
import { 
  NameType, 
  ValueType 
} from "recharts/types/component/DefaultTooltipContent";
import { InvestmentSchedule } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import BlurBackground from "./ui/BlurBackground";
import { useIsMobile } from "@/hooks/use-mobile";

interface PortfolioChartProps {
  data: InvestmentSchedule[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const portfolioValue = Number(payload[1].value);
    const invested = Number(payload[0].value);
    const isProfit = portfolioValue > invested;
    
    return (
      <BlurBackground className="p-3 text-xs">
        <p className="font-medium">{label}</p>
        <p className={`font-medium ${isProfit ? "text-emerald-700" : "text-rose-700"}`}>
          Portfolio Value: {formatCurrency(portfolioValue)}
        </p>
        <p className="text-gray-600">
          Amount Invested: {formatCurrency(invested)}
        </p>
        <p className={`text-xs ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
          {isProfit ? "Profit:" : "Loss:"} {formatCurrency(portfolioValue - invested)}
        </p>
      </BlurBackground>
    );
  }

  return null;
};

const PortfolioChart = ({ data }: PortfolioChartProps) => {
  const isMobile = useIsMobile();
  
  // Transform data for the chart and determine profit/loss status
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: item.date,
      value: item.currentValue,
      invested: item.totalInvested,
      isProfit: item.currentValue > item.totalInvested
    }));
  }, [data]);

  // Determine if the overall result is a profit or loss
  const isOverallProfit = useMemo(() => {
    if (chartData.length === 0) return true;
    return chartData[chartData.length - 1].isProfit;
  }, [chartData]);

  // Function to format dates on the X axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
  };

  // Function to calculate tick interval dynamically
  const calculateTickInterval = (data: any[]) => {
    if (data.length <= 6) return 1;
    if (data.length <= 12) return 2;
    if (data.length <= 24) return 4;
    if (data.length <= 60) return 10;
    return Math.ceil(data.length / 6);
  };

  const tickInterval = calculateTickInterval(chartData);

  // Function to determine if a specific dot is profitable
  const getDotFill = (entry: any) => {
    return entry.isProfit ? "#10b981" : "#ef4444";
  };

  return (
    <BlurBackground className="p-4 md:p-6 animate-fade-in">
      <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-4">Portfolio Growth</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ 
              top: 10, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 0 : 10, 
              bottom: 0 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              interval={tickInterval}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="invested"
              stackId="1"
              stroke="#888888"
              fill="#CCCCCC"
              animationDuration={1500}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isOverallProfit ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="none"
              dot={{ 
                r: 3,
                fill: "#FFFFFF", // Set a default fill color
                stroke: isOverallProfit ? "#10b981" : "#ef4444", // Use stroke instead
                strokeWidth: 2
              }}
              activeDot={{
                r: 5,
                fill: (entry: any) => entry.isProfit ? "#10b981" : "#ef4444"
              }}
              animationDuration={1500}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </BlurBackground>
  );
};

export default PortfolioChart;
