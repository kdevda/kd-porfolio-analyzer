
import React from "react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
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

interface PortfolioChartProps {
  data: InvestmentSchedule[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <BlurBackground className="p-3 text-xs">
        <p className="font-medium">{label}</p>
        <p className="text-portfolio-blue">
          Value: {formatCurrency(Number(payload[0].value))}
        </p>
        <p className="text-portfolio-green">
          Invested: {formatCurrency(Number(payload[1].value))}
        </p>
      </BlurBackground>
    );
  }

  return null;
};

const PortfolioChart = ({ data }: PortfolioChartProps) => {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    date: item.date,
    value: item.currentValue,
    invested: item.totalInvested,
  }));

  // Function to format dates on the X axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
  };

  // Function to determine tick interval dynamically
  const calculateTickInterval = (data: any[]) => {
    if (data.length <= 6) return 1;
    if (data.length <= 12) return 2;
    if (data.length <= 24) return 4;
    if (data.length <= 60) return 10;
    return Math.ceil(data.length / 6);
  };

  const tickInterval = calculateTickInterval(chartData);

  return (
    <BlurBackground className="p-6 animate-fade-in h-[400px]">
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Portfolio Growth</h2>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis} 
            interval={tickInterval}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="invested"
            stackId="1"
            stroke="#42A5F5"
            fill="#90CAF9"
            animationDuration={1500}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="value"
            stackId="2"
            stroke="#1E90FF"
            fill="#1E90FF"
            fillOpacity={0.5}
            animationDuration={1500}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </BlurBackground>
  );
};

export default PortfolioChart;
