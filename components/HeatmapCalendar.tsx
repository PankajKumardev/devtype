'use client';

import { useMemo } from 'react';

interface HeatmapCalendarProps {
  activityData: { date: string; count: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HeatmapCalendar({ activityData }: HeatmapCalendarProps) {
  const { weeks, maxCount, monthLabels } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    // Start from Jan 1 of current year
    const startDate = new Date(currentYear, 0, 1);
    // End at Dec 31 of current year
    const endDate = new Date(currentYear, 11, 31);
    
    // Create activity map for quick lookup
    const activityMap = new Map(activityData.map(d => [d.date, d.count]));
    
    // Generate all days of the year
    const days: { date: string; count: number; dayOfWeek: number; month: number }[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
        dayOfWeek: current.getDay(),
        month: current.getMonth(),
      });
      current.setDate(current.getDate() + 1);
    }
    
    // Group into weeks
    const weeks: { date: string; count: number; dayOfWeek: number; month: number }[][] = [];
    let currentWeek: { date: string; count: number; dayOfWeek: number; month: number }[] = [];
    
    // Pad the first week with empty cells if Jan 1 isn't Sunday
    const firstDayOfWeek = days[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', count: -1, dayOfWeek: i, month: -1 });
    }
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Push remaining days WITHOUT padding (Dec 31 ends where it ends)
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    // Find max count for color scaling
    const maxCount = Math.max(...days.map(d => d.count), 1);
    
    // Generate month labels with their starting week positions
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d.month >= 0);
      if (firstValidDay && firstValidDay.month !== lastMonth) {
        monthLabels.push({
          month: MONTHS[firstValidDay.month],
          weekIndex,
        });
        lastMonth = firstValidDay.month;
      }
    });
    
    return { weeks, maxCount, monthLabels };
  }, [activityData]);

  const getColor = (count: number): string => {
    if (count === -1) return 'transparent';
    if (count === 0) return 'var(--color-bg)';
    
    const intensity = Math.min(count / Math.max(maxCount, 4), 1);
    
    if (intensity <= 0.25) return 'rgba(226, 183, 20, 0.3)';
    if (intensity <= 0.5) return 'rgba(226, 183, 20, 0.5)';
    if (intensity <= 0.75) return 'rgba(226, 183, 20, 0.7)';
    return 'rgba(226, 183, 20, 0.95)';
  };

  const totalTests = activityData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = activityData.filter(d => d.count > 0).length;

  return (
    <div className="bg-bg-sub rounded-xl p-3 sm:p-4 md:p-6 border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <h3 className="text-sm md:text-base text-text">{new Date().getFullYear()} activity</h3>
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-sub">
          <span>{totalTests} tests</span>
          <span>{activeDays} active days</span>
        </div>
      </div>
      
      {/* Scrollable container for mobile */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="min-w-[650px]">
          {/* Month labels */}
          <div className="flex text-[10px] text-sub mb-1 ml-6 sm:ml-7">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                style={{
                  width: i < monthLabels.length - 1 
                    ? `${(monthLabels[i + 1].weekIndex - label.weekIndex) * 12}px`
                    : 'auto',
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
          
          {/* Grid with day labels */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 text-[10px] text-sub w-5 sm:w-6 shrink-0">
              <span className="h-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Mon</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Wed</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px] leading-[10px]">Fri</span>
              <span className="h-[10px]"></span>
            </div>
            
            {/* Weeks grid */}
            <div className="flex gap-[2px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="w-[10px] h-[10px] rounded-sm"
                      style={{ backgroundColor: getColor(day.count) }}
                      title={day.date ? `${day.date}: ${day.count} test${day.count !== 1 ? 's' : ''}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 text-[10px] sm:text-xs text-sub">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: 'var(--color-bg)' }} />
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: 'rgba(226, 183, 20, 0.3)' }} />
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: 'rgba(226, 183, 20, 0.5)' }} />
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: 'rgba(226, 183, 20, 0.7)' }} />
        <div className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: 'rgba(226, 183, 20, 0.95)' }} />
        <span>More</span>
      </div>
    </div>
  );
}
