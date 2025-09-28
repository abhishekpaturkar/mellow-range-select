import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangeSelectorProps {
  value?: DateRange;
  onValueChange: (range: DateRange) => void;
  onApply?: (range: DateRange) => void;
  onClear?: () => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DateRangeSelector({ value, onValueChange, onApply, onClear }: DateRangeSelectorProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value || {});

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous month to fill the first week
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  // Add days from next month to fill the last week
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    if (!tempRange.from || (tempRange.from && tempRange.to)) {
      // Start new selection
      setTempRange({ from: date });
      setIsSelectingRange(true);
    } else if (tempRange.from && !tempRange.to) {
      // Complete the range
      if (isBefore(date, tempRange.from)) {
        setTempRange({ from: date, to: tempRange.from });
      } else {
        setTempRange({ ...tempRange, to: date });
      }
      setIsSelectingRange(false);
    }
  };

  const isDateInRange = (date: Date) => {
    if (!tempRange.from) return false;
    if (!tempRange.to) return isSameDay(date, tempRange.from);
    
    return (isSameDay(date, tempRange.from) || 
            isSameDay(date, tempRange.to) || 
            (isAfter(date, tempRange.from) && isBefore(date, tempRange.to)));
  };

  const isDateRangeStart = (date: Date) => {
    return tempRange.from && isSameDay(date, tempRange.from);
  };

  const isDateRangeEnd = (date: Date) => {
    return tempRange.to && isSameDay(date, tempRange.to);
  };

  const handleApply = () => {
    onValueChange(tempRange);
    onApply?.(tempRange);
  };

  const handleClear = () => {
    setTempRange({});
    onValueChange({});
    onClear?.();
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Select Date Range</h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-calendar-hover rounded-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-foreground">
            {MONTHS[currentDate.getMonth()]}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-medium text-foreground">
              {currentDate.getFullYear()}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-calendar-hover rounded-md transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {allDays.map(date => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isInRange = isDateInRange(date);
          const isRangeStart = isDateRangeStart(date);
          const isRangeEnd = isDateRangeEnd(date);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                "relative w-10 h-10 rounded-md text-sm font-medium transition-all duration-200",
                "hover:bg-calendar-hover",
                !isCurrentMonth && "text-muted-foreground/50",
                isCurrentMonth && "text-foreground",
                isToday && !isInRange && "bg-calendar-today text-calendar-today-foreground",
                isInRange && !isRangeStart && !isRangeEnd && "bg-calendar-range text-calendar-range-foreground",
                (isRangeStart || isRangeEnd) && "bg-calendar-selected text-calendar-selected-foreground",
                isRangeStart && isRangeEnd && "rounded-md",
                isRangeStart && !isRangeEnd && "rounded-l-md rounded-r-none",
                !isRangeStart && isRangeEnd && "rounded-l-none rounded-r-md",
                isInRange && !isRangeStart && !isRangeEnd && "rounded-none"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={handleClear}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}