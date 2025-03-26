
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PortfolioForecasting = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Portfolio Forecasting</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Our upcoming Portfolio Forecasting tool will help you project future performance of your investment portfolio using advanced statistical models.
          </p>
          <p className="text-gray-600 mb-6">
            With this feature, you'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Generate Monte Carlo simulations for portfolio outcomes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Project retirement savings and withdrawal strategies</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Analyze potential portfolio returns under different economic scenarios</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Optimize asset allocation for your financial goals</span>
            </li>
          </ul>
          <div className="text-sm text-gray-500 italic mb-6">
            This feature is coming soon. Stay tuned for powerful portfolio forecasting tools!
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio Analyzer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioForecasting;
