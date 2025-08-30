// lib/emotions.ts
export const EmotionMappings = {
  happy: {
    morphTargets: { smile: 0.8, eyebrows: 0.3 },
    animation: 'happy_idle',
    voice: { rate: 1.1, pitch: 1.2 }
  },
  sad: {
    morphTargets: { frown: 0.7, eyebrows: -0.4 },
    animation: 'sad_idle',
    voice: { rate: 0.9, pitch: 0.8 }
  },
  excited: {
    morphTargets: { smile: 1.0, eyes_wide: 0.6 },
    animation: 'excited_gesture',
    voice: { rate: 1.2, pitch: 1.3 }
  },
  thoughtful: {
    morphTargets: { eyebrows: 0.5, slight_frown: 0.2 },
    animation: 'thinking_pose',
    voice: { rate: 0.95, pitch: 1.0 }
  }
};