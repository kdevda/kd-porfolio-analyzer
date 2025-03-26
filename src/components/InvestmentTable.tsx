
import React, { useState } from "react";
import { InvestmentSchedule } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { ScrollArea } from "@/components/ui/scroll-area";
import BlurBackground from "./ui/BlurBackground";

interface InvestmentTableProps {
  data: InvestmentSchedule[];
}

const InvestmentTable = ({ data }: InvestmentTableProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Show limited entries or all based on state
  const displayData = showAll ? data : data.slice(0, 10);
  
  return (
    <BlurBackground className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-medium text-gray-800">Investment Schedule</h2>
        {data.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-portfolio-blue hover:text-portfolio-navy text-sm font-medium transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${data.length})`}
          </button>
        )}
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4">
          <table className="investment-table">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th>Date</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Shares</th>
                <th>Total Shares</th>
                <th>Total Invested</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : ""}
                >
                  <td>{item.date}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.sharesPurchased.toFixed(4)}</td>
                  <td>{item.totalShares.toFixed(4)}</td>
                  <td>{formatCurrency(item.totalInvested)}</td>
                  <td>{formatCurrency(item.currentValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </BlurBackground>
  );
};

export default InvestmentTable;
