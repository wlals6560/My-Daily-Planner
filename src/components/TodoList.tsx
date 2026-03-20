import { Clock } from 'lucide-react';
import { ScheduleEvent, EventType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TodoListProps {
  title: string;
  events: ScheduleEvent[];
  colorClass?: 'blue' | 'emerald' | 'purple';
}

const TYPE_COLORS: Record<EventType, string> = {
  '업무': 'bg-blue-500',
  '개인용무': 'bg-emerald-500',
  'PLAVE': 'bg-purple-500'
};

export default function TodoList({ title, events, colorClass = "blue" }: TodoListProps) {
  const sortedEvents = [...events].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <span className={`w-2 h-7 rounded-full ${colorClass === 'blue' ? 'bg-blue-500' : colorClass === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`}></span>
          {title}
        </h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          {events.length}개 일정
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {sortedEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-gray-400"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                <Clock size={28} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">일정이 없습니다</p>
            </motion.div>
          ) : (
            sortedEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col gap-2 p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TYPE_COLORS[event.type]}`}>
                    {event.type}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                </div>
                
                <span className="text-sm font-bold text-gray-800">
                  {event.title}
                </span>

                {event.notes && (
                  <p className="text-xs text-gray-400 line-clamp-1 italic">
                    {event.notes}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
