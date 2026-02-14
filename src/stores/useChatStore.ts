import { create } from 'zustand'

interface ChatState {
    // Active chat
    activeChatId: string | null
    setActiveChatId: (chatId: string | null) => void

    // Draft messages per chat
    draftMessages: Record<string, string>
    setDraft: (chatId: string, text: string) => void
    clearDraft: (chatId: string) => void

    // Typing indicators
    typingUsers: Record<string, boolean>
    setUserTyping: (userId: string, isTyping: boolean) => void
    clearTypingUsers: () => void
}

export const useChatStore = create<ChatState>((set) => ({
    // Active chat
    activeChatId: null,
    setActiveChatId: (chatId) => set({ activeChatId: chatId }),

    // Draft messages
    draftMessages: {},
    setDraft: (chatId, text) =>
        set((state) => ({
            draftMessages: { ...state.draftMessages, [chatId]: text },
        })),
    clearDraft: (chatId) =>
        set((state) => {
            const { [chatId]: _, ...rest } = state.draftMessages
            return { draftMessages: rest }
        }),

    // Typing indicators
    typingUsers: {},
    setUserTyping: (userId, isTyping) =>
        set((state) => ({
            typingUsers: { ...state.typingUsers, [userId]: isTyping },
        })),
    clearTypingUsers: () => set({ typingUsers: {} }),
}))
