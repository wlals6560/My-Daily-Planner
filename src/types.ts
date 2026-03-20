export type EventType = '업무' | '개인용무' | 'PLAVE';

export interface ScheduleEvent {
  id: string;
  title: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  time: string;      // HH:mm
  type: EventType;
  notes?: string;
}
