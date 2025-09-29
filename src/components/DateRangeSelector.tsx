import React, { Component } from 'react';
import './DateRangeSelector.css';

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

interface DateRangeSelectorState {
  currentDate: Date;
  tempRange: DateRange;
  isSelectingRange: boolean;
  isYearDropdownOpen: boolean;
}

class DateRangeSelector extends Component<DateRangeSelectorProps, DateRangeSelectorState> {
  private DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  private MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(props: DateRangeSelectorProps) {
    super(props);
    
    this.state = {
      currentDate: new Date(),
      tempRange: props.value || {},
      isSelectingRange: false,
      isYearDropdownOpen: false
    };
  }

  componentDidMount() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  componentDidUpdate(prevProps: DateRangeSelectorProps) {
    if (prevProps.value !== this.props.value && this.props.value) {
      this.setState({ tempRange: { ...this.props.value } });
    }
  }

  handleDocumentClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.year-dropdown')) {
      this.setState({ isYearDropdownOpen: false });
    }
  };

  navigateMonth = (direction: 'prev' | 'next') => {
    this.setState(prevState => {
      const newDate = new Date(prevState.currentDate);
      if (direction === 'prev') {
        newDate.setMonth(prevState.currentDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevState.currentDate.getMonth() + 1);
      }
      return { currentDate: newDate };
    });
  };

  toggleYearDropdown = () => {
    this.setState(prevState => ({
      isYearDropdownOpen: !prevState.isYearDropdownOpen
    }));
  };

  selectYear = (year: number) => {
    this.setState(prevState => {
      const newDate = new Date(prevState.currentDate);
      newDate.setFullYear(year);
      return {
        currentDate: newDate,
        isYearDropdownOpen: false
      };
    });
  };

  handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    // Prevent selection of future dates
    if (date > today) return;
    
    this.setState(prevState => {
      let newTempRange: DateRange;
      
      if (!prevState.tempRange.from || (prevState.tempRange.from && prevState.tempRange.to)) {
        // Start new selection
        newTempRange = { from: date };
        this.setState({ isSelectingRange: true });
      } else if (prevState.tempRange.from && !prevState.tempRange.to) {
        // Complete the range
        if (date < prevState.tempRange.from) {
          newTempRange = { from: date, to: prevState.tempRange.from };
        } else {
          newTempRange = { ...prevState.tempRange, to: date };
        }
        this.setState({ isSelectingRange: false });
      } else {
        newTempRange = prevState.tempRange;
      }

      this.props.onValueChange(newTempRange);
      return { tempRange: newTempRange };
    });
  };

  handleApply = () => {
    this.props.onValueChange(this.state.tempRange);
    if (this.props.onApply) {
      this.props.onApply(this.state.tempRange);
    }
  };

  handleClear = () => {
    const emptyRange = {};
    this.setState({ tempRange: emptyRange });
    this.props.onValueChange(emptyRange);
    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  isDateInRange = (date: Date): boolean => {
    const { tempRange } = this.state;
    if (!tempRange.from) return false;
    if (!tempRange.to) return this.isSameDay(date, tempRange.from);
    
    return (this.isSameDay(date, tempRange.from) || 
            this.isSameDay(date, tempRange.to) || 
            (date > tempRange.from && date < tempRange.to));
  };

  isDateRangeStart = (date: Date): boolean => {
    return this.state.tempRange.from ? this.isSameDay(date, this.state.tempRange.from) : false;
  };

  isDateRangeEnd = (date: Date): boolean => {
    return this.state.tempRange.to ? this.isSameDay(date, this.state.tempRange.to) : false;
  };

  generateCalendarDays = (): Date[] => {
    const { currentDate } = this.state;
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Calculate calendar grid dates
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
    
    const allDays: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return allDays;
  };

  generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear;
    
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        key: year,
        text: year.toString(),
        value: year
      });
    }
    return years.reverse(); // Show most recent years first
  };

  renderCalendarDay = (date: Date): JSX.Element => {
    const isCurrentMonth = date.getMonth() === this.state.currentDate.getMonth();
    const isInRange = this.isDateInRange(date);
    const isRangeStart = this.isDateRangeStart(date);
    const isRangeEnd = this.isDateRangeEnd(date);
    const isToday = this.isSameDay(date, new Date());
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const isFutureDate = date > today;
    
    let classes = ['calendar-day'];
    if (!isCurrentMonth) classes.push('other-month');
    if (isToday && !isInRange) classes.push('today');
    if (isInRange && !isRangeStart && !isRangeEnd) classes.push('in-range');
    if (isRangeStart) classes.push('range-start');
    if (isRangeEnd) classes.push('range-end');
    if (isFutureDate) classes.push('disabled');
    
    return (
      <button
        key={date.toISOString()}
        className={classes.join(' ')}
        onClick={() => this.handleDateClick(date)}
        disabled={isFutureDate}
      >
        {date.getDate()}
      </button>
    );
  };

  render() {
    const { currentDate, isYearDropdownOpen } = this.state;
    const allDays = this.generateCalendarDays();
    const yearOptions = this.generateYearOptions();

    return (
      <div className="date-range-selector">
        <div className="date-range-header">
          <h2 className="date-range-title">Select Date Range</h2>
        </div>
        
        <div className="month-navigation">
          <button className="nav-button" onClick={() => this.navigateMonth('prev')}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div className="month-year-display">
            <span className="month-name">{this.MONTHS[currentDate.getMonth()]}</span>
            <div className="year-dropdown">
              <button className="year-button" onClick={this.toggleYearDropdown}>
                <span>{currentDate.getFullYear()}</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className={`year-dropdown-menu ${isYearDropdownOpen ? '' : 'hidden'}`}>
                {yearOptions.map(option => (
                  <div
                    key={option.key}
                    className={`year-option ${option.value === currentDate.getFullYear() ? 'selected' : ''}`}
                    onClick={() => this.selectYear(option.value)}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button className="nav-button" onClick={() => this.navigateMonth('next')}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div className="calendar-days-header">
          {this.DAYS.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {allDays.map(date => this.renderCalendarDay(date))}
        </div>
        
        <div className="action-buttons">
          <button className="action-button clear-button" onClick={this.handleClear}>
            Clear
          </button>
          <button className="action-button apply-button" onClick={this.handleApply}>
            Apply
          </button>
        </div>
      </div>
    );
  }
}

export default DateRangeSelector;