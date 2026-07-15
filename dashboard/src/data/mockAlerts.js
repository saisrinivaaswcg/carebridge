export const mockAlerts = [
  {
    id: 1, seniorId: 1, tier: 'critical', name: 'Mr Tan Boon Kiat', time: '19 min ago',
    message: 'Mr Tan missed 3 consecutive scheduled check-ins. No voice activity detected in the past 19 hours.',
    action: 'Call Family',
  },
  {
    id: 2, seniorId: 2, tier: 'watch', name: 'Mdm Lim Ah Moi', time: '2 days ago',
    message: "Mdm Lim's activity score has drifted 18% below her personal baseline for 4 consecutive weeks. Consider scheduling a check-up.",
    action: 'Schedule Visit',
  },
  {
    id: 3, seniorId: 3, tier: 'watch', name: 'Mr Ismail Bin Yusof', time: '3 days ago',
    message: "Mr Ismail's response time has slowed gradually over the past 3 weeks.",
    action: 'Schedule Visit',
  },
]