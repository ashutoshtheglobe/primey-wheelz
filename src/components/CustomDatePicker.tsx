"use client";

import React, { useState, useEffect } from "react";

export interface CustomDatePickerProps {
  value: string;
  onDateSelect: (dateStr: string) => void;
  onClose: () => void;
  align?: "left" | "right";
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  fullDate: string;
  isSelected: boolean;
}

export default function CustomDatePicker({
  value,
  onDateSelect,
  onClose,
  align = "right",
}: CustomDatePickerProps) {
  const currentYearNow = new Date().getFullYear();
  const [currentYear, setCurrentYear] = useState<number>(currentYearNow);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const years: number[] = [];
  for (let y = 1920; y <= currentYearNow + 15; y++) {
    years.push(y);
  }

  const formatDateStr = (year: number, monthIndex: number, day: number): string => {
    const mStr = String(monthIndex + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return `${dStr}/${mStr}/${year}`;
  };

  useEffect(() => {
    if (!value) return;
    const trimmed = value.trim();
    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[\/-]/);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    } else if (/^\d{4}[\/-]\d{2}[\/-]\d{2}$/.test(trimmed)) {
      const parts = trimmed.split(/[\/-]/);
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }
  }, [value]);

  const generateCalendar = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const fullDate = formatDateStr(prevYear, prevMonth, dayNum);
      days.push({
        date: dayNum,
        isCurrentMonth: false,
        fullDate,
        isSelected: fullDate === value,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const fullDate = formatDateStr(currentYear, currentMonth, d);
      days.push({
        date: d,
        isCurrentMonth: true,
        fullDate,
        isSelected: fullDate === value,
      });
    }

    // Next month overflow days
    const remaining = 42 - days.length;
    for (let j = 1; j <= remaining; j++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const fullDate = formatDateStr(nextYear, nextMonth, j);
      days.push({
        date: j,
        isCurrentMonth: false,
        fullDate,
        isSelected: fullDate === value,
      });
    }

    return days;
  };

  const calendarDays = generateCalendar();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const selectToday = () => {
    const today = new Date();
    const formatted = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    onDateSelect(formatted);
  };

  return (
    <div
      className={`absolute z-50 mt-1 top-full ${
        align === "left" ? "left-0" : "right-0"
      } w-72 bg-neutral-900 border border-white/20 rounded-xl shadow-2xl p-4 text-white text-xs`}
    >
      {/* Header controls */}
      <div className="flex items-center justify-between gap-1 mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-white/10 rounded transition text-gray-300 hover:text-white"
        >
          &lt;
        </button>

        <div className="flex items-center gap-1">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="bg-neutral-800 text-white rounded p-1 border border-white/10 text-xs focus:outline-none cursor-pointer"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-neutral-800 text-white rounded p-1 border border-white/10 text-xs focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-white/10 rounded transition text-gray-300 hover:text-white"
        >
          &gt;
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {calendarDays.map((d, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onDateSelect(d.fullDate)}
            className={`py-1.5 rounded transition ${
              d.isSelected
                ? "bg-[#FFB300] text-black font-bold"
                : d.isCurrentMonth
                ? "hover:bg-white/10 text-white"
                : "text-gray-600 hover:bg-white/5"
            }`}
          >
            {d.date}
          </button>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
        <button
          type="button"
          onClick={selectToday}
          className="text-amber-400 hover:underline"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onDateSelect("")}
          className="text-gray-400 hover:text-white"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
