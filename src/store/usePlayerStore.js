import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
  currentStep: 0,
  totalSteps: 0,
  isPlaying: false,
  playbackSpeed: 2000,

  setTotalSteps:    (total) => set({ totalSteps: total, currentStep: 0, isPlaying: false }),
  setCurrentStep:   (step)  => set({ currentStep: step }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  togglePlay:       ()      => set((state) => ({ isPlaying: !state.isPlaying })),
  nextStep:         ()      => set((state) => ({ currentStep: Math.min(state.totalSteps - 1, state.currentStep + 1) })),
  prevStep:         ()      => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  reset:            ()      => set({ currentStep: 0, isPlaying: false }),
  seekToStep:       (step)  => set({ currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)) }),
}));

export default usePlayerStore;
