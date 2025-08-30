export const MODEL_CONFIG = {
  male: {
    url: '/models/male_avatar.glb',
    // Add additional metadata as needed
    scale: 1.5,
    position: { x: 0, y: -1, z: 0 }
  },
  female: {
    url: '/models/female_avatar.glb',
    scale: 1.5,
    position: { x: 0, y: -1, z: 0 }
  }
} as const;
