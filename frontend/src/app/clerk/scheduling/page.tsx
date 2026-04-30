'use client';

import { useState } from 'react';
import SidebarClerk from '@/components/SidebarClerk';
import TopNavClerk from '@/components/TopNavClerk';

type Appointment = {
  day: number;       // 0=SUN ... 6=SAT
  startSlot: number; // 0..19  (8:00 = slot 0, 30-min steps)
  endSlot: number;   // exclusive
  plate: string;
  province: string;
};

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const SLOT_COUNT = 20;
const ROW_HEIGHT_PX = 48;

const TIME_SLOTS = Array.from({ length: SLOT_COUNT }, (_, i) => {
  const startMinutes = 8 * 60 + i * 30;
  const endMinutes = startMinutes + 30;
  const fmt = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}:${mm === 0 ? '00' : mm}`;
  };
  return `${fmt(startMinutes)} - ${fmt(endMinutes)}`;
});

const slotLabel = (slot: number) => {
  const m = 8 * 60 + slot * 30;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm === 0 ? '00' : mm}`;
};

// 8:00 ถึง 18:00 ห่างกัน 30 นาที (รวม 21 ตัวเลือก)
const APPOINTMENT_TIME_OPTIONS = Array.from({ length: 21 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${h}:${mm === 0 ? '00' : mm}`;
});

const APPOINTMENTS: Appointment[] = [
  // SUN
  { day: 0, startSlot: 0,  endSlot: 4,  plate: '4ขฌ 6931', province: 'กรุงเทพ' },
  { day: 0, startSlot: 4,  endSlot: 8,  plate: 'รย 232',    province: 'ปทุมธานี' },
  { day: 0, startSlot: 8,  endSlot: 12, plate: 'รย 232',    province: 'ปทุมธานี' },
  { day: 0, startSlot: 12, endSlot: 14, plate: 'คฌ 4320',   province: 'กรุงเทพ' },
  { day: 0, startSlot: 14, endSlot: 17, plate: 'รย 232',    province: 'ปทุมธานี' },
  // { day: 0, startSlot: 17, endSlot: 20, plate: '8ฌด 3232',  province: 'กรุงเทพ' },

  // MON
  { day: 1, startSlot: 0,  endSlot: 5,  plate: 'ขศ 7638',  province: 'กรุงเทพ' },
  { day: 1, startSlot: 5,  endSlot: 8,  plate: 'พน 43',    province: 'ปทุมธานี' },
  { day: 1, startSlot: 9,  endSlot: 12, plate: 'พน 43',    province: 'ปทุมธานี' },
  { day: 1, startSlot: 12, endSlot: 17, plate: 'ขศ 7638',  province: 'กรุงเทพ' },
  { day: 1, startSlot: 17, endSlot: 20, plate: 'พน 43',    province: 'ปทุมธานี' },

  // TUE
  { day: 2, startSlot: 0,  endSlot: 6,  plate: 'รย 232',    province: 'ปทุมธานี' },
  { day: 2, startSlot: 6,  endSlot: 8,  plate: '8ฌด 3232',  province: 'กรุงเทพ' },
  { day: 2, startSlot: 15, endSlot: 17, plate: '3ยว 928',   province: 'ปทุมธานี' },

  // WED
  { day: 3, startSlot: 0,  endSlot: 2,  plate: 'คฌ 4320',   province: 'กรุงเทพ' },
  { day: 3, startSlot: 2,  endSlot: 5,  plate: '3ยว 928',   province: 'ปทุมธานี' },
  { day: 3, startSlot: 5,  endSlot: 7,  plate: '8ฌด 3232',  province: 'กรุงเทพ' },
  { day: 3, startSlot: 11, endSlot: 15, plate: '4ขฌ 6931',  province: 'กรุงเทพ' },
];

const CALENDAR_WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

type CalendarCell = {
  day: number;
  date: Date;
  muted?: boolean;
  selected?: boolean;
  today?: boolean;
};

function buildCalendarDates(year: number, month: number, selectedDate: Date): CalendarCell[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells: CalendarCell[] = [];

  // เติมวันท้ายเดือนก่อนหน้า ให้ครบสัปดาห์แรก
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, date: new Date(year, month - 1, day), muted: true });
  }

  // เติมวันของเดือนปัจจุบัน
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      date: new Date(year, month, day),
      selected:
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day,
      today:
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day,
    });
  }

  // เติมวันต้นเดือนถัดไป ให้แถวสุดท้ายครบ 7 ช่อง
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailing; day++) {
    cells.push({ day, date: new Date(year, month + 1, day), muted: true });
  }

  return cells;
}

export default function SchedulingPage() {
  const [platePrefix, setPlatePrefix] = useState('4ขฌ');
  const [plateNumber, setPlateNumber] = useState('6931');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [appointPrefix, setAppointPrefix] = useState('8:00');
  const [appointNumber, setAppointNumber] = useState('8:30');

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const calendarDates = buildCalendarDates(viewYear, viewMonth, selectedDate);

  const formatAppointDate = (d: Date) =>
    `${d.getDate()} / ${THAI_MONTHS_FULL[d.getMonth()]} / ${d.getFullYear() + 543}`;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (cell: CalendarCell) => {
    setSelectedDate(cell.date);
    if (cell.muted) {
      setViewYear(cell.date.getFullYear());
      setViewMonth(cell.date.getMonth());
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FAFF]">
      <SidebarClerk />
      <TopNavClerk />

      <main className="ml-64 pt-25 px-16 pb-12">
        <h1 className="text-3xl font-extrabold text-[#002446] mb-6">Scheduling</h1>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-xl font-semibold text-[#002446]">
              {THAI_MONTHS_FULL[viewMonth]}&nbsp;&nbsp;{viewYear + 543}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Previous month"
            >
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L2 11L13 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex-1">
              <div className="grid grid-cols-7 mb-3">
                {CALENDAR_WEEKDAYS.map((d, i) => (
                  <div key={i} className="text-center text-xs font-bold tracking-wider text-[#64748B]">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-2">
                {calendarDates.map((d, idx) => {
                  const base = 'mx-auto w-10 h-10 flex items-center justify-center rounded-full text-base font-medium cursor-pointer';
                  let cls = `${base} text-[#0F172A] hover:bg-gray-100`;
                  if (d.muted) cls = `${base} text-gray-300 hover:bg-gray-100`;
                  if (d.selected) cls = `${base} bg-[#BFE2F7] text-[#002446] font-semibold`;
                  if (d.today && !d.selected) cls = `${base} ring-2 ring-[#0EA5E9] text-[#002446] font-semibold hover:bg-gray-100`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDate(d)}
                      className={cls}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#94A3B8] hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Next month"
            >
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L12 11L1 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-8 py-6 mb-8">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-8 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">Vehicle Plate</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={platePrefix}
                  onChange={(e) => setPlatePrefix(e.target.value)}
                  className="w-16 px-3 py-2 bg-[#F1F5F9] rounded-md text-sm text-[#64748B] outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-20 px-3 py-2 bg-[#F1F5F9] rounded-md text-sm text-[#64748B] outline-none focus:ring-1 focus:ring-blue-400"
                />
                <div className="relative flex-1">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-9 bg-[#F1F5F9] rounded-md text-sm text-[#64748B] outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                  >
                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                    <option value="ปทุมธานี">ปทุมธานี</option>
                    <option value="นนทบุรี">นนทบุรี</option>
                    <option value="สมุทรปราการ">สมุทรปราการ</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"
                    width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-2">Appointment (Date And Time)</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={appointPrefix}
                    onChange={(e) => setAppointPrefix(e.target.value)}
                    className="w-24 appearance-none px-3 py-2 pr-8 bg-[#F1F5F9] rounded-md text-sm text-[#64748B] outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                  >
                    {APPOINTMENT_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"
                    width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[#64748B]">-</span>
                <div className="relative">
                  <select
                    value={appointNumber}
                    onChange={(e) => setAppointNumber(e.target.value)}
                    className="w-24 appearance-none px-3 py-2 pr-8 bg-[#F1F5F9] rounded-md text-sm text-[#64748B] outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                  >
                    {APPOINTMENT_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"
                    width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formatAppointDate(selectedDate)}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-sm text-[#0F172A] outline-none text-center bg-gray-50 cursor-default"
                />
              </div>
            </div>

            <button
              type="button"
              className="px-8 py-3 bg-[#002446] text-white rounded-lg text-sm font-semibold hover:bg-[#1A3A5F] transition-colors"
            >
              Assign Task
            </button>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div
            className="grid relative"
            style={{
              gridTemplateColumns: '160px repeat(7, minmax(0, 1fr))',
              gridTemplateRows: `48px repeat(${SLOT_COUNT}, ${ROW_HEIGHT_PX}px)`,
            }}
          >
            {/* Header row */}
            <div className="bg-[#E6F6FF]" style={{ gridRow: 1, gridColumn: 1 }} />
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="bg-[#E6F6FF] flex items-center justify-center text-xs font-bold tracking-wider text-[#64748B] border-l border-white"
                style={{ gridRow: 1, gridColumn: i + 2 }}
              >
                {d}
              </div>
            ))}

            {/* Time labels (left column) */}
            {TIME_SLOTS.map((label, idx) => (
              <div
                key={`time-${idx}`}
                className="bg-[#E6F6FF] px-6 flex items-center text-xs font-medium text-[#475569] border-t border-white"
                style={{ gridRow: idx + 2, gridColumn: 1 }}
              >
                {label}
              </div>
            ))}

            {/* Empty slot cells (gridlines) */}
            {Array.from({ length: SLOT_COUNT }).map((_, rowIdx) =>
              DAYS.map((_d, dayIdx) => (
                <div
                  key={`cell-${rowIdx}-${dayIdx}`}
                  className="border-t border-l border-gray-100"
                  style={{ gridRow: rowIdx + 2, gridColumn: dayIdx + 2 }}
                />
              ))
            )}

            {/* Appointment blocks (overlay) */}
            {APPOINTMENTS.map((a, idx) => (
              <div
                key={`appt-${idx}`}
                className="p-1"
                style={{
                  gridRow: `${a.startSlot + 2} / ${a.endSlot + 2}`,
                  gridColumn: a.day + 2,
                }}
              >
                <div className="h-full border-2 border-t-6 border-[#113357] rounded-b-xl flex flex-col justify-between p-2 bg-white">
                  <span className="text-[10px] text-[#64748B]">{slotLabel(a.startSlot)}</span>
                  <div className="text-center leading-tight">
                    <div className="text-xs font-semibold text-[#002446]">{a.plate}</div>
                    <div className="text-xs text-[#113357]">{a.province}</div>
                  </div>
                  <span className="text-[10px] text-[#64748B] text-right">{slotLabel(a.endSlot)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
