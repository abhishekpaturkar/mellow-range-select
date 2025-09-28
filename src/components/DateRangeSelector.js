class DateRangeSelector {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onValueChange: options.onValueChange || (() => {}),
      onApply: options.onApply || (() => {}),
      onClear: options.onClear || (() => {}),
      value: options.value || {}
    };
    
    this.currentDate = new Date();
    this.tempRange = { ...this.options.value };
    this.isSelectingRange = false;
    this.isYearDropdownOpen = false;
    
    this.DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    this.MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
  }
  
  render() {
    const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Calculate calendar grid dates
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
    
    const allDays = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      allDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    this.container.innerHTML = `
      <div class="date-range-selector">
        <div class="date-range-header">
          <h2 class="date-range-title">Select Date Range</h2>
        </div>
        
        <div class="month-navigation">
          <button class="nav-button" data-action="prev-month">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <div class="month-year-display">
            <span class="month-name">${this.MONTHS[this.currentDate.getMonth()]}</span>
            <div class="year-dropdown">
              <button class="year-button" data-action="toggle-year">
                <span>${this.currentDate.getFullYear()}</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div class="year-dropdown-menu hidden" data-element="year-menu">
                ${this.generateYearOptions()}
              </div>
            </div>
          </div>
          
          <button class="nav-button" data-action="next-month">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <div class="calendar-days-header">
          ${this.DAYS.map(day => `<div class="day-header">${day}</div>`).join('')}
        </div>
        
        <div class="calendar-grid">
          ${allDays.map(date => this.renderCalendarDay(date)).join('')}
        </div>
        
        <div class="action-buttons">
          <button class="action-button clear-button" data-action="clear">Clear</button>
          <button class="action-button apply-button" data-action="apply">Apply</button>
        </div>
      </div>
    `;
  }
  
  generateYearOptions() {
    const currentYear = this.currentDate.getFullYear();
    const startYear = currentYear - 50;
    const endYear = currentYear + 10;
    
    let options = '';
    for (let year = startYear; year <= endYear; year++) {
      const isSelected = year === currentYear ? 'selected' : '';
      options += `<div class="year-option ${isSelected}" data-year="${year}">${year}</div>`;
    }
    return options;
  }
  
  renderCalendarDay(date) {
    const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
    const isInRange = this.isDateInRange(date);
    const isRangeStart = this.isDateRangeStart(date);
    const isRangeEnd = this.isDateRangeEnd(date);
    const isToday = this.isSameDay(date, new Date());
    
    let classes = ['calendar-day'];
    if (!isCurrentMonth) classes.push('other-month');
    if (isToday && !isInRange) classes.push('today');
    if (isInRange && !isRangeStart && !isRangeEnd) classes.push('in-range');
    if (isRangeStart) classes.push('range-start');
    if (isRangeEnd) classes.push('range-end');
    
    return `
      <button class="${classes.join(' ')}" data-action="select-date" data-date="${date.toISOString()}">
        ${date.getDate()}
      </button>
    `;
  }
  
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      
      switch (action) {
        case 'prev-month':
          this.navigateMonth('prev');
          break;
        case 'next-month':
          this.navigateMonth('next');
          break;
        case 'toggle-year':
          this.toggleYearDropdown();
          break;
        case 'select-date':
          const dateStr = e.target.getAttribute('data-date');
          this.handleDateClick(new Date(dateStr));
          break;
        case 'clear':
          this.handleClear();
          break;
        case 'apply':
          this.handleApply();
          break;
      }
      
      // Handle year selection
      if (e.target.classList.contains('year-option')) {
        const year = parseInt(e.target.getAttribute('data-year'));
        this.selectYear(year);
      }
    });
    
    // Close year dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.closeYearDropdown();
      }
    });
  }
  
  navigateMonth(direction) {
    if (direction === 'prev') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.render();
    this.bindEvents();
  }
  
  toggleYearDropdown() {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    const menu = this.container.querySelector('[data-element="year-menu"]');
    if (this.isYearDropdownOpen) {
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  }
  
  closeYearDropdown() {
    this.isYearDropdownOpen = false;
    const menu = this.container.querySelector('[data-element="year-menu"]');
    if (menu) {
      menu.classList.add('hidden');
    }
  }
  
  selectYear(year) {
    this.currentDate.setFullYear(year);
    this.closeYearDropdown();
    this.render();
    this.bindEvents();
  }
  
  handleDateClick(date) {
    if (!this.tempRange.from || (this.tempRange.from && this.tempRange.to)) {
      // Start new selection
      this.tempRange = { from: date };
      this.isSelectingRange = true;
    } else if (this.tempRange.from && !this.tempRange.to) {
      // Complete the range
      if (date < this.tempRange.from) {
        this.tempRange = { from: date, to: this.tempRange.from };
      } else {
        this.tempRange = { ...this.tempRange, to: date };
      }
      this.isSelectingRange = false;
    }
    
    this.render();
    this.bindEvents();
    this.options.onValueChange(this.tempRange);
  }
  
  handleApply() {
    this.options.onValueChange(this.tempRange);
    this.options.onApply(this.tempRange);
  }
  
  handleClear() {
    this.tempRange = {};
    this.render();
    this.bindEvents();
    this.options.onValueChange(this.tempRange);
    this.options.onClear();
  }
  
  // Utility methods
  isDateInRange(date) {
    if (!this.tempRange.from) return false;
    if (!this.tempRange.to) return this.isSameDay(date, this.tempRange.from);
    
    return (this.isSameDay(date, this.tempRange.from) || 
            this.isSameDay(date, this.tempRange.to) || 
            (date > this.tempRange.from && date < this.tempRange.to));
  }
  
  isDateRangeStart(date) {
    return this.tempRange.from && this.isSameDay(date, this.tempRange.from);
  }
  
  isDateRangeEnd(date) {
    return this.tempRange.to && this.isSameDay(date, this.tempRange.to);
  }
  
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  // Public method to update value
  setValue(range) {
    this.tempRange = { ...range };
    this.render();
    this.bindEvents();
  }
  
  // Public method to get current value
  getValue() {
    return { ...this.tempRange };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateRangeSelector;
}

// Make available globally
window.DateRangeSelector = DateRangeSelector;