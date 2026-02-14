export const queryKeys = {
    transactions: {
        all: ['transactions'] as const,
        list: (type: string) => ['transactions', 'list', type] as const,
        detail: (id: string) => ['transactions', 'detail', id] as const,
        stats: ['transactions', 'stats'] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        list: (page: number, limit: number) => ['notifications', 'list', { page, limit }] as const,
        unreadCount: ['notifications', 'unreadCount'] as const,
    },
    offers: {
        byChat: (chatId: string) => ['offers', 'chat', chatId] as const,
    },
    chat: {
        messages: (chatId: string) => ['chat', 'messages', chatId] as const,
    },
    relics: {
        detail: (id: string) => ['relics', 'detail', id] as const,
        list: (filter?: string) => ['relics', 'list', filter] as const,
    },
    marketplace: {
        all: ['marketplace'] as const,
        list: (filters?: Record<string, string>) => ['marketplace', 'list', filters] as const,
        detail: (id: string) => ['marketplace', 'detail', id] as const,
    },
    users: {
        all: ['users'] as const,
        profile: (id: string) => ['users', 'profile', id] as const,
    },
    karma: {
        all: ['karma'] as const,
        score: (userId: string) => ['karma', 'score', userId] as const,
        history: (userId: string) => ['karma', 'history', userId] as const,
    },
}
