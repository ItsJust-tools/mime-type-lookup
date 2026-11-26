import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  isValidState,
  type HistoryEntry,
  type ToolMode,
  type ToolState,
} from './types';

const VALID_MODES: ToolMode[] = ['extension', 'prefix', 'reverse'];
const VALID_CATEGORIES = new Set(['all', 'image', 'video', 'audio', 'text', 'application', 'font']);

/** Serialize tool state into a compact JSON string for share/import. */
export function serializeState(state: ToolState): string {
  return JSON.stringify(state);
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function validHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is HistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).text === 'string' &&
        typeof (entry as HistoryEntry).createdAt === 'string'
    )
    .slice(0, MAX_HISTORY);
}

/** Validate and recover tool state from an arbitrary payload. */
export function deserializeState(data: unknown): DeserializeResult<ToolState> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      error: 'Invalid data format: expected MIME Type Lookup state object',
    };
  }
  const v = data as Record<string, unknown>;
  const mode: ToolMode = VALID_MODES.includes(v.mode as ToolMode)
    ? (v.mode as ToolMode)
    : DEFAULT_STATE.mode;
  const category =
    typeof v.category === 'string' && VALID_CATEGORIES.has(v.category)
      ? v.category
      : DEFAULT_STATE.category;
  const state: ToolState = {
    mode,
    query: stringOr(v.query, ''),
    category,
    exactOnly: typeof v.exactOnly === 'boolean' ? v.exactOnly : DEFAULT_STATE.exactOnly,
    reverseMime: stringOr(v.reverseMime, ''),
    history: validHistory(v.history),
    hydrated: typeof v.hydrated === 'boolean' ? v.hydrated : DEFAULT_STATE.hydrated,
  };
  return { success: true, data: state };
}

/** Append a history entry to state, capped at MAX_HISTORY, newest first, deduped. */
export function withHistory(state: ToolState, text: string, now = new Date()): ToolState {
  const trimmed = text.trim();
  if (!trimmed) return state;
  const filtered = state.history.filter((entry) => entry.text !== trimmed);
  const entry: HistoryEntry = { text: trimmed, createdAt: now.toISOString() };
  return { ...state, history: [entry, ...filtered].slice(0, MAX_HISTORY) };
}

/** True when a serialized string round-trips back to the same state. */
export function roundTrips(state: ToolState): boolean {
  try {
    const restored = deserializeState(JSON.parse(serializeState(state)));
    return restored.success && JSON.stringify(restored.data) === JSON.stringify(state);
  } catch {
    return false;
  }
}

export const mimeTypeLookupTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [],
};

export { DEFAULT_STATE, MAX_HISTORY, isValidState };
