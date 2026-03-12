import { create } from 'zustand';
import { endpoints } from '../config/urls';
import { apiRequest } from '../utils/apiClient';

// 1. Match the exact structure of the 'monthlyTimesheet' objects
interface TimesheetRecord {
  attendanceId: number;
  masterEmployeeId: number;
  employeeId: string;
  employeeName: string;
  company: string;
  attendDate: string;
  inTime: string;
  outTime: string;
  totalHours: string; // Keep as string since API returns "09:35"
  status: string;
}

// 2. Define the full API response structure
interface TimesheetSummary {
  employeeId: number;
  workingHrs: number;
  weeklyOffs: string;
  leavesCount: number;
  workdaysCount: number;
  monthName: string | null;
  monthlyTimesheet: TimesheetRecord[];
}

interface TimesheetState {
  records: TimesheetRecord[];
  summary: Omit<TimesheetSummary, 'monthlyTimesheet'> | null;
  loading: boolean;
  uploadTimesheet: (formData: FormData) => Promise<void>;
  getTimesheet: (id: string) => Promise<void>;
}

export const useTimesheetStore = create<TimesheetState>((set) => ({
  records: [],
  summary: null,
  loading: false,

  uploadTimesheet: async (formData: FormData) => {
    set({ loading: true });
    try {
      const response = await apiRequest(endpoints.timesheetUpload(), {
        method: 'POST',
        body: formData, // Ensure you pass the FormData here
      });

      if (response.ok) {
        const data: TimesheetSummary = await response.json();
        const { monthlyTimesheet, ...rest } = data;
        set({ records: monthlyTimesheet, summary: rest });
      }
    } catch (error) {
      console.error('Error uploading timesheet:', error);
    } finally {
      set({ loading: false });
    }
  },

  getTimesheet: async (id: string) => {
    set({ loading: true });
    try {
      const response = await apiRequest(endpoints.timesheetGet(undefined, id), {
        method: 'GET',
      });
      
      if (response.ok) {
        const data: TimesheetSummary = await response.json();
        const { monthlyTimesheet, ...rest } = data;
        set({ records: monthlyTimesheet, summary: rest });
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    } finally {
      set({ loading: false });
    }
  }
}));