import { describe, it, expect } from 'vitest';
import {
  DEFAULT_STATE,
  MAX_HISTORY,
  MIME_CATEGORIES,
  MIME_DATABASE,
  MIME_DATABASE_SIZE,
  dataUriPrefix,
  extensionsForMime,
  filterByCategory,
  historyText,
  isBareExtension,
  isValidState,
  lookupByExtension,
  lookupByMime,
  normalizeExtension,
  notFoundMessage,
  resultText,
  searchByPrefix,
  searchMime,
  snippetsFor,
  stepsFor,
  summaryText,
  type ToolState,
  type ToolMode,
} from '@/tool/types';
import {
  deserializeState,
  mimeTypeLookupTool,
  roundTrips,
  serializeState,
  withHistory,
} from '@/tool/tool-definition';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('lookupByExtension', () => {
  it("resolves 'png' to image/png", () => {
    const entry = lookupByExtension('png');
    expect(entry?.mime).toBe('image/png');
    expect(entry?.type).toBe('image');
  });

  it('ignores a leading dot and casing', () => {
    expect(lookupByExtension('.PNG')?.mime).toBe('image/png');
  });

  it('returns null for empty or unknown extensions', () => {
    expect(lookupByExtension('')).toBeNull();
    expect(lookupByExtension('   ')).toBeNull();
    expect(lookupByExtension('definitelynotreal')).toBeNull();
  });

  it('resolves multi-extension formats', () => {
    expect(lookupByExtension('jpg')?.mime).toBe('image/jpeg');
    expect(lookupByExtension('jpeg')?.mime).toBe('image/jpeg');
  });
});

describe('normalizeExtension / isBareExtension', () => {
  it('strips dots and lowercases', () => {
    expect(normalizeExtension('.TXT')).toBe('txt');
  });

  it('detects bare extension tokens', () => {
    expect(isBareExtension('png')).toBe(true);
    expect(isBareExtension('.png')).toBe(true);
    expect(isBareExtension('tar.gz')).toBe(true);
    expect(isBareExtension('image/')).toBe(false);
    expect(isBareExtension('a b')).toBe(false);
  });
});

describe('searchByPrefix', () => {
  it("returns multiple audio types for 'audio/'", () => {
    const results = searchByPrefix('audio/');
    expect(results.length).toBeGreaterThan(3);
    expect(results.every((r) => r.type === 'audio')).toBe(true);
  });

  it('returns the exact match for a full type string', () => {
    expect(searchByPrefix('image/png').map((r) => r.mime)).toEqual(['image/png']);
  });

  it('returns empty for empty query or unmatched prefix', () => {
    expect(searchByPrefix('')).toEqual([]);
    expect(searchByPrefix('zzzz/')).toEqual([]);
  });
});

describe('searchMime', () => {
  it('matches by extension token', () => {
    expect(searchMime('png')[0]?.mime).toBe('image/png');
  });

  it('matches by label substring', () => {
    const results = searchMime('javascript');
    expect(results.some((r) => r.mime === 'text/javascript')).toBe(true);
  });

  it('filters by category', () => {
    const results = searchMime('ma', 'image');
    expect(results.every((r) => r.type === 'image')).toBe(true);
  });

  it('returns full database for empty query', () => {
    expect(searchMime('').length).toBe(MIME_DATABASE.length);
  });

  it('returns empty for nonsense', () => {
    expect(searchMime('zzqqxx')).toEqual([]);
  });
});

describe('reverse lookup', () => {
  it("maps 'application/pdf' to the pdf extension", () => {
    expect(extensionsForMime('application/pdf')).toContain('pdf');
  });

  it('returns empty for unknown mime', () => {
    expect(extensionsForMime('foo/bar')).toEqual([]);
    expect(extensionsForMime('')).toEqual([]);
  });

  it('lookupByMime is exact and case-sensitive on trim', () => {
    expect(lookupByMime(' text/plain ')?.subtype).toBe('plain');
    expect(lookupByMime('text/plainx')).toBeNull();
  });
});

describe('snippets', () => {
  it('builds data-URI prefix per type', () => {
    const png = lookupByExtension('png');
    expect(png && dataUriPrefix(png)).toBe('data:image/png;base64,');
    const txt = lookupByExtension('txt');
    expect(txt && dataUriPrefix(txt)).toBe('data:text/plain;charset=UTF-8;base64,');
  });

  it('builds copyable snippet set', () => {
    const entry = lookupByMime('application/json');
    expect(entry).not.toBeNull();
    const s = snippetsFor(entry as NonNullable<typeof entry>);
    expect(s.mime).toBe('application/json');
    expect(s.dataUri).toBe('data:application/json;charset=UTF-8;base64,');
    expect(s.acceptHeader).toBe('Accept: application/json');
  });
});

describe('database integrity', () => {
  it('has 150+ unique MIME strings covering all categories', () => {
    expect(MIME_DATABASE_SIZE).toBeGreaterThanOrEqual(150);
    for (const category of ['image', 'video', 'audio', 'text', 'application', 'font']) {
      expect(MIME_CATEGORIES).toContain(category);
    }
  });

  it('every entry has at least one extension and a label', () => {
    for (const entry of MIME_DATABASE) {
      expect(entry.extensions.length).toBeGreaterThan(0);
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.mime).toBe(`${entry.type}/${entry.subtype}`);
    }
  });
});

describe('state helpers', () => {
  it('resultText finds first match and notes extras', () => {
    expect(resultText(state({ query: 'png' }))).toContain('image/png');
    const multi = resultText(state({ query: 'a', category: 'all' }));
    expect(multi.length).toBeGreaterThan(0);
  });

  it('resultText gives friendly not-found for unknown extensions without crashing', () => {
    const text = resultText(state({ query: 'qqqqzz' }));
    expect(text).toContain('No MIME type found');
  });

  it('resultText reverse mode maps extensions', () => {
    const text = resultText(state({ mode: 'reverse', reverseMime: 'application/pdf' }));
    expect(text).toContain('pdf');
  });

  it('summaryText and historyText never throw', () => {
    expect(typeof summaryText(state())).toBe('string');
    expect(historyText(state({ query: 'png' }))).toBe(summaryText(state({ query: 'png' })));
  });

  it('stepsFor lists matches or guidance', () => {
    expect(stepsFor(state({ query: 'png' })).some((s) => s.includes('image/png'))).toBe(true);
    expect(stepsFor(state()).length).toBeGreaterThan(0);
  });
});

describe('isValidState', () => {
  it('accepts valid state and rejects junk', () => {
    expect(isValidState(state())).toBe(true);
    expect(isValidState(null)).toBe(false);
    expect(isValidState({ mode: 'nope' })).toBe(false);
    expect(isValidState(state({ mode: 'bogus' as unknown as ToolMode }))).toBe(false);
  });
});

describe('serialize/deserialize', () => {
  it('round-trips full state', () => {
    const full = state({
      mode: 'reverse',
      query: 'png',
      category: 'image',
      exactOnly: true,
      reverseMime: 'image/png',
      history: [{ text: 'image/png', createdAt: '2026-11-26T00:00:00.000Z' }],
    });
    expect(roundTrips(full)).toBe(true);
    const restored = deserializeState(JSON.parse(serializeState(full)));
    expect(restored).toEqual({ success: true, data: full });
  });

  it('rejects non-object payloads', () => {
    expect(deserializeState('nope').success).toBe(false);
    expect(deserializeState(null).success).toBe(false);
    expect(deserializeState([1]).success).toBe(false);
  });

  it('repairs invalid mode/category and keeps valid history', () => {
    const result = deserializeState({
      mode: 'bogus',
      category: 'wat',
      exactOnly: 'yes',
      history: [
        { text: 'image/png', createdAt: '2026-11-26T00:00:00.000Z' },
        { text: 42, createdAt: 'nope' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe(DEFAULT_STATE.mode);
      expect(result.data.category).toBe('all');
      expect(result.data.exactOnly).toBe(DEFAULT_STATE.exactOnly);
      expect(result.data.history).toHaveLength(1);
    }
  });

  it('caps restored history at MAX_HISTORY', () => {
    const history = Array.from({ length: MAX_HISTORY + 5 }, (_, i) => ({
      text: `hit-${i}`,
      createdAt: `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}.000Z`,
    }));
    const result = deserializeState({ ...DEFAULT_STATE, history });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.history).toHaveLength(MAX_HISTORY);
  });
});

describe('withHistory', () => {
  it('prepends, dedupes and caps', () => {
    let s = withHistory(state(), 'image/png');
    expect(s.history[0]?.text).toBe('image/png');
    s = withHistory(s, 'text/html');
    s = withHistory(s, 'image/png');
    expect(s.history.map((h) => h.text)).toEqual(['image/png', 'text/html']);
    for (let i = 0; i < MAX_HISTORY + 3; i++) s = withHistory(s, `entry-${i}`);
    expect(s.history).toHaveLength(MAX_HISTORY);
  });

  it('ignores empty text', () => {
    expect(withHistory(state(), '   ').history).toHaveLength(0);
  });
});

describe('tool contract', () => {
  it('identity matches the config', () => {
    expect(mimeTypeLookupTool.id).toBe('mime-type-lookup');
    expect(mimeTypeLookupTool.name).toBe('MIME Type Lookup');
    expect(mimeTypeLookupTool.initialState).toEqual(DEFAULT_STATE);
  });
});
