import React, { useState, useEffect } from 'react';
import { Menu, AlertTriangle, CheckCheck, BarChart3, ShieldCheck, Plus, Settings, Calendar as CalendarIcon, GitBranch, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

interface PodcastCheck {
  name: string;
  url: string;
}

interface DayErrors {
  ok: number;
  errors: Array<{ name: string; error: string }>;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const PODCASTS: PodcastCheck[] = [];
const history: Record<string, DayErrors> = JSON.parse(localStorage.getItem('podatorHistory') || '{}');

const Header = () => (
  <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10">
    <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button className="text-primary hover:bg-surface-container-high transition-colors p-2 rounded-full">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-widest text-on-surface font-manrope">PODATOR</h1>
      </div>
      <div className="hidden md:flex items-center gap-8 mr-8">
        <a className="text-primary font-semibold transition-colors" href="#">Dashboard</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Podcasts</a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Calendar</a>
      </div>
    </div>
  </header>
);

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (date: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, onDayClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: { date: Date; inMonth: boolean }[] = [];
  let current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(current),
      inMonth: current.getMonth() === month,
    });
    current.setDate(current.getDate() + 1);
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div>
      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center pb-3 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = formatDate(day.date);
          const dayData = history[dateStr];
          const today = isToday(day.date);
          const hasErrors = dayData && dayData.errors.length > 0;

          return (
            <motion.div
              key={dateStr}
              whileHover={day.inMonth ? { y: -4, boxShadow: '0px 10px 30px rgba(37, 99, 235, 0.1)' } : {}}
              onClick={() => day.inMonth && onDayClick(dateStr)}
              className={`day-cell ${hasErrors ? 'has-errors' : ''} ${today ? 'today' : ''} ${!day.inMonth ? 'opacity-30 cursor-default' : ''}`}
            >
              <span className={`text-sm font-bold ${today ? 'text-primary' : 'text-on-surface'}`}>
                {day.date.getDate()}
              </span>
              <div className="flex flex-col gap-2">
                {today && <span className="text-xs font-bold text-primary uppercase tracking-tighter">Today</span>}
                {dayData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant">{dayData.ok} ✓</span>
                    {dayData.errors.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center font-bold">
                        {dayData.errors.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface SidebarProps {
  stats: { active: number; success: number; alerts: number };
  onVerify: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ stats, onVerify, isLoading }) => (
  <aside className="lg:col-span-4 space-y-6">
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <h3 className="text-lg font-extrabold text-on-surface mb-4">Verification Insights</h3>
      <div className="space-y-3">
        <div className="bg-surface p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center">
            <BarChart3 className="text-on-tertiary-container" size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Active Flows</p>
            <p className="text-xl font-extrabold text-on-surface">{stats.active}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl flex items-center gap-4 border border-outline-variant/10">
          <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
            <CheckCheck className="text-on-secondary-container" size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Success Rate</p>
            <p className="text-xl font-extrabold text-on-surface">{stats.success}%</p>
          </div>
        </div>

        <div className="bg-error-container/10 p-4 rounded-xl flex items-center gap-4 border border-error/20">
          <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center">
            <AlertTriangle className="text-on-error-container" size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-error uppercase tracking-widest">Alerts</p>
            <p className="text-xl font-extrabold text-error">{stats.alerts}</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onVerify}
        disabled={isLoading}
        className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ShieldCheck size={18} />
        {isLoading ? 'Verifying...' : 'Verify All'}
      </motion.button>
    </div>
  </aside>
);

interface DetailModalProps {
  dateStr: string | null;
  onClose: () => void;
  data: DayErrors | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ dateStr, onClose, data }) => {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const dateDisplay = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        <h3 className="text-xl font-bold text-on-surface mb-4">{dateDisplay}</h3>

        {!data ? (
          <p className="text-on-surface-variant">No verification for this day</p>
        ) : (
          <div className="space-y-4">
            <div className="bg-secondary-container/20 p-4 rounded-lg border border-secondary/20">
              <p className="text-sm font-semibold text-on-surface">✓ {data.ok} flows OK</p>
            </div>

            {data.errors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-error uppercase tracking-widest mb-3">Errors Detected</p>
                {data.errors.map((err, i) => (
                  <div key={i} className="bg-error-container/10 p-3 rounded-lg border border-error/20 mb-2">
                    <p className="font-semibold text-on-surface">{err.name}</p>
                    <p className="text-sm text-on-surface-variant">{err.error}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="w-full mt-6 p-2 text-on-surface-variant hover:text-on-surface transition-colors">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl z-50 border-t border-outline-variant/15 md:hidden">
    {[
      { icon: LayoutGrid, label: 'Dashboard' },
      { icon: CalendarIcon, label: 'Calendar', active: true },
      { icon: GitBranch, label: 'Flows' },
      { icon: Settings, label: 'Settings' },
    ].map(({ icon: Icon, label, active }) => (
      <a
        key={label}
        href="#"
        className={`flex flex-col items-center px-4 py-2 transition-all ${active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
      >
        <Icon size={20} />
        <span className="text-xs font-bold uppercase tracking-wider mt-1">{label}</span>
      </a>
    ))}
  </nav>
);

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ active: 0, success: 0, alerts: 0 });

  useEffect(() => {
    fetchPodcasts();
    updateStats();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const res = await fetch('podcasts.json');
      const data = await res.json();
      PODCASTS.push(...data);
      setStats(prev => ({ ...prev, active: data.length }));
    } catch (e) {
      console.error('Error loading podcasts:', e);
    }
  };

  const updateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = history[today];

    if (todayData) {
      const total = todayData.ok + todayData.errors.length;
      const successRate = Math.round((todayData.ok / total) * 100);
      setStats(prev => ({ ...prev, success: successRate, alerts: todayData.errors.length }));
    } else {
      setStats(prev => ({ ...prev, success: 0, alerts: 0 }));
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const results: DayErrors = { ok: 0, errors: [] };

    for (const podcast of PODCASTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const url = CORS_PROXY + encodeURIComponent(podcast.url);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        const xml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');

        if (doc.getElementsByTagName('parsererror').length > 0) {
          results.errors.push({ name: podcast.name, error: 'Invalid XML' });
        } else {
          const items = doc.getElementsByTagName('item');
          if (items.length === 0) {
            results.errors.push({ name: podcast.name, error: 'No episodes' });
          } else {
            const enclosure = items[0].getElementsByTagName('enclosure')[0];
            if (!enclosure) {
              results.errors.push({ name: podcast.name, error: 'No enclosure' });
            } else {
              const length = parseInt(enclosure.getAttribute('length')) || 0;
              if (length < 100000) {
                const mb = (length / 1024 / 1024).toFixed(2);
                results.errors.push({ name: podcast.name, error: `File too small: ${mb} MB` });
              } else {
                results.ok++;
              }
            }
          }
        }
      } catch (e) {
        results.errors.push({ name: podcast.name, error: 'Network error' });
      }
    }

    history[today] = results;
    localStorage.setItem('podatorHistory', JSON.stringify(history));
    updateStats();
    setIsLoading(false);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="text-on-surface-variant font-manrope text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Monthly Overview</span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface">{monthName}</h2>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="px-4 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
              ←
            </button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="px-4 py-2 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors">
              →
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <CalendarGrid currentDate={currentDate} onDayClick={setSelectedDate} />
          </div>
          <Sidebar stats={stats} onVerify={handleVerify} isLoading={isLoading} />
        </div>
      </main>

      <DetailModal dateStr={selectedDate} onClose={() => setSelectedDate(null)} data={selectedDate ? history[selectedDate] : null} />

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-8 md:bottom-12 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center z-40"
      >
        <Plus size={28} />
      </motion.button>

      <BottomNav />
    </div>
  );
}
