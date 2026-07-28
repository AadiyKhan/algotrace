import { describe, it, expect, beforeEach } from 'vitest';
import usePlayerStore from '../src/store/usePlayerStore';

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
  });

  it('initializes with default state', () => {
    const state = usePlayerStore.getState();
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.playbackSpeed).toBe(2000);
  });

  it('updates total steps', () => {
    usePlayerStore.getState().setTotalSteps(10);
    expect(usePlayerStore.getState().totalSteps).toBe(10);
  });

  it('increments step correctly', () => {
    usePlayerStore.getState().setTotalSteps(5);
    usePlayerStore.getState().nextStep();
    expect(usePlayerStore.getState().currentStep).toBe(1);
    
    // Test boundary
    usePlayerStore.getState().setCurrentStep(4);
    usePlayerStore.getState().nextStep();
    expect(usePlayerStore.getState().currentStep).toBe(4); // Shouldn't exceed totalSteps - 1
  });

  it('decrements step correctly', () => {
    usePlayerStore.getState().setTotalSteps(5);
    usePlayerStore.getState().setCurrentStep(2);
    usePlayerStore.getState().prevStep();
    expect(usePlayerStore.getState().currentStep).toBe(1);

    // Test boundary
    usePlayerStore.getState().setCurrentStep(0);
    usePlayerStore.getState().prevStep();
    expect(usePlayerStore.getState().currentStep).toBe(0);
  });

  it('toggles play state', () => {
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('seeks to specific step', () => {
    usePlayerStore.getState().setTotalSteps(10);
    usePlayerStore.getState().seekToStep(5);
    expect(usePlayerStore.getState().currentStep).toBe(5);

    // Seek out of bounds
    usePlayerStore.getState().seekToStep(15);
    expect(usePlayerStore.getState().currentStep).toBe(9); // Max is totalSteps - 1
  });
});
