import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { ScheduleEvent, EventType } from '../types';

interface CalendarProps {
  events: ScheduleEvent[];
  onAddEvent: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const TYPE_COLORS: Record<EventType, string> = {
  '업무': 'bg-blue-100 text-blue-700 border-blue-200',
  '개인용무': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'PLAVE': 'bg-purple-100 text-purple-700 border-purple-200'
};

export default function Calendar({ events, onAddEvent, onEventClick, selectedDate, onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {days.map((day, idx) => (
          <div key={day} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          const dayEvents = events.filter(event => {
            if (!event.startDate || !event.endDate) return false;
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);
            return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
          });

          const isLastColumn = (idx + 1) % 7 === 0;
          const isLastRow = idx >= calendarDays.length - 7;

          return (
            <div
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[120px] p-3 ${!isLastColumn ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} border-gray-100 cursor-pointer transition-all hover:bg-blue-50/30 relative group ${
                !isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'
              } ${isSelected ? 'bg-blue-50/50 ring-1 ring-blue-200 ring-inset z-10' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold ${
                  isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-sm' : 
                  isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEvent(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 4).map(event => (
                  <div 
                    key={event.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`text-[10px] px-2 py-1 rounded-md truncate border shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ${TYPE_COLORS[event.type]}`}
                  >
                    <span className="font-bold mr-1">{event.time}</span>
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 4 && (
                  <div className="text-[9px] text-gray-400 font-medium pl-1">
                    외 {dayEvents.length - 4}개
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {renderHeader()}
      {renderDays()}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {renderCells()}
      </div>
    </div>
  );
}
