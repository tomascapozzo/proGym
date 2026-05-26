"use client";

import React, { createContext, useContext } from "react";
import type { Club, ClubMember } from "@/types/club";

interface ClubContextValue {
  club: Club | null;
  membership: ClubMember | null;
  isStaff: boolean;
}

const ClubContext = createContext<ClubContextValue>({
  club: null,
  membership: null,
  isStaff: false,
});

export function ClubProvider({
  club,
  membership,
  children,
}: {
  club: Club | null;
  membership: ClubMember | null;
  children: React.ReactNode;
}) {
  const isStaff =
    membership?.role === "admin" || membership?.role === "coach";
  return (
    <ClubContext.Provider value={{ club, membership, isStaff }}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClubContext = () => useContext(ClubContext);
