import { Squad, TeamPlayerWithSquads, CalendarEvent } from "@/types";

// ── Squads ────────────────────────────────────────────────────────────────────

export const MOCK_SQUADS: Squad[] = [
  { id: "s1", name: "Primera XV",   color: "green",  description: "Plantel principal", memberCount: 6 },
  { id: "s2", name: "Reservas",     color: "blue",   description: null,                memberCount: 5 },
  { id: "s3", name: "M20",          color: "amber",  description: "Menores de 20",     memberCount: 4 },
  { id: "s4", name: "M18",          color: "purple", description: "Menores de 18",     memberCount: 3 },
];

// ── Players (extends team page PLAYERS with squadIds) ────────────────────────

export const MOCK_PLAYERS: TeamPlayerWithSquads[] = [
  { id: "1",  userId: "u1",  fullName: "Martín García",     position: "Pilar",    jerseyNumber: 1,  avatarUrl: null, acwr: 1.1, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s1", "s2"] },
  { id: "2",  userId: "u2",  fullName: "Rodrigo López",     position: "Hooker",   jerseyNumber: 2,  avatarUrl: null, acwr: 1.6, weeklyCompliance: 3, weeklyAssigned: 5, status: "active",  squadIds: ["s1"]       },
  { id: "3",  userId: "u3",  fullName: "Nicolás Ferreyra",  position: "Segunda",  jerseyNumber: 4,  avatarUrl: null, acwr: 0.9, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s1", "s2"] },
  { id: "4",  userId: "u4",  fullName: "Pedro Acosta",      position: "Ala",      jerseyNumber: 6,  avatarUrl: null, acwr: 1.4, weeklyCompliance: 4, weeklyAssigned: 5, status: "active",  squadIds: ["s2", "s3"] },
  { id: "5",  userId: "u5",  fullName: "Javier Morales",    position: "Apertura", jerseyNumber: 10, avatarUrl: null, acwr: 0.7, weeklyCompliance: 2, weeklyAssigned: 5, status: "resting", squadIds: ["s3"]       },
  { id: "6",  userId: "u6",  fullName: "Carlos Rodríguez",  position: "Centro",   jerseyNumber: 12, avatarUrl: null, acwr: 1.2, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s1", "s2"] },
  { id: "7",  userId: "u7",  fullName: "Lucas Torres",      position: "Ala",      jerseyNumber: 11, avatarUrl: null, acwr: 1.1, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s1"]       },
  { id: "8",  userId: "u8",  fullName: "Felipe Méndez",     position: "Wing",     jerseyNumber: 14, avatarUrl: null, acwr: 1.3, weeklyCompliance: 4, weeklyAssigned: 5, status: "active",  squadIds: ["s2", "s4"] },
  { id: "9",  userId: "u9",  fullName: "Gonzalo Torres",    position: "Medio",    jerseyNumber: 9,  avatarUrl: null, acwr: 1.0, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s3", "s4"] },
  { id: "10", userId: "u10", fullName: "Santiago Ramos",    position: "Pilar",    jerseyNumber: 3,  avatarUrl: null, acwr: 1.5, weeklyCompliance: 3, weeklyAssigned: 5, status: "active",  squadIds: ["s4"]       },
  { id: "11", userId: "u11", fullName: "Agustín Pereyra",   position: "Flanker",  jerseyNumber: 7,  avatarUrl: null, acwr: 0.8, weeklyCompliance: 4, weeklyAssigned: 5, status: "active",  squadIds: ["s3"]       },
  { id: "12", userId: "u12", fullName: "Matías Suárez",     position: "N°8",      jerseyNumber: 8,  avatarUrl: null, acwr: 1.1, weeklyCompliance: 5, weeklyAssigned: 5, status: "active",  squadIds: ["s1", "s4"] },
];

// ── Calendar events (current month = May 2026) ───────────────────────────────

const y = 2026;
const m = 4; // May is index 4

function iso(day: number, hour = 10, min = 0) {
  return new Date(y, m, day, hour, min).toISOString();
}

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: "e1",  type: "entrenamiento", title: "Entrenamiento táctico",    description: "Trabajo de línea de ventaja", startsAt: iso(5,  9,  0), endsAt: iso(5, 11, 0), opponent: null, location: null, squadIds: ["s1", "s2"] },
  { id: "e2",  type: "entrenamiento", title: "Físico y fuerza",          description: null,                          startsAt: iso(7,  8,  0), endsAt: iso(7,  9, 30), opponent: null, location: null, squadIds: ["s3"]       },
  { id: "e3",  type: "partido",       title: "vs Club San Isidro",       description: "Torneo del Interior",         startsAt: iso(10, 15, 0), endsAt: iso(10, 17, 0), opponent: "Club San Isidro", location: "local",     squadIds: ["s1"]       },
  { id: "e4",  type: "entrenamiento", title: "Lineout y scrum",          description: null,                          startsAt: iso(12, 9,  0), endsAt: iso(12, 11, 0), opponent: null, location: null, squadIds: ["s1", "s2"] },
  { id: "e5",  type: "entrenamiento", title: "Velocidad y agilidad",     description: null,                          startsAt: iso(14, 8,  0), endsAt: iso(14,  9, 0), opponent: null, location: null, squadIds: ["s4"]       },
  { id: "e6",  type: "partido",       title: "vs Hindú Club",            description: null,                          startsAt: iso(17, 15, 30), endsAt: iso(17, 17, 30), opponent: "Hindú Club", location: "visitante",  squadIds: ["s2"]       },
  { id: "e7",  type: "entrenamiento", title: "Entrenamiento de ataque",  description: "Trabajo de backline",         startsAt: iso(19, 9,  0), endsAt: iso(19, 11, 0), opponent: null, location: null, squadIds: ["s1"]       },
  { id: "e8",  type: "entrenamiento", title: "Física general",           description: null,                          startsAt: iso(21, 8,  0), endsAt: iso(21,  9, 30), opponent: null, location: null, squadIds: ["s1", "s2", "s3"] },
  { id: "e9",  type: "partido",       title: "vs Alumni AC",             description: "Torneo del Interior - Fecha 3", startsAt: iso(24, 15, 0), endsAt: iso(24, 17, 0), opponent: "Alumni AC", location: "local",     squadIds: ["s1"]       },
  { id: "e10", type: "entrenamiento", title: "Recuperación activa",      description: null,                          startsAt: iso(26, 9,  0), endsAt: iso(26, 10, 30), opponent: null, location: null, squadIds: ["s1", "s2"] },
  { id: "e11", type: "partido",       title: "vs Los Matreros",          description: null,                          startsAt: iso(31, 14, 0), endsAt: iso(31, 16, 0), opponent: "Los Matreros", location: "visitante", squadIds: ["s3"]       },
  // A few in April and June for edge cases
  { id: "e12", type: "entrenamiento", title: "Pretemporada",             description: null,                          startsAt: new Date(y, 3, 28, 9, 0).toISOString(), endsAt: new Date(y, 3, 28, 11, 0).toISOString(), opponent: null, location: null, squadIds: ["s1"] },
  { id: "e13", type: "entrenamiento", title: "Primer entrenamiento",     description: null,                          startsAt: new Date(y, 5,  3, 9, 0).toISOString(), endsAt: new Date(y, 5,  3, 11, 0).toISOString(), opponent: null, location: null, squadIds: ["s2"] },
];
