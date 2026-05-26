"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import SquadChip from "@/components/squads/SquadChip";
import CalendarMonthGrid from "@/components/calendar/CalendarMonthGrid";
import CalendarWeekGrid from "@/components/calendar/CalendarWeekGrid";
import CreateEventModal from "@/components/calendar/CreateEventModal";
import EventDetailModal from "@/components/calendar/EventDetailModal";
import { CalendarEvent, CalendarView } from "@/types";
import { MOCK_EVENTS, MOCK_SQUADS } from "@/lib/mockData";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

let nextEventId = MOCK_EVENTS.length + 1;

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedSquadIds, setSelectedSquadIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Filter events by selected squads
  const filteredEvents = selectedSquadIds.length === 0
    ? events
    : events.filter(e => e.squadIds.some(id => selectedSquadIds.includes(id)));

  const toggleSquad = (id: string) =>
    setSelectedSquadIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const navigate = (dir: "prev" | "next") => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === "month") {
        d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
      } else {
        d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
      }
      return d;
    });
  };

  const handleDayClick = (date: Date) => {
    setCreateInitialDate(date);
    setCreateOpen(true);
  };

  const handleCreateSave = (data: Omit<CalendarEvent, "id">) => {
    setEvents(prev => [...prev, { id: `e${nextEventId++}`, ...data }]);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  const subtitle = view === "month"
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : (() => {
        const d = new Date(currentDate);
        const dow = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((dow + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return `${monday.getDate()} — ${sunday.getDate()} ${MONTH_NAMES[sunday.getMonth()]} ${sunday.getFullYear()}`;
      })();

  return (
    <>
      <Topbar
        title="Calendario"
        subtitle={subtitle}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Month/Week toggle */}
            <div style={{ display: "flex", background: "var(--pg-surface)", border: "1px solid var(--pg-border)", borderRadius: 7, overflow: "hidden" }}>
              {(["month", "week"] as CalendarView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: view === v ? "rgba(212,168,83,0.12)" : "transparent",
                    border: "none",
                    color: view === v ? "var(--pg-accent)" : "var(--pg-muted)",
                    transition: "all 0.1s",
                  }}
                >
                  {v === "month" ? "Mes" : "Semana"}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 2 }}>
              <button onClick={() => navigate("prev")} style={{ width: 28, height: 28, borderRadius: 6, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pg-muted)" }}>
                <ChevronLeft size={12} />
              </button>
              <button onClick={() => navigate("next")} style={{ width: 28, height: 28, borderRadius: 6, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pg-muted)" }}>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* New event */}
            <button
              onClick={() => { setCreateInitialDate(undefined); setCreateOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}
            >
              <Plus size={12} />
              Nuevo evento
            </button>
          </div>
        }
      />

      {/* Squad filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderBottom: "1px solid var(--pg-border)", background: "var(--pg-card)", overflowX: "auto", flexShrink: 0 }}>
        <button
          onClick={() => setSelectedSquadIds([])}
          style={{
            padding: "3px 9px",
            borderRadius: 12,
            fontSize: 10,
            fontWeight: selectedSquadIds.length === 0 ? 700 : 500,
            border: "1px solid var(--pg-border)",
            background: selectedSquadIds.length === 0 ? "rgba(212,168,83,0.12)" : "transparent",
            color: selectedSquadIds.length === 0 ? "var(--pg-accent)" : "var(--pg-muted)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Todos
        </button>
        {MOCK_SQUADS.map(squad => (
          <SquadChip
            key={squad.id}
            squad={squad}
            active={selectedSquadIds.includes(squad.id)}
            onClick={() => toggleSquad(squad.id)}
          />
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {view === "month" ? (
          <CalendarMonthGrid
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={setSelectedEvent}
          />
        ) : (
          <CalendarWeekGrid
            date={currentDate}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={setSelectedEvent}
          />
        )}
      </div>

      <CreateEventModal
        visible={createOpen}
        initial={createInitialDate ? { date: createInitialDate } : null}
        squads={MOCK_SQUADS}
        onSave={handleCreateSave}
        onClose={() => setCreateOpen(false)}
      />

      <EventDetailModal
        visible={selectedEvent !== null}
        event={selectedEvent}
        squads={MOCK_SQUADS}
        onDelete={handleDelete}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
