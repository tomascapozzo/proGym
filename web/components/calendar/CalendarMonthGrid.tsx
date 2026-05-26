"use client";

import { CalendarEvent } from "@/types";
import CalendarEventPill from "./CalendarEventPill";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getDaysInGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const days: Date[] = [];
  for (let i = -startOffset; i < 42 - startOffset; i++) {
    days.push(new Date(year, month, 1 + i));
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarMonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarMonthGrid({ year, month, events, onDayClick, onEventClick }: CalendarMonthGridProps) {
  const days = getDaysInGrid(year, month);
  const today = new Date();

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--pg-border)", flexShrink: 0 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ padding: "6px 0", textAlign: "center", fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", fontWeight: 500 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — 6 rows */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: "repeat(6, 1fr)", overflow: "hidden" }}>
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const dayEvents = events.filter(e => isSameDay(new Date(e.startsAt), day));
          const overflow = dayEvents.length > 3;
          const visible = dayEvents.slice(0, 3);

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              style={{
                borderRight: i % 7 !== 6 ? "1px solid var(--pg-border)" : "none",
                borderBottom: i < 35 ? "1px solid var(--pg-border)" : "none",
                padding: "5px 6px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                opacity: isCurrentMonth ? 1 : 0.3,
                background: "transparent",
                transition: "background 0.1s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 1 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "var(--pg-accent-text)" : "var(--pg-muted)",
                  background: isToday ? "var(--pg-accent)" : "transparent",
                  flexShrink: 0,
                }}>
                  {day.getDate()}
                </span>
              </div>
              {visible.map(e => (
                <CalendarEventPill key={e.id} event={e} compact onClick={() => onEventClick(e)} />
              ))}
              {overflow && (
                <span style={{ fontSize: 8, color: "var(--pg-muted)", paddingLeft: 4 }}>
                  +{dayEvents.length - 3} más
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
