/* eslint-disable react-hooks/static-components */
'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import CarImage from '@/public/car.png';
import apiClient from '@/services/apiClient';
import { useSearchParams, useRouter } from 'next/navigation';

type Technician = {
  employeeId: string;
  name: string;
  specialization: string;
};

type Part = {
  partId: string;
  name: string;
  stockQuantity: number;
  price: number;
  status: string;
};

type AppointmentData = {
  appointmentId?: string;
  appointmentDate: string;
  status: 'SCHEDULED' | 'POSTPONED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
};

type ServiceRequestData = {
  requestId: string;
  requestStatus: string;
  problemDescription: string;
  odometer: number;
  checkingDate: string;
  name: string;
  phone: string;
  email: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number | string;
  color: string;
  vehicleType: string;
};

export default function OperatingPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const validRoles = ['Admin', 'admin', 'technician', 'Technician'];
    if (!role || !validRoles.includes(role)) {
      alert('Access Denied: Only Admin and Technician are allowed.');
      router.push('/Login');
    }
  }, [router]);

  return (
    <Suspense fallback={<div className="rounded-lg flex items-center justify-center py-10 border border-slate-200"><span className="text-sm text-slate-400">Loading...</span></div>}>
      <OperatingPageContent />
    </Suspense>
  );
}

function OperatingPageContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const [data, setData] = useState<ServiceRequestData | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData>({
    appointmentDate: '',
    status: 'SCHEDULED',
    notes: '',
  });
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [otherItems, setOtherItems] = useState<OtherService[]>([]);

  const formatDateFromBackend = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return appointment.appointmentDate;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear() + 543}`;
  };

  const parseBEToISO = (value: string) => {
    const [d, m, y] = value.split('/').map(Number);
    if (!d || !m || !y) return new Date().toISOString();
    return new Date(y - 543, m - 1, d).toISOString();
  };

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: ServiceRequestData }>(`/service/service-request/${requestId}`)
      .then((res) => setData(res.data.data))
      .catch(() => {});

    apiClient
      .get<{ success: boolean; data: any[] }>(`/service/${requestId}/service-jobs`)
      .then((res) => {
        let jobIndex = 0;
        let otherIndex = 0;
        const serviceJobs: ServiceJob[] = [];
        const serviceOthers: OtherService[] = [];

        res.data.data.forEach((item) => {
          const technicians = (item.technicians || []).map((tech: any) => ({
            employeeId: tech.employeeId,
            name: tech.name,
          }));

          if (item.service_type === 'otherjob') {
            otherIndex += 1;
            serviceOthers.push({
              id: otherIndex,
              serviceId: item.service_id,
              dateStart: item.start_time || '',
              dateEnd: item.end_time || '',
              status: (item.service_status as OtherService['status']) || 'In Progress',
              services: item.service_details ? String(item.service_details).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              technicians,
            });
          } else {
            jobIndex += 1;
            serviceJobs.push({
              id: jobIndex,
              serviceId: item.service_id,
              detail: item.service_details || '',
              timeStart: item.start_time || '',
              timeEnd: item.end_time || '',
              status: (item.service_status as ServiceJob['status']) || 'In Progress',
              parts: (item.parts || []).map((part: any) => ({
                partId: part.partId,
                name: part.partName,
                qty: part.quantity,
                price: Number(part.price),
                stockQuantity: part.stockQuantity,
              })),
              technicians,
            });
          }
        });

        setJobs(serviceJobs);
        setOtherItems(serviceOthers);
      })
      .catch(() => {
        setJobs([]);
        setOtherItems([]);
      });

    apiClient
      .get<{ message: string; data: any[] }>(`/appointments/request/${requestId}`)
      .then((res) => {
        const appointmentData = res.data.data[0];
        if (!appointmentData) return;

        setAppointment({
          appointmentId: appointmentData.appointmentId,
          appointmentDate: formatDateFromBackend(appointmentData.appointmentDate),
          status: appointmentData.appointStatus || 'SCHEDULED',
          notes: appointmentData.notes || '',
        });
      })
      .catch(() => {});
  }, [requestId]);

  const handleSaveAppointment = async (updated: AppointmentData) => {
    const body: Record<string, unknown> = {
      status: updated.status,
      notes: updated.notes || '',
    };

    if (!updated.appointmentDate) {
      throw new Error('Appointment date is required');
    }

    if (updated.status === 'POSTPONED' || updated.status === 'SCHEDULED') {
      body.appointment_date = parseBEToISO(updated.appointmentDate);
    }

    if (updated.appointmentId) {
      const { data: res } = await apiClient.put(`/appointments/${updated.appointmentId}`, body);
      const saved = res.data.data;
      setAppointment({
        appointmentId: saved.appointmentId || updated.appointmentId,
        appointmentDate: formatDateFromBackend(saved.appointmentDate),
        status: saved.appointStatus || updated.status,
        notes: saved.notes || updated.notes,
      });
      return;
    }

    const { data: res } = await apiClient.post('/appointments', {
      request_id: requestId,
      appointment_date: parseBEToISO(updated.appointmentDate),
      notes: updated.notes || '',
    });
    const saved = res.data.data;
    setAppointment({
      appointmentId: saved.appointmentId,
      appointmentDate: formatDateFromBackend(saved.appointmentDate),
      status: saved.appointStatus || 'SCHEDULED',
      notes: saved.notes || updated.notes,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>Operating</h1>
      </div>

      {data === null ? (
        <div
          className="rounded-lg flex items-center justify-center py-10"
          style={{ backgroundColor: 'transparent', border: '1px solid #E2E8F0' }}
        >
          <span className="text-sm text-slate-400">Loading...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4">

            {/* แผ่น 1: ป้ายทะเบียน */}
            <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center px-6 py-2 min-w-90">
              <div className="text-4xl font-bold text-slate-800">{data.plateNumber}</div>
            </div>

            {/* แผ่น 2: รูปรถ */}
            <div className="bg-white rounded-xl flex items-center justify-center px-6 py-4 flex-1"
              style={{ backgroundColor: 'transparent' }}>
              <Image src={CarImage} alt="car" height={100} style={{ height: '100px', width: 'auto' }} />
            </div>

            {/* แผ่น 3: ข้อมูลลูกค้า */}
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 w-120 shrink-0">
              <div className="font-semibold text-slate-800 mb-1">{data.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Vehicle Details</div>
              <div className="text-sm font-semibold text-slate-700 mb-3">
                {data.brand} {data.model} {data.year} ({data.color})
              </div>
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">{data.problemDescription}</div>
            </div>

          </div>

          {/* Service Job & Other Service */}
          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
            <ServiceJobSection jobs={jobs} setJobs={setJobs} requestId={requestId} />
            <OtherServiceSection items={otherItems} setItems={setOtherItems} requestId={requestId} />
          </div>

          {/* Appointment Card */}
          <AppointmentCard data={data} appointment={appointment} onSave={handleSaveAppointment} />

          {/* Invoice Card */}
          <InvoiceCard data={data} jobs={jobs} otherItems={otherItems} requestId={requestId} />

        </div>
      )}
    </div>
  );
}

function InvoiceCard({ jobs, otherItems, requestId }: { data: ServiceRequestData | null; jobs: ServiceJob[]; otherItems: OtherService[]; requestId: string }) {
  const [isSending, setIsSending] = useState(false);
  const [sentToClerk, setSentToClerk] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const partsMap = new Map<string, { qty: number; price: number; stockQuantity: number }>();
  for (const job of jobs) {
    for (const p of job.parts) {
      const existing = partsMap.get(p.name);
      if (existing) existing.qty += p.qty;
      else partsMap.set(p.name, { qty: p.qty, price: p.price, stockQuantity: p.stockQuantity });
    }
  }
  const partRows = Array.from(partsMap.entries()).map(([name, v]) => ({ name, ...v }));

  const serviceMap = new Map<string, number>();
  for (const item of otherItems) {
    for (const svcName of item.services) {
      const mock = MOCK_SERVICES.find(m => m.name === svcName);
      const price = mock?.price ?? 0;
      serviceMap.set(svcName, (serviceMap.get(svcName) ?? 0) + price);
    }
  }
  const serviceRows = Array.from(serviceMap.entries()).map(([name, price]) => ({ name, price }));

  const allTechIds = new Set<string>();
  for (const job of jobs) job.technicians.forEach(t => allTechIds.add(t.employeeId));
  for (const item of otherItems) item.technicians.forEach(t => allTechIds.add(t.employeeId));
  const techCount = allTechIds.size;
  const laborCost = techCount * 400;

  const partsTotal = partRows.reduce((sum, r) => sum + r.price * r.qty, 0);
  const servicesTotal = serviceRows.reduce((sum, r) => sum + r.price, 0);
  const subtotal = partsTotal + servicesTotal + laborCost;
  const tax = subtotal * 0.07;
  const grand = subtotal + tax;

  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });

  const lineItems = [
    ...partRows.map((r) => ({ details: `อะไหล่ ${r.name} x${r.qty} @ ${fmt(r.price)}`, amount: r.price * r.qty })),
    ...serviceRows.map((r) => ({ details: `งาน ${r.name}`, amount: r.price })),
  ];

  if (laborCost > 0) {
    lineItems.push({ details: `ค่าแรง (${techCount} คน)`, amount: laborCost });
  }

  if (tax > 0) {
    lineItems.push({ details: 'ภาษี 7%', amount: tax });
  }

  const canSendInvoice =
    jobs.length > 0 &&
    jobs.every((job) => job.status === 'Done') &&
    otherItems.every((item) => item.status === 'Done');

  const handleSendToClerk = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      await apiClient.post('/invoices', {
        request_id: requestId,
        payment_status: 'Unpaid',
        total_amount: grand,
        details: lineItems,
      });
      await apiClient.patch(`/service/service-request/${requestId}/status`, { status: 'Complete' });
      setSentToClerk(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send invoice';
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-slate-800 text-base">Invoice</div>
        <button
          onClick={handleSendToClerk}
          disabled={isSending || sentToClerk || !canSendInvoice}
          className={`text-xs font-semibold text-white px-4 py-2 rounded-lg ${sentToClerk || !canSendInvoice ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'}`}
        >
          {sentToClerk ? 'Sent to Clerk' : isSending ? 'Sending...' : 'Send to Clerk'}
        </button>
      </div>
      {sendError && (
        <div className="mb-3 text-xs text-red-600">{sendError}</div>
      )}
      <div className="rounded-xl overflow-hidden border border-blue-100">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-semibold" style={{ backgroundColor: '#AFDCF7' }}>
          <span>Part Name</span>
          <span className="text-center">Stock Qty</span>
          <span className="text-center">Qty used</span>
          <span className="text-right">Price</span>
        </div>
        {partRows.length === 0 ? (
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-3 text-sm text-slate-400" style={{ backgroundColor: '#E1F4FF' }}>
            <span /><span /><span /><span className="text-right">-</span>
          </div>
        ) : (
          partRows.map((r, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-1.5 text-sm text-slate-700" style={{ backgroundColor: '#E1F4FF' }}>
              <span>• {r.name}</span>
              <span className="text-center">{r.stockQuantity}</span>
              <span className="text-center">{r.qty}</span>
              <span className="text-right">{fmt(r.price * r.qty)}</span>
            </div>
          ))
        )}
        {serviceRows.map((r, i) => (
          <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-5 py-1.5 text-sm text-slate-700" style={{ backgroundColor: '#D9EDF8' }}>
            <span>• {r.name}</span>
            <span /><span />
            <span className="text-right">{fmt(r.price)}</span>
          </div>
        ))}
        <div className="px-5 pt-2 pb-3 bg-white border-t border-blue-100 space-y-0.5">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-sm text-slate-700">
            <span>ค่าแรงรวม {techCount > 0 && <span className="text-slate-400 text-xs">(จำนวน {techCount} คน × 400)</span>}</span>
            <span /><span />
            <span className="text-right">{fmt(laborCost)}</span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-sm text-slate-700">
            <span>ภาษี (7%)</span>
            <span /><span />
            <span className="text-right">{fmt(tax)}</span>
          </div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-sm font-semibold text-slate-800">
            <span>สรุปรายการ</span>
            <span /><span />
            <span className="text-right">{fmt(grand)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatePicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parseBE = (v: string) => {
    const [d, m, y] = v.split('/').map(Number);
    if (!d || !m || !y) return new Date();
    return new Date(y - 543, m - 1, d);
  };

  const formatBE = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear() + 543}`;

  const selected = parseBE(value || `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear() + 543}`);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const thaiMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`w-28 text-center text-sm rounded-lg border border-blue-200 bg-white px-2 py-1 outline-none ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'hover:border-blue-400 cursor-pointer'}`}
      >
        {value || 'เลือกวันที่'}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-56">
          <div className="flex items-center justify-between mb-2 text-sm font-semibold text-slate-700">
            <button onClick={prevMonth} className="px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer">‹</button>
            <span>{thaiMonths[viewMonth]} {viewYear + 543}</span>
            <button onClick={nextMonth} className="px-2 py-0.5 rounded hover:bg-slate-100 cursor-pointer">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 mb-1">
            {['อา','จ','อ','พ','พฤ','ศ','ส'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 text-center text-xs gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSel = selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
              return (
                <button
                  key={day}
                  onClick={() => { onChange(formatBE(new Date(viewYear, viewMonth, day))); setOpen(false); }}
                  className={`py-1 rounded-full text-[11px] leading-tight cursor-pointer ${isSel ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ data, appointment, onSave }: { data: ServiceRequestData; appointment: AppointmentData; onSave: (appointment: AppointmentData) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(!appointment.appointmentId);
  const [appt, setAppt] = useState<AppointmentData>(appointment);

  useEffect(() => {
    setAppt(appointment);
    setIsEditing(!appointment.appointmentId);
  }, [appointment]);

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );

  const DatePickerBox = ({ value, onChange }: { value: string; onChange: (v: string) => void }) =>
    isEditing
      ? <DatePicker value={value} onChange={onChange} />
      : <span className="inline-flex items-center justify-center w-28 rounded-lg bg-white border border-slate-200 text-sm text-slate-500 py-1">{value || '-'}</span>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-slate-800 text-base">Appointment</div>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="rounded-xl border border-slate-100 p-4 space-y-4" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Row 1 */}
        <div className="grid grid-cols-[1fr_0.8fr_0.8fr_2fr] gap-4 items-start">
          <Field label="Name" value={data.name} />
          <Field label="Model" value={data.model} />
          <Field label="Color" value={data.color} />
          <div className="w-full">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Appointment</div>
            <div className="flex items-center gap-2 flex-wrap text-sm text-slate-700">
              <span>วันนัด :</span>
              <DatePickerBox value={appt.appointmentDate} onChange={(v) => setAppt({ ...appt, appointmentDate: v })} />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-[1fr_0.8fr_0.8fr_2fr] gap-4 items-start">
          <Field label="Plate Number" value={data.plateNumber} />
          <Field label="Brand" value={data.brand} />
          <Field label="Year" value={String(data.year)} />
          <Field label="Car Type" value="Four Wheel" />
        </div>
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Status</div>
          <select
            value={appt.status}
            disabled={!isEditing}
            onChange={(e) => setAppt({ ...appt, status: e.target.value as AppointmentData['status'] })}
            className={`w-full rounded-lg border border-blue-200 px-3 py-2 outline-none ${isEditing ? 'bg-white' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}
          >
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="POSTPONED">POSTPONED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Notes</div>
          <textarea
            value={appt.notes || ''}
            onChange={(e) => setAppt({ ...appt, notes: e.target.value })}
            disabled={!isEditing}
            className={`w-full min-h-[80px] rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none ${isEditing ? 'bg-white' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}
            placeholder="เพิ่มหมายเหตุ..."
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onSave(appt).then(() => setIsEditing(false)).catch(() => {})}
            disabled={!isEditing}
            className={`text-xs font-semibold text-white px-5 py-2 rounded-lg ${isEditing ? 'bg-blue-700 cursor-pointer' : 'bg-slate-400 cursor-not-allowed'}`}
          >
            {appt.appointmentId ? 'บันทึก' : 'สร้าง'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Service Job ──────────────────────────────────────────────────────────────

type ServiceJob = {
  id: number;
  serviceId?: string;
  detail: string;
  timeStart: string;
  timeEnd: string;
  status: 'In Progress' | 'Done' | 'Pending';
  parts: { partId: string; name: string; qty: number; price: number; stockQuantity: number }[];
  technicians: { employeeId: string; name: string }[];
};


const MOCK_SERVICES = [
  { name: 'ล้างรถ',              price: 300  },
  { name: 'เคลือบสี',            price: 2500 },
  { name: 'ดูดฝุ่นภายใน',        price: 200  },
  { name: 'เปลี่ยนน้ำมันเกียร์', price: 800  },
  { name: 'ตรวจเช็คระบบเบรก',   price: 500  },
];

function TechnicianPickerModal({ onAdd, onClose, assignedIds = [] }: { onAdd: (tech: { employeeId: string; name: string }) => void; onClose: () => void; assignedIds?: string[] }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get<{ data: Technician[] }>('/technicians/available')
      .then(res => setTechnicians(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = technicians.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeId.includes(search) ||
    t.specialization.toLowerCase().includes(search.toLowerCase())
  );
  const selectedTech = technicians.find(t => t.employeeId === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
      <div ref={ref} className="bg-white rounded-2xl shadow-xl w-120 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#F1F5F9' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาช่าง..."
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
          {filtered.map(t => {
            const isAssigned = assignedIds.includes(t.employeeId);
            return (
              <button
                key={t.employeeId}
                onClick={() => !isAssigned && setSelected(t.employeeId)}
                disabled={isAssigned}
                className={`w-full text-left px-4 py-3 transition-colors ${isAssigned ? 'cursor-not-allowed' : 'cursor-pointer'} ${isAssigned ? '' : selected === t.employeeId ? '' : 'hover:bg-slate-50'}`}
                style={isAssigned ? { backgroundColor: '#F1F5F9' } : selected === t.employeeId ? { backgroundColor: '#E6F6FF' } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isAssigned ? 'text-slate-300' : selected === t.employeeId ? 'text-blue-800' : 'text-slate-800'}`}>{t.name}</span>
                  <span className={`text-xs ${isAssigned ? 'text-slate-300' : 'text-slate-400'}`}>{t.employeeId}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{t.specialization}</div>
              </button>
            );
          })}
          {filtered.length === 0 && <div className="px-4 py-6 text-sm text-slate-300 text-center">ไม่พบรายการ</div>}
        </div>
        {selectedTech && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-800">{selectedTech.name}</div>
              <div className="text-xs text-slate-400">{selectedTech.specialization}</div>
            </div>
            <button
              onClick={() => { onAdd({ employeeId: selectedTech.employeeId, name: selectedTech.name }); onClose(); }}
              className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: '#1D4ED8' }}
            >
              เพิ่ม
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ServicePickerModal({ onAdd, onClose }: { onAdd: (name: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = MOCK_SERVICES.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
      <div ref={ref} className="bg-white rounded-2xl shadow-xl w-120 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#F1F5F9' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา Service..."
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
          {filtered.map(s => (
            <button
              key={s.name}
              onClick={() => setSelected(s.name)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer ${selected === s.name ? 'font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              style={selected === s.name ? { backgroundColor: '#E6F6FF', color: '#1E3A8A' } : {}}
            >
              {s.name}
            </button>
          ))}
          {filtered.length === 0 && <div className="px-4 py-6 text-sm text-slate-300 text-center">ไม่พบรายการ</div>}
        </div>
        {selected && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{selected}</span>
            <button
              onClick={() => { onAdd(selected); onClose(); }}
              className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: '#1D4ED8' }}
            >
              เพิ่ม
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PartPickerModal({ onAdd, onClose }: { onAdd: (part: Part, qty: number) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Part | null>(null);
  const [qty, setQty] = useState(1);
  const [parts, setParts] = useState<Part[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get<{ data: Part[] }>('/service/parts')
      .then(res => setParts(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = parts.filter((p: Part) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
      <div ref={ref} className="bg-white rounded-2xl shadow-xl w-120 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: '#F1F5F9' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slate-400 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา Part..."
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
          {filtered.map(p => (
            <button
              key={p.partId}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${selected?.partId === p.partId ? 'font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              style={selected?.partId === p.partId ? { backgroundColor: '#E6F6FF', color: '#1E3A8A' } : {}}
            >
              {p.name}
            </button>
          ))}
          {filtered.length === 0 && <div className="px-4 py-6 text-sm text-slate-300 text-center">ไม่พบรายการ</div>}
        </div>
        {selected && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-3">
            <span className="text-xs text-slate-500 flex-1 truncate">{selected.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer">−</button>
              <span className="text-sm font-semibold w-5 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer">+</button>
            </div>
            <button
              onClick={() => { onAdd(selected, qty); onClose(); }}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: '#1D4ED8' }}
            >
              เพิ่ม
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceJobSection({ jobs, setJobs, requestId }: { jobs: ServiceJob[]; setJobs: React.Dispatch<React.SetStateAction<ServiceJob[]>>; requestId: string }) {
  const addJob = () =>
    setJobs(prev => [...prev, {
      id: prev.length + 1,
      detail: '',
      timeStart: '',
      timeEnd: '',
      status: 'In Progress',
      parts: [],
      technicians: [],
    }]);

  const updateJob = (id: number, updated: ServiceJob) =>
    setJobs(prev => prev.map(j => (j.id === id ? updated : j)));

  const handleSaveJob = async (job: ServiceJob): Promise<void> => {
    const laborCost = job.technicians.length * 200;
    const jobPayload = {
      service_details: job.detail,
      job_status: job.status,
      labor_cost: laborCost,
      start_time: job.timeStart || null,
      end_time: job.timeEnd || null,
    };

    if (job.serviceId) {
      await Promise.all([
        apiClient.put(`/service/service-job/${job.serviceId}`, jobPayload),
        apiClient.put(`/service/service-job/${job.serviceId}/parts`, {
          parts: job.parts.map(p => ({ part_id: p.partId, quantity: p.qty })),
        }),
        apiClient.put(`/service/service-job/${job.serviceId}/assign`, {
          technicianIds: job.technicians.map(t => t.employeeId),
        }),
      ]);
      return;
    }

    const { data: res } = await apiClient.post(`/service/${requestId}/service-job`, {
      service_type: 'repair',
      ...jobPayload,
      service_status: job.status,
    });
    const jobId: string = res.data.service_id;

    setJobs(prev => prev.map(j => (j.id === job.id ? { ...j, serviceId: jobId } : j)));

    await Promise.all([
      apiClient.put(`/service/service-job/${jobId}/parts`, {
        parts: job.parts.map(p => ({ part_id: p.partId, quantity: p.qty })),
      }),
      apiClient.put(`/service/service-job/${jobId}/assign`, {
        technicianIds: job.technicians.map(t => t.employeeId),
      }),
    ]);
  };

  return (
    <div className="mb-5">
      <div className="font-bold text-slate-800 mb-3">Service Job</div>
      {jobs.length === 0 && (
        <div className="rounded-lg border border-slate-200 flex items-center justify-center py-7 mb-3">
          <span className="text-sm text-slate-300">Nothing yet</span>
        </div>
      )}
      <div className="space-y-3 mb-3">
        {jobs.map(job => (
          <ServiceJobCard
            key={job.id}
            job={job}
            onChange={updated => updateJob(job.id, updated)}
            onDelete={async () => {
              try {
                if (job.serviceId) {
                  await apiClient.delete(`/service/service-job/${job.serviceId}`);
                }
                setJobs(prev => prev.filter(j => j.id !== job.id));
              } catch (error) {
                console.error(error);
                window.alert('ไม่สามารถลบ service job ได้');
              }
            }}
            onSave={handleSaveJob}
          />
        ))}
      </div>
      <button
        onClick={addJob}
        className="w-full py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
        style={{ background: 'linear-gradient(to right, #002446, #1A3A5F)' }}
      >
        + Add Service Job Detail
      </button>
    </div>
  );
}

const handleSubmit = () => {
  // Here you would typically gather all the data and send it to your backend API
  alert('Data submitted! Check console for details.');
}

function ServiceJobCard({ job, onChange, onDelete, onSave }: { job: ServiceJob; onChange: (j: ServiceJob) => void; onDelete: () => Promise<void>; onSave: (job: ServiceJob) => Promise<void> }) {
  const [showPartModal, setShowPartModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [isEditing, setIsEditing] = useState(!job.serviceId);

  useEffect(() => {
    setIsEditing(!job.serviceId);
  }, [job.serviceId]);

  const statusColors: Record<ServiceJob['status'], string> = {
    'In Progress': '#FEF3C7',
    'Done': '#D1FAE5',
    'Pending': '#F1F5F9',
  };
  const statusTextColors: Record<ServiceJob['status'], string> = {
    'In Progress': '#92400E',
    'Done': '#065F46',
    'Pending': '#475569',
  };

  return (
    <div className="rounded-xl border border-blue-100 overflow-hidden" style={{ backgroundColor: '#E6F6FF' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <span className="font-bold text-slate-800 text-sm">Service Job detail {job.id}</span>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer" title="ลบ">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
        {job.serviceId && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-slate-700 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            แก้ไข
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-slate-400">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7.5 4.5V7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-red-400 -ml-1">*</span>
          <DatePicker value={job.timeStart} onChange={v => onChange({ ...job, timeStart: v })} disabled={!isEditing} />
          <span className="text-slate-400">-</span>
          <DatePicker value={job.timeEnd} onChange={v => onChange({ ...job, timeEnd: v })} disabled={!isEditing} />
          <select
            value={job.status}
            onChange={e => onChange({ ...job, status: e.target.value as ServiceJob['status'] })}
            disabled={!isEditing}
            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 outline-none ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            style={{ backgroundColor: statusColors[job.status], color: statusTextColors[job.status] }}
          >
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="text-xs font-semibold text-slate-600 mb-1">Detail <span className="text-red-400">*</span></div>
        <input
          value={job.detail}
          onChange={e => onChange({ ...job, detail: e.target.value })}
          placeholder="รายละเอียดงาน..."
          disabled={!isEditing}
          className={`w-full text-sm rounded-lg border border-blue-200 px-3 py-2 outline-none ${isEditing ? 'bg-white focus:border-blue-400' : 'bg-slate-100 text-slate-500 cursor-not-allowed'}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <div>
          {showPartModal && (
            <PartPickerModal
              onAdd={(part, qty) => {
                const existing = job.parts.findIndex(p => p.name === part.name);
                if (existing >= 0) {
                  const updated = job.parts.map((p, i) => i === existing ? { ...p, qty: p.qty + qty } : p);
                  onChange({ ...job, parts: updated });
                } else {
                  onChange({ ...job, parts: [...job.parts, { partId: part.partId, name: part.name, qty, price: part.price, stockQuantity: part.stockQuantity }] });
                }
              }}
              onClose={() => setShowPartModal(false)}
            />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Part <span className="text-red-400">*</span></span>
            {isEditing && (
              <button onClick={() => setShowPartModal(true)} className="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer" style={{ backgroundColor: '#97D2FF', color: '#1E3A8A' }}>
                + Add Part
              </button>
            )}
          </div>
          <div className="rounded-lg border border-blue-100 bg-white min-h-0 divide-y divide-blue-50">
            {job.parts.length === 0 && <span className="text-xs text-slate-300 p-2 block">ยังไม่มี Part</span>}
            {job.parts.map((p, i) => (
              <div key={i} className="text-xs text-slate-700 flex items-center justify-between px-2 py-2">
                <span><span className="text-slate-400 mr-1">•</span>{p.name} <span className="text-slate-400">×{p.qty}</span></span>
                {isEditing && (
                  <button onClick={() => onChange({ ...job, parts: job.parts.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-400 ml-2 cursor-pointer">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {showTechModal && (
            <TechnicianPickerModal
              onAdd={tech => onChange({ ...job, technicians: [...job.technicians, tech] })}
              onClose={() => setShowTechModal(false)}
              assignedIds={job.technicians.map(t => t.employeeId)}
            />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Assignment <span className="text-red-400">*</span></span>
            {isEditing && (
              <button onClick={() => setShowTechModal(true)} className="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer" style={{ backgroundColor: '#97D2FF', color: '#1E3A8A' }}>
                + Add Technician
              </button>
            )}
          </div>
          <div className="rounded-lg border border-blue-100 overflow-hidden">
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 py-1.5" style={{ backgroundColor: '#97D2FF' }}>
              <span>ID</span>
              <span>Name</span>
            </div>
            {job.technicians.length === 0 ? (
              <div className="grid grid-cols-2 px-3 py-2 text-xs text-slate-300 bg-white">
                <span>ID</span><span>ชื่อช่าง</span>
              </div>
            ) : (
              job.technicians.map((t, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-1.5 text-xs text-slate-700 bg-white border-t border-blue-50">
                  <span>{t.employeeId}</span>
                  <span className="flex items-center justify-between">
                    {t.name}
                    {isEditing && (
                      <button onClick={() => onChange({ ...job, technicians: job.technicians.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-400 cursor-pointer">✕</button>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex justify-end gap-2">
        <button
          onClick={() => onSave(job).then(() => { if (job.serviceId) setIsEditing(false); })}
          disabled={!isEditing}
          className={`text-xs font-semibold text-white px-5 py-2 rounded-lg ${isEditing ? 'cursor-pointer bg-blue-700' : 'cursor-not-allowed bg-slate-400'}`}
          style={{ backgroundColor: isEditing ? '#1D4ED8' : undefined }}
        >
          {job.serviceId ? 'บันทึก' : 'สร้าง'}
        </button>
      </div> {/* //พอพร้อมจะ connect API จริงค่อยแทนที่ตรง 612 ได้` */}
    </div>
  );
}

// ─── Other Service ────────────────────────────────────────────────────────────

type OtherService = {
  id: number;
  serviceId?: string;
  dateStart: string;
  dateEnd: string;
  status: 'In Progress' | 'Done' | 'Pending';
  services: string[];
  technicians: { employeeId: string; name: string }[];
};

function OtherServiceSection({ items, setItems, requestId }: { items: OtherService[]; setItems: React.Dispatch<React.SetStateAction<OtherService[]>>; requestId: string }) {
  const addItem = () =>
    setItems(prev => [...prev, {
      id: prev.length + 1,
      dateStart: '', dateEnd: '',
      status: 'In Progress',
      services: [], technicians: [],
    }]);

  const updateItem = (id: number, updated: OtherService) =>
    setItems(prev => prev.map(s => (s.id === id ? updated : s)));

  const handleSave = async (item: OtherService) => {
    const laborCost = item.technicians.length * 200;
    const payload = {
      service_type: 'otherjob',
      service_details: item.services.join(', '),
      start_time: item.dateStart || null,
      end_time: item.dateEnd || null,
      service_status: item.status,
      labor_cost: laborCost,
    };

    if (item.serviceId) {
      await Promise.all([
        apiClient.put(`/service/service-job/${item.serviceId}`, payload),
        apiClient.put(`/service/service-job/${item.serviceId}/assign`, {
          technicianIds: item.technicians.map(t => t.employeeId),
        }),
      ]);
      return;
    }

    const { data: res } = await apiClient.post(`/service/${requestId}/service-job`, payload);
    const serviceId: string = res.data.service_id;
    setItems(prev => prev.map(s => (s.id === item.id ? { ...s, serviceId } : s)));

    await apiClient.put(`/service/service-job/${serviceId}/assign`, {
      technicianIds: item.technicians.map(t => t.employeeId),
    });
  };

  return (
    <div>
      <div className="font-bold text-slate-800 mb-3">Other Service</div>
      {items.length === 0 && (
        <div className="rounded-lg border border-slate-200 flex items-center justify-center py-7 mb-3">
          <span className="text-sm text-slate-300">Nothing yet</span>
        </div>
      )}
      <div className="space-y-3 mb-3">
        {items.map(item => (
          <OtherServiceCard
            key={item.id}
            item={item}
            onChange={updated => updateItem(item.id, updated)}
            onDelete={async () => {
              try {
                if (item.serviceId) {
                  await apiClient.delete(`/service/service-job/${item.serviceId}`);
                }
                setItems(prev => prev.filter(s => s.id !== item.id));
              } catch (error) {
                console.error(error);
                window.alert('ไม่สามารถลบ service ได้');
              }
            }}
            onSave={handleSave}
          />
        ))}
      </div>
      <button
        onClick={addItem}
        className="w-full py-3 rounded-lg text-sm font-semibold text-white cursor-pointer"
        style={{ background: 'linear-gradient(to right, #002446, #1A3A5F)' }}
      >
        + Add Service
      </button>
    </div>
  );
}

function OtherServiceCard({ item, onChange, onDelete, onSave }: { item: OtherService; onChange: (s: OtherService) => void; onDelete: () => Promise<void>; onSave: (item: OtherService) => Promise<void>; }) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [isEditing, setIsEditing] = useState(!item.serviceId);

  useEffect(() => {
    setIsEditing(!item.serviceId);
  }, [item.serviceId]);

  const statusColors: Record<OtherService['status'], string> = {
    'In Progress': '#FEF3C7', 'Done': '#D1FAE5', 'Pending': '#F1F5F9',
  };
  const statusTextColors: Record<OtherService['status'], string> = {
    'In Progress': '#92400E', 'Done': '#065F46', 'Pending': '#475569',
  };

  return (
    <div className="rounded-xl border border-blue-100 overflow-hidden" style={{ backgroundColor: '#E6F6FF' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <span className="font-bold text-slate-800 text-sm">Service {item.id}</span>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-slate-400">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 4.5V7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-red-400 -ml-1">*</span>
          <DatePicker value={item.dateStart} onChange={v => onChange({ ...item, dateStart: v })} disabled={!isEditing} />
          <span className="text-slate-400">-</span>
          <DatePicker value={item.dateEnd} onChange={v => onChange({ ...item, dateEnd: v })} disabled={!isEditing} />
          <select value={item.status} onChange={e => onChange({ ...item, status: e.target.value as OtherService['status'] })}
            disabled={!isEditing}
            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 outline-none ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            style={{ backgroundColor: statusColors[item.status], color: statusTextColors[item.status] }}>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Pending">Pending</option>
          </select>
          {item.serviceId && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-slate-700 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              แก้ไข
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <div>
          {showServiceModal && (
            <ServicePickerModal
              onAdd={name => onChange({ ...item, services: [...item.services, name] })}
              onClose={() => setShowServiceModal(false)}
            />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Service <span className="text-red-400">*</span></span>
            {isEditing && (
              <button onClick={() => setShowServiceModal(true)} className="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer" style={{ backgroundColor: '#97D2FF', color: '#1E3A8A' }}>
                + Add Service
              </button>
            )}
          </div>
          <div className="rounded-lg border border-blue-100 bg-white min-h-0 divide-y divide-blue-50">
            {item.services.length === 0 && <span className="text-xs text-slate-300 p-2 block">ยังไม่มีรายการ</span>}
            {item.services.map((s, i) => (
              <div key={i} className="text-xs text-slate-700 flex items-center justify-between px-2 py-2">
                <span>{s}</span>
                {isEditing && (
                  <button onClick={() => onChange({ ...item, services: item.services.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-400 ml-2 cursor-pointer">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {showTechModal && (
            <TechnicianPickerModal
              onAdd={tech => onChange({ ...item, technicians: [...item.technicians, tech] })}
              onClose={() => setShowTechModal(false)}
              assignedIds={item.technicians.map(t => t.employeeId)}
            />
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Assignment <span className="text-red-400">*</span></span>
            {isEditing && (
              <button onClick={() => setShowTechModal(true)} className="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer" style={{ backgroundColor: '#97D2FF', color: '#1E3A8A' }}>
                + Add Technician
              </button>
            )}
          </div>
          <div className="rounded-lg border border-blue-100 overflow-hidden">
            <div className="grid grid-cols-2 text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 py-1.5" style={{ backgroundColor: '#97D2FF' }}>
              <span>ID</span><span>Name</span>
            </div>
            {item.technicians.length === 0 ? (
              <div className="grid grid-cols-2 px-3 py-2 text-xs text-slate-300 bg-white">
                <span>ID</span><span>ชื่อช่าง</span>
              </div>
            ) : (
              item.technicians.map((t, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-1.5 text-xs text-slate-700 bg-white border-t border-blue-50">
                  <span>{t.employeeId}</span>
                  <span className="flex items-center justify-between">
                    {t.name}
                    {isEditing && (
                      <button onClick={() => onChange({ ...item, technicians: item.technicians.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-red-400 cursor-pointer">✕</button>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex justify-end gap-2">
        <button
          onClick={() => onSave(item).then(() => { if (item.serviceId) setIsEditing(false); })}
          disabled={!isEditing}
          className={`text-xs font-semibold text-white px-5 py-2 rounded-lg ${isEditing ? 'cursor-pointer bg-blue-700' : 'cursor-not-allowed bg-slate-400'}`}
          style={{ backgroundColor: isEditing ? '#1D4ED8' : undefined }}
        >
          {item.serviceId ? 'บันทึก' : 'สร้าง'}
        </button>
      </div>
    </div>
  );
}
