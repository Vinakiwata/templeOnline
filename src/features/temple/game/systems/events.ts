/**
 * Application events (PRD 4.2):
 * Player Input → Interaction System → Application Event → React UI / Backend
 */
export interface GameEventMap {
  "bell:ring": void;
  "drum:beat": void;
  "incense:lit": void;
  "flower:offered": void;
}

type Handler = () => void;
const handlers = new Map<keyof GameEventMap, Set<Handler>>();

export const gameEvents = {
  on(event: keyof GameEventMap, handler: Handler) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => {
      handlers.get(event)?.delete(handler);
    };
  },
  emit(event: keyof GameEventMap) {
    handlers.get(event)?.forEach((h) => h());
  },
};
