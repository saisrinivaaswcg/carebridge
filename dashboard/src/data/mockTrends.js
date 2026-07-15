// Generates 12 weeks of trend data dropping from baseline to current score
function generateTrend(current, baseline) {
  const weeks = ['Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31', 'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28', 'May 5', 'May 12', 'May 19', 'May 26']
  const step = (baseline - current) / (weeks.length - 1)
  return weeks.map((date, i) => ({
    date,
    value: Math.round(baseline - step * i),
    baselineLow: baseline - 10,
    baselineHigh: baseline + 10,
  }))
}

export const mockTrends = {
  1: generateTrend(44, 76),
  2: generateTrend(67, 82),
  3: generateTrend(60, 79),
  4: generateTrend(86, 84),
  5: generateTrend(87, 85),
}

export const mockWeekly = {
  1: [
    { week: 'May 26', messages: 18, calls: 2, voiceNotes: 3 },
    { week: 'Jun 2', messages: 14, calls: 1, voiceNotes: 2 },
    { week: 'Jun 9', messages: 8, calls: 0, voiceNotes: 1 },
    { week: 'Jun 16', messages: 4, calls: 0, voiceNotes: 0 },
  ],
  2: [
    { week: 'May 26', messages: 22, calls: 3, voiceNotes: 4 },
    { week: 'Jun 2', messages: 19, calls: 2, voiceNotes: 3 },
    { week: 'Jun 9', messages: 17, calls: 2, voiceNotes: 3 },
    { week: 'Jun 16', messages: 15, calls: 1, voiceNotes: 2 },
  ],
}