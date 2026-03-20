import { useState, useEffect, ChangeEvent } from 'react';
import { format, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, ListTodo, Sparkles, Plus, X, Clock, Tag, FileText, Trash2 } from 'lucide-react';
import Calendar from './components/Calendar';
import TodoList from './components/TodoList';
import { ScheduleEvent, EventType } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('planner_events');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Migration: If old data format (has 'date' but not 'startDate'), convert it
      return parsed.map((event: any) => {
        if (event.date && !event.startDate) {
          return {
            ...event,
            startDate: event.date,
            endDate: event.date,
            time: event.time || '09:00',
            type: event.type || '개인용무',
          };
        }
        return event;
      });
    } catch (e) {
      console.error('Failed to parse events:', e);
      return [];
    }
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>(() => {
    return localStorage.getItem('planner_banner') || '';
  });

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formType, setFormType] = useState<EventType>('업무');
  const [formNotes, setFormNotes] = useState('');

  // Daily Random Quote
  const quotes = [
    "세상은 호락호락하지 않다. 괜찮다. 나도 호락호락하지 않으니깐.",
    "갱갱갱~",
    "오늘도 라쓰고!",
    "뿌슈!",
    "라쓰고",
    "발전이 없으면 사람이 아니지?",
    "우리의 영화를 시작해",
    "세이세이~ 요요!"
  ];

  const getDailyQuote = () => {
    const today = format(new Date(), 'yyyyMMdd');
    const seed = parseInt(today);
    // Simple deterministic random based on date
    const index = seed % quotes.length;
    return quotes[index];
  };

  const dailyQuote = getDailyQuote();

  useEffect(() => {
    try {
      localStorage.setItem('planner_events', JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('planner_banner', bannerUrl);
    } catch (e) {
      console.error('Failed to save banner to localStorage:', e);
      // If quota exceeded, we might want to clear it or notify the user
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('이미지 용량이 너무 커서 저장할 수 없습니다. 더 작은 이미지를 사용해주세요.');
        setBannerUrl('');
      }
    }
  }, [bannerUrl]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const filterEventsForDate = (dateStr: string) => {
    const targetDate = parseISO(dateStr);
    return events.filter(event => {
      if (!event.startDate || !event.endDate) return false;
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return isWithinInterval(targetDate, { start, end }) || isSameDay(targetDate, start) || isSameDay(targetDate, end);
    });
  };

  const todayEvents = filterEventsForDate(todayStr);
  const tomorrowEvents = filterEventsForDate(tomorrowStr);

  const handleOpenAddModal = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setFormStartDate(dateStr);
    setFormEndDate(dateStr);
    setFormTitle('');
    setFormTime('09:00');
    setFormType('업무');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddEvent = () => {
    if (formTitle.trim()) {
      const id = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);
        
      const newEvent: ScheduleEvent = {
        id,
        title: formTitle.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        time: formTime,
        type: formType,
        notes: formNotes.trim() || undefined,
      };
      setEvents([...events, newEvent]);
      setIsAddModalOpen(false);
    }
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setIsDetailModalOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 5MB as requested
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 용량이 너무 큽니다 (최대 5MB). 더 작은 이미지를 선택해주세요.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBannerUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-6 flex flex-col">
      <header className="max-w-7xl w-full mx-auto mb-4 flex items-start justify-between gap-6">
        <div className="flex-shrink-0 pt-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <Sparkles className="text-white" size={32} />
            </div>
            My Planner
          </h1>
          <motion.p 
            key={dailyQuote}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-slate-500 mt-5 font-bold flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {dailyQuote}
          </motion.p>
        </div>

        {/* Banner Area - Right Aligned & Expanded to match right column width */}
        <div className="hidden lg:block w-full max-w-[400px]">
          <div className={`relative group w-full h-[140px] rounded-3xl overflow-hidden flex items-center justify-center transition-all ${
            bannerUrl ? 'bg-transparent' : 'bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-300'
          }`}>
            {bannerUrl ? (
              <img 
                src={bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <Plus size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">배너 업로드</span>
              </div>
            )}
            <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <input type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleFileChange} />
              <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} />
                이미지 선택
              </span>
            </label>
            {bannerUrl && (
              <button 
                onClick={() => setBannerUrl('')}
                className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full text-slate-400 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 shadow-md"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        {/* Left Side: Calendar */}
        <div className="lg:col-span-8 px-1">
          <Calendar 
            events={events} 
            onAddEvent={handleOpenAddModal}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Right Side: To-Do Lists */}
        <div className="lg:col-span-4 flex flex-col gap-4 px-1">
          <div className="h-[340px]">
            <TodoList 
              title="오늘의 일정" 
              events={todayEvents}
              colorClass="blue"
            />
          </div>
          <div className="h-[340px]">
            <TodoList 
              title="내일의 일정" 
              events={tomorrowEvents}
              colorClass="emerald"
            />
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <Plus className="text-blue-600" />
                  새 일정 추가
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2.5 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">시작일</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">종료일</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">시간</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">일정 종류</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as EventType)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-bold text-sm appearance-none"
                      >
                        <option value="업무">업무</option>
                        <option value="개인용무">개인용무</option>
                        <option value="PLAVE">PLAVE</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">일정 이름</label>
                  <input
                    autoFocus
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="무엇을 하나요?"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-bold placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">메모</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="추가 메모를 입력하세요..."
                      rows={3}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all text-slate-800 font-medium text-sm resize-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddEvent}
                  disabled={!formTitle.trim()}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                >
                  일정 등록하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${
                  selectedEvent.type === '업무' ? 'bg-blue-500' : 
                  selectedEvent.type === '개인용무' ? 'bg-emerald-500' : 'bg-purple-500'
                }`}>
                  {selectedEvent.type}
                </div>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2.5 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={16} className="text-blue-500" />
                      {selectedEvent.startDate === selectedEvent.endDate 
                        ? selectedEvent.startDate 
                        : `${selectedEvent.startDate} ~ ${selectedEvent.endDate}`}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-blue-500" />
                      {selectedEvent.time}
                    </div>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">메모</label>
                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-[0.98] flex items-center justify-center"
                    title="일정 삭제"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
