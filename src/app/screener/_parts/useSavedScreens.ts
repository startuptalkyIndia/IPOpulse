"use client";

import { useEffect, useState } from "react";
import type { SavedScreen } from "./types";
import { SAVED_SCREENS_KEY } from "./constants";

export function useSavedScreens(currentFilters: () => SavedScreen["filters"]) {
  // Saved screens — per-browser convenience (localStorage), not account state:
  // a filter combo someone wants to revisit, same idea as Screener.in's saved
  // screens. Never blocks rendering if storage is unavailable (private window,
  // blocked site data) — falls back to an empty list.
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);
  const [screenName, setScreenName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_SCREENS_KEY);
      if (raw) setSavedScreens(JSON.parse(raw));
    } catch {
      // ignore — private window / blocked storage
    }
  }, []);

  function persistSavedScreens(next: SavedScreen[]) {
    setSavedScreens(next);
    try {
      localStorage.setItem(SAVED_SCREENS_KEY, JSON.stringify(next));
    } catch {
      // ignore — private window / blocked storage; the in-memory state above still updates
    }
  }

  function saveCurrentScreen() {
    const name = screenName.trim();
    if (!name) return;
    const next = [...savedScreens.filter((s) => s.name !== name), { name, filters: currentFilters() }];
    persistSavedScreens(next);
    setScreenName("");
    setShowSaveInput(false);
  }

  function deleteScreen(name: string) {
    persistSavedScreens(savedScreens.filter((s) => s.name !== name));
  }

  return { savedScreens, screenName, setScreenName, showSaveInput, setShowSaveInput, saveCurrentScreen, deleteScreen };
}
