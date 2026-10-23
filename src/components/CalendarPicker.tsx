'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
export const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

export function pad(n: number) { return String(n).padStart(2, '0') }
export function fmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export function today() { return fmt(new Date()) }

const PRESETS = [
  { label: 'Hari Ini',  range: () => { const t = today(); return { from: t, to: t } } },
  { label: '7 Hari',    range: () => { const d = new Date(); d.setDate(d.getDate()-6); return { from: fmt(d), to: today() } } },
  { label: '30 Hari',   range: () => { const d = new Date(); d.setDate(d.getDate()-29); return { from: fmt(d), to: today() } } },
  { label: 'Bulan Ini', range: () => { const n = new Date(); return { from: `${n.getFullYear()}-${pad(n.getMonth()+1)}-01`, to: today() } } },
  { label: 'Tahun Ini', range: () => { return { from: `${new Date().getFullYear()}-01-01`, to: today() } } },
]

export function formatDisplayRange(from: string, to: string) {
  if (!from || !to) return 'Pilih Periode'
  const f = new Date(from), t = new Date(to)
  const df = `${f.getDate()} ${MONTHS_ID[f.getMonth()].slice(0,3)} ${f.getFullYear()}`
  const dt = `${t.getDate()} ${MONTHS_ID[t.getMonth()].slice(0,3)} ${t.getFullYear()}`
  return from === to ? df : `${df} – ${dt}`
}

interface CalendarPickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  onClose: () => void
}

export function CalendarPicker({ from, to, onChange, onClose }: CalendarPickerProps) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(from ? new Date(from).getFullYear() : now.getFullYear())
  const [viewMonth, setViewMonth] = useState(from ? new Date(from).getMonth() : now.getMonth())
  const [picking, setPicking] = useState<'from' | 'to'>('from')
  const [tempFrom, setTempFrom] = useState(from)
  const [tempTo, setTempTo] = useState(to)

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const clickDay = (day: number) => {
    const d = `${viewYear}-${pad(viewMonth+1)}-${pad(day)}`
    if (picking === 'from') {
      setTempFrom(d); setTempTo(''); setPicking('to')
    } else {
      if (d < tempFrom) { setTempFrom(d); setTempTo(tempFrom) }
      else { setTempTo(d) }
      setPicking('from')
    }
  }

  const apply = () => {
    if (tempFrom && tempTo) onChange(tempFrom, tempTo)
    onClose()
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)]

  return (
    <div className="p-4 w-[300px]">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => { const r = p.range(); setTempFrom(r.from); setTempTo(r.to); onChange(r.from, r.to); onClose() }}
            className="rounded-full px-3 py-1 text-xs font-semibold bg-[#FFF8F0] text-gray-600 hover:bg-[#f0e8dc] transition border border-[#f0e8dc]"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#f0e8dc] transition"><ChevronLeft size={15} /></button>
        <span className="text-sm font-semibold text-gray-800">{MONTHS_ID[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#f0e8dc] transition"><ChevronRight size={15} /></button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS_ID.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const d = `${viewYear}-${pad(viewMonth+1)}-${pad(day)}`
          const isFrom = d === tempFrom
          const isTo = d === tempTo
          const inRange = tempFrom && tempTo && d > tempFrom && d < tempTo
          return (
            <button
              key={i}
              onClick={() => clickDay(day)}
              className={`text-xs py-1.5 rounded-lg font-medium transition ${
                isFrom || isTo ? 'bg-brand text-white' :
                inRange ? 'bg-brand/10 text-brand' :
                'hover:bg-[#f0e8dc] text-gray-700'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {(tempFrom || tempTo) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <input readOnly value={tempFrom} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-center bg-[#FFF8F0] outline-none" placeholder="Dari" />
          <span>–</span>
          <input readOnly value={tempTo} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-center bg-[#FFF8F0] outline-none" placeholder="Sampai" />
        </div>
      )}

      {tempFrom && tempTo && (
        <button onClick={apply} className="mt-3 w-full bg-brand text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-dark transition">
          Terapkan
        </button>
      )}

      <p className="mt-2 text-[10px] text-center text-gray-400">
        {picking === 'from' ? 'Klik tanggal mulai' : 'Klik tanggal akhir'}
      </p>
    </div>
  )
}
