import React, { useState } from 'react';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { format } from 'date-fns';

interface DateRange {
  from?: Date;
  to?: Date;
}

const Index = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({});

  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
  };

  const handleApply = (range: DateRange) => {
    console.log('Applied date range:', range);
  };

  const handleClear = () => {
    console.log('Cleared date range');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Mellow Date Range Selector
          </h1>
          <p className="text-xl text-muted-foreground">
            Beautiful calendar component with smooth range selection
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Calendar Component */}
          <div className="flex justify-center">
            <DateRangeSelector
              value={selectedRange}
              onValueChange={handleRangeChange}
              onApply={handleApply}
              onClear={handleClear}
            />
          </div>

          {/* Selected Range Display */}
          <div className="bg-card rounded-xl border border-border p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              Selected Range
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  From Date
                </span>
                <p className="text-lg font-medium text-foreground mt-1">
                  {selectedRange.from ? format(selectedRange.from, 'MMMM dd, yyyy') : 'Not selected'}
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  To Date
                </span>
                <p className="text-lg font-medium text-foreground mt-1">
                  {selectedRange.to ? format(selectedRange.to, 'MMMM dd, yyyy') : 'Not selected'}
                </p>
              </div>

              {selectedRange.from && selectedRange.to && (
                <div className="p-4 bg-calendar-range rounded-lg border-2 border-calendar-selected">
                  <span className="text-sm font-medium text-calendar-range-foreground uppercase tracking-wide">
                    Range Summary
                  </span>
                  <p className="text-lg font-medium text-calendar-range-foreground mt-1">
                    {format(selectedRange.from, 'MMM dd')} - {format(selectedRange.to, 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-calendar-range-foreground/80 mt-1">
                    {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
