import { create } from 'zustand';

const useChatStore = create((set) => ({
  isOpen: false,
  queuedQuery: null,
  
  setIsOpen: (isOpen) => set({ isOpen }),
  
  askQuestion: (query) => set({ 
    queuedQuery: query,
    isOpen: true
  }),
  
  clearQueuedQuery: () => set({ queuedQuery: null })
}));

export default useChatStore;
