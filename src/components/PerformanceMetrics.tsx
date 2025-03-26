
import React from "react";
import { PortfolioPerformance } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";
import BlurBackground from "./ui/BlurBackground";
import { CircleCheck, TrendingUp, DollarSign, ArrowUpRight, Calendar } from "lucide-react";

interface PerformanceMetricsProps {
  performance: PortfolioPerformance;
  stockSymbol: string;
}

const PerformanceMetrics = ({ performance, stockSymbol }: PerformanceMetricsProps) => {
  const isPositive = performance.totalReturn >= 0;
  
  const metricsData = [
    {
      title: "Total Invested",
      value: formatCurrency(performance.totalInvested),
      icon: <DollarSign className="h-5 w-5 text-portfolio-blue" />,
      subtitle: "Principal amount",
    },
    {
      title: "Final Value",
      value: formatCurrency(performance.finalValue),
      icon: <CircleCheck className="h-5 w-5 text-portfolio-blue" />,
      subtitle: "Current portfolio value",
    },
    {
      title: "Total Return",
      value: formatCurrency(performance.totalReturn),
      icon: <TrendingUp className="h-5 w-5 text-portfolio-blue" />,
      subtitle: "Profit/Loss",
      isHighlighted: true,
      isPositive,
    },
    {
      title: "Percentage Return",
      value: formatPercentage(performance.percentageReturn),
      icon: <ArrowUpRight className="h-5 w-5 text-portfolio-blue" />,
      subtitle: "Overall growth",
      isHighlighted: true,
      isPositive,
    },
    {
      title: "Annualized Return",
      value: formatPercentage(performance.annualizedReturn),
      icon: <Calendar className="h-5 w-5 text-portfolio-blue" />,
      subtitle: "Yearly average",
      isHighlighted: true,
      isPositive,
    },
  ];

  return (
    <BlurBackground className="p-6 animate-fade-in">
      <div className="mb-4">
        <h2 className="text-2xl font-medium text-gray-800">
          Performance Summary: {stockSymbol}
        </h2>
        <p className="text-gray-500">
          Analysis of your investment performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {metricsData.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border card-hover ${
              metric.isHighlighted
                ? metric.isPositive
                  ? "border-portfolio-profit/30 bg-portfolio-profit/5"
                  : "border-portfolio-loss/30 bg-portfolio-loss/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.title}</p>
                <p
                  className={`text-xl font-semibold ${
                    metric.isHighlighted
                      ? metric.isPositive
                        ? "text-portfolio-profit"
                        : "text-portfolio-loss"
                      : "text-gray-800"
                  }`}
                >
                  {metric.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{metric.subtitle}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </BlurBackground>
  );
};

export default PerformanceMetrics;
