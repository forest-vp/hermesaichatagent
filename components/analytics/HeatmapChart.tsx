'use client';

import { motion } from 'framer-motion';
import { heatmapData } from '@/lib/analytics-data';

// ── Color scale for activity level ──────────────────────────────────
function getColor(level: number): string {
  if (level === 0) return 'rgba(255,255,255,0.03)';
  if (level <= 3) return 'rgba(59,130,246,0.15)';
  if (level <= 5) return 'rgba(59,130,246,0.3)';
  if (level <= 7) return 'rgba(59,130,246,0.5)';
  return 'rgba(96,165,250,0.8)';
}

function getLevel(activities: number): number {
  if (activities === 0) return 0;
  if (activities <= 3) return 1;
  if (activities <= 5) return 2;
  if (activities <= 7) return 3;
  return 4;
}

// ── Day labels (Sun–Sat) ────────────────────────────────────────────
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Month labels ────────────────────────────────────────────────────
function getMonthLabels(data: typeof heatmapData): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = '';
  data.forEach((d, i) => {
    const month = new Date(d.date).toLocaleDateString('en-US', { month: 'short' });
    if (month !== lastMonth) {
      labels.push({ label: month, col: Math.floor(i / 7) });
      lastMonth = month;
    }
  });
  return labels;
}

export default function HeatmapChart() {
  // Organize data into a grid: array of weeks, each week = 7 days
  const weeks: (typeof heatmapData)[] = [];
  let currentWeek: typeof heatmapData = [];

  heatmapData.forEach((day, i) => {
    // Start each week on Sunday (day 0)
    if (i === 0) {
      const firstDay = new Date(day.date).getDay();
      for (let j = 0; j < firstDay; j++) {
        currentWeek.push({
          date: new Date(
            new Date(day.date).getTime() - (firstDay - j) * 86400000
          )
            .toISOString()
            .split('T')[0],
          goals_completed: -1,
          habits_completed: -1,
          total_activities: -1,
          productivity_score: -1,
        });
      }
    }
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const monthLabels = getMonthLabels(heatmapData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-2xl border border-white/[0.06] bg-cards/80 p-6 backdrop-blur-sm col-span-full"
    >
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Activity Heatmap</h3>
        <p className="text-sm text-muted mt-1">
          Daily activity over the last 3 months — darker = more active
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="flex ml-10 mb-1">
            {weeks.map((_, weekIdx) => {
              const label = monthLabels.find((m) => m.col === weekIdx);
              return (
                <div key={weekIdx} className="flex-1 min-w-[14px]">
                  {label && (
                    <span className="text-[10px] text-muted">{label.label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 pt-0">
              {dayLabels.map((label, i) => (
                <div
                  key={label}
                  className="h-[14px] flex items-center justify-end"
                  style={{ display: i % 2 === 0 ? 'none' : 'flex' }}
                >
                  {i % 2 !== 0 && (
                    <span className="text-[10px] text-muted pr-1">{label}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px] flex-1 min-w-[14px]">
                {week.map((day) => {
                  const isEmpty = day.total_activities < 0;
                  const color = isEmpty ? 'transparent' : getColor(day.total_activities);
                  const level = isEmpty ? -1 : getLevel(day.total_activities);

                  return (
                    <div
                      key={day.date}
                      className="group relative"
                    >
                      <div
                        className="h-[14px] w-[14px] rounded-[3px] transition-all duration-200 hover:scale-125 hover:z-10"
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            level >= 3 ? '0 0 6px rgba(96,165,250,0.3)' : 'none',
                        }}
                      >
                        {/* Tooltip */}
                        {!isEmpty && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <div className="rounded-lg border border-white/10 bg-[#111111]/95 backdrop-blur-xl px-3 py-2 shadow-2xl whitespace-nowrap">
                              <p className="text-[11px] font-semibold text-white">
                                {new Date(day.date + 'T12:00:00').toLocaleDateString(
                                  'en-US',
                                  { month: 'short', day: 'numeric', weekday: 'short' }
                                )}
                              </p>
                              <p className="text-[10px] text-muted mt-0.5">
                                {day.total_activities} activities ·{' '}
                                {day.goals_completed} goals · {day.habits_completed} habits
                              </p>
                              <p className="text-[10px] text-primary">
                                Score: {day.productivity_score}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 ml-10">
            <span className="text-[10px] text-muted">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="h-[12px] w-[12px] rounded-[2px]"
                style={{ backgroundColor: getColor(level === 0 ? 0 : level * 2 + 1) }}
              />
            ))}
            <span className="text-[10px] text-muted">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
