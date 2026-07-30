import librosa
import numpy as np

def extract_acoustic_features(wav_path):
    """
    Extract acoustic features from a WAV file.
    Returns pause ratio, speech rate proxy, and pitch variance.
    """
    y, sr = librosa.load(wav_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)

    # 1. Pause analysis - detect non-silent intervals
    intervals = librosa.effects.split(y, top_db=25)
    speech_time = sum((end - start) for start, end in intervals) / sr
    pause_ratio = 1 - (speech_time / duration) if duration > 0 else 0

    # 2. Speech rate proxy - syllable-like onsets per second of speech
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
    speech_rate = len(onsets) / speech_time if speech_time > 0 else 0

    # 3. Pitch variance - monotone speech is a depression/decline signal
    f0, voiced_flag, _ = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C6'), sr=sr
    )
    f0_voiced = f0[~np.isnan(f0)]
    pitch_mean = float(np.mean(f0_voiced)) if len(f0_voiced) > 0 else 0
    pitch_variance = float(np.std(f0_voiced)) if len(f0_voiced) > 0 else 0

    return {
        "duration_sec": round(float(duration), 2),
        "pause_ratio": round(float(pause_ratio), 3),
        "speech_rate": round(float(speech_rate), 2),
        "pitch_mean": round(pitch_mean, 1),
        "pitch_variance": round(pitch_variance, 1),
    }