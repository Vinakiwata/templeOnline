import { create } from "zustand";
import type { AreaId } from "../domain/world";
import { detectQuality, type QualityLevel } from "../game/systems/quality";
import { readJSON, writeJSON } from "../../../shared/lib/storage";
import { setSoundEnabled } from "../../../shared/audio/sound";

/**
 * UI / application-level state của chùa 3D (PRD 9.1).
 * Chỉ chứa state thay đổi thưa — không lưu vị trí player hay camera ở đây.
 */
interface Settings {
  soundOn: boolean;
  quality: QualityLevel;
  showFps: boolean;
  helpSeen: boolean;
}

const SETTINGS_KEY = "chua.templeSettings";
const initialSettings = readJSON<Settings>(SETTINGS_KEY, {
  soundOn: true,
  quality: detectQuality(),
  showFps: false,
  helpSeen: false,
});
setSoundEnabled(initialSettings.soundOn);

export interface Toast {
  id: number;
  title: string;
  text?: string;
}

type Panel = "none" | "menu" | "info" | "settings" | "help" | "meditation";

interface TempleState extends Settings {
  currentArea: AreaId;
  nearbyId: string | null;
  panel: Panel;
  panelTargetId: string | null;
  busy: boolean;
  toast: Toast | null;
  incenseLitAt: number | null;
  flowerCount: number;

  setArea: (area: AreaId) => void;
  setNearby: (id: string | null) => void;
  openPanel: (panel: Panel, targetId?: string | null) => void;
  closePanel: () => void;
  setBusy: (busy: boolean) => void;
  showToast: (title: string, text?: string) => void;
  clearToast: () => void;
  lightIncense: () => void;
  addFlower: () => void;
  setSound: (on: boolean) => void;
  setQuality: (q: QualityLevel) => void;
  setShowFps: (on: boolean) => void;
  markHelpSeen: () => void;
}

function persist(s: Settings) {
  writeJSON<Settings>(SETTINGS_KEY, {
    soundOn: s.soundOn,
    quality: s.quality,
    showFps: s.showFps,
    helpSeen: s.helpSeen,
  });
}

let toastSeq = 0;

export const useTempleStore = create<TempleState>((set, get) => ({
  ...initialSettings,
  currentArea: "courtyard",
  nearbyId: null,
  panel: initialSettings.helpSeen ? "none" : "help",
  panelTargetId: null,
  busy: false,
  toast: null,
  incenseLitAt: null,
  flowerCount: 0,

  setArea: (currentArea) => set({ currentArea }),
  setNearby: (nearbyId) => {
    const { panel } = get();
    // Rời khỏi vùng tương tác thì đóng menu hành động.
    if (!nearbyId && (panel === "menu" || panel === "info")) {
      set({ nearbyId, panel: "none", panelTargetId: null });
    } else {
      set({ nearbyId });
    }
  },
  openPanel: (panel, targetId = null) => set({ panel, panelTargetId: targetId }),
  closePanel: () => {
    if (get().panel === "help" && !get().helpSeen) {
      set({ helpSeen: true });
      persist(get());
    }
    set({ panel: "none", panelTargetId: null });
  },
  setBusy: (busy) => set({ busy }),
  showToast: (title, text) => set({ toast: { id: ++toastSeq, title, text } }),
  clearToast: () => set({ toast: null }),
  lightIncense: () => set({ incenseLitAt: Date.now() }),
  addFlower: () => set((s) => ({ flowerCount: s.flowerCount + 1 })),
  setSound: (soundOn) => {
    setSoundEnabled(soundOn);
    set({ soundOn });
    persist(get());
  },
  setQuality: (quality) => {
    set({ quality });
    persist(get());
  },
  setShowFps: (showFps) => {
    set({ showFps });
    persist(get());
  },
  markHelpSeen: () => {
    set({ helpSeen: true });
    persist(get());
  },
}));
