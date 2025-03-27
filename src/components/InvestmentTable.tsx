
import React, { useState } from "react";
import { InvestmentSchedule } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { ScrollArea } from "@/components/ui/scroll-area";
import BlurBackground from "./ui/BlurBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface InvestmentTableProps {
  data: InvestmentSchedule[];
}

const InvestmentTable = ({ data }: InvestmentTableProps) => {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();
  
  // Show limited entries or all based on state
  const displayData = showAll ? data : data.slice(0, 10);
  
  return (
    <BlurBackground className="p-4 md:p-6 animate-fade-in h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-medium text-gray-800">Investment Schedule</h2>
        {data.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${data.length})`}
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-2 md:p-4 min-w-[700px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className={isMobile ? "hidden md:table-cell" : ""}>Price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className={isMobile ? "hidden md:table-cell" : ""}>Shares</TableHead>
                  <TableHead>Total Shares</TableHead>
                  <TableHead className={isMobile ? "hidden md:table-cell" : ""}>Total Invested</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item, index) => {
                  const isDividendEntry = item.dividend && item.dividend > 0;
                  const isDividendReinvestment = isDividendEntry && item.sharesPurchased > 0;
                  
                  return (
                    <TableRow 
                      key={index} 
                      className={isDividendEntry ? (isDividendReinvestment ? "bg-blue-50" : "bg-amber-50") : ""}
                    >
                      <TableCell>{item.date}</TableCell>
                      <TableCell className={isMobile ? "hidden md:table-cell" : ""}>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        {isDividendEntry 
                          ? isDividendReinvestment 
                            ? `${formatCurrency(item.amount)} (Div Reinvest)` 
                            : `${formatCurrency(0)} (Div Received)`
                          : formatCurrency(item.amount)
                        }
                      </TableCell>
                      <TableCell className={isMobile ? "hidden md:table-cell" : ""}>{item.sharesPurchased.toFixed(4)}</TableCell>
                      <TableCell>{item.totalShares.toFixed(4)}</TableCell>
                      <TableCell className={isMobile ? "hidden md:table-cell" : ""}>{formatCurrency(item.totalInvested)}</TableCell>
                      <TableCell>{formatCurrency(item.currentValue)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </BlurBackground>
  );
};

export default InvestmentTable;
