
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OptionsPricing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Options Pricing Model</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Our upcoming Options Pricing Model will allow you to calculate fair values for options contracts using advanced financial models.
          </p>
          <p className="text-gray-600 mb-6">
            You'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Price call and put options using Black-Scholes model</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Calculate option Greeks (Delta, Gamma, Theta, Vega)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Visualize option pricing scenarios with interactive charts</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500">•</span>
              <span>Compare theoretical vs. market prices to find trading opportunities</span>
            </li>
          </ul>
          <div className="text-sm text-gray-500 italic mb-6">
            This feature is coming soon. We're working hard to bring you the best options analysis tools!
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

export default OptionsPricing;
