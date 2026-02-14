import { create } from 'zustand';
import { Report } from '@/app/generated/prisma/client';

interface ReportsState {
    reports: Report[];
    filter: 'ALL' | 'PENDING' | 'ACTIONED' | 'REJECTED';
    setReports: (reports: Report[]) => void;
    setFilter: (filter: 'ALL' | 'PENDING' | 'ACTIONED' | 'REJECTED') => void;
    filteredReports: () => Report[];
}

export const useReportsStore = create<ReportsState>((set, get) => ({
    reports: [],
    filter: 'ALL',
    setReports: (reports) => set({ reports }),
    setFilter: (filter) => set({ filter }),
    filteredReports: () => {
        const { reports, filter } = get();
        if (filter === 'ALL') return reports;
        return reports.filter((report) => report.status === filter);
    },
}));
