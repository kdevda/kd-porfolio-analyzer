
import React from "react";
import { PortfolioPerformance } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";
import BlurBackground from "./ui/BlurBackground";
import { CircleCheck, TrendingUp, DollarSign, ArrowUpRight, Gift } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PerformanceMetricsProps {
  performance: PortfolioPerformance;
  stockSymbol: string;
}

const PerformanceMetrics = ({ performance, stockSymbol }: PerformanceMetricsProps) => {
  const isPositive = performance.totalReturn >= 0;
  const isMobile = useIsMobile();
  
  const metricsData = [
    {
      title: "Total Invested",
      value: formatCurrency(performance.totalInvested),
      icon: <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />,
      subtitle: "Principal amount",
    },
    {
      title: "Final Value",
      value: formatCurrency(performance.finalValue),
      icon: <CircleCheck className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />,
      subtitle: "Current portfolio value",
    },
    {
      title: "Total Return",
      value: formatCurrency(performance.totalReturn),
      icon: <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />,
      subtitle: "Profit/Loss",
      isHighlighted: true,
      isPositive,
    },
    {
      title: "Percentage Return",
      value: formatPercentage(performance.percentageReturn),
      icon: <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />,
      subtitle: "Overall growth",
      isHighlighted: true,
      isPositive,
    },
    {
      title: "Dividends Received",
      value: formatCurrency(performance.dividendsReceived || 0),
      icon: <Gift className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />,
      subtitle: "Total dividends",
      isHighlighted: true,
      isPositive: true,
    },
  ];

  return (
    <BlurBackground className="p-4 md:p-6 animate-fade-in">
      <div className="mb-3 md:mb-4">
        <h2 className="text-xl md:text-2xl font-medium text-gray-800">
          Performance Summary: {stockSymbol}
        </h2>
        <p className="text-gray-500 text-sm">
          Analysis of your investment performance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mt-3 md:mt-4">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className={`p-2 md:p-4 rounded-lg border card-hover ${
              metric.isHighlighted
                ? metric.isPositive
                  ? "border-gray-300 bg-gray-50"
                  : "border-gray-300 bg-gray-100"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">{metric.title}</p>
                <p
                  className={`text-sm md:text-lg font-semibold ${
                    metric.isHighlighted
                      ? metric.isPositive
                        ? "text-gray-800"
                        : "text-gray-700"
                      : "text-gray-800"
                  }`}
                >
                  {metric.value}
                </p>
                <p className="text-xs text-gray-400 mt-1 hidden md:block">{metric.subtitle}</p>
              </div>
              <div className="bg-gray-100 p-1 md:p-2 rounded-full">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </BlurBackground>
  );
};

export default PerformanceMetrics;
