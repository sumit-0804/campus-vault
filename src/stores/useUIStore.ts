import { create } from 'zustand'

interface UIState {
    // Sidebar
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void

    // Active modal
    activeModal: string | null
    openModal: (modalId: string) => void
    closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    // Sidebar
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    // Active modal
    activeModal: null,
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}))
