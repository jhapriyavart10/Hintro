import { create } from 'zustand'

const useUIStore = create((set) => ({
  isSidebarCollapsed: false,
  isTaskModalOpen: false,
  selectedTask: null,
  isNewListModalOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  openTaskModal: (task) => set({ isTaskModalOpen: true, selectedTask: task }),
  closeTaskModal: () => set({ isTaskModalOpen: false, selectedTask: null }),

  openNewListModal: () => set({ isNewListModalOpen: true }),
  closeNewListModal: () => set({ isNewListModalOpen: false }),
}))

export default useUIStore
