Input:
- Text messages
- Voice notes
- Check-in calls

Features:
- Lexical diversity
- Speech rate
- Sentiment
- Message frequency

Baseline:
- Rolling 30-day mean
- Rolling 30-day std

Drift:
- Z-score per feature

Output:
- Risk score
- Alert tier





features.py
    ↓
Extract communication features

baseline.py
    ↓
Learn user's normal behaviour

drift.py
    ↓
Single-feature anomaly detection

driftmulti.py
    ↓
Multi-feature risk scoring