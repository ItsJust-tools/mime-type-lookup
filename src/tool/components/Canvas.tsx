'use client';

import React from 'react';
import { MODES } from '../ui-shared';
import {
  MIME_CATEGORIES,
  lookupByMime,
  searchMime,
  searchByPrefix,
  isBareExtension,
  notFoundMessage,
  snippetsFor,
  stepsFor,
  type MimeEntry,
  type ToolState,
} from '../types';

interface CanvasProps {
  state: ToolState;
  onChange?: (state: ToolState) => void;
  onSaveHistory?: (text: string) => void;
}

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';

export const Canvas: React.FC<CanvasProps> = ({ state, onChange }) => {
  const update = (patch: Partial<ToolState>) => onChange?.({ ...state, ...patch });
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [copiedSnippet, setCopiedSnippet] = React.useState<string | null>(null);

  const isReverse = state.mode === 'reverse';

  const handleCopy = React.useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedSnippet(key);
      window.setTimeout(() => setCopiedSnippet(null), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, []);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing && event.key !== 'Escape') return;
      if (event.key === 'Escape' && typing) {
        (event.target as HTMLElement).blur();
        return;
      }
      if ((event.key === 'f' || event.key === 'F') && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full" data-testid="mime-canvas">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Lookup mode"
        data-testid="mode-tabs"
      >
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={state.mode === mode.value}
            data-testid={`mode-tab-${mode.value}`}
            title={mode.hint}
            onClick={() =>
              update({ mode: mode.value, query: mode.value === 'reverse' ? '' : state.query })
            }
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              state.mode === mode.value
                ? 'border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-900/40 dark:text-violet-100'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {isReverse ? (
        <div data-testid="reverse-input">
          {
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Pasted MIME type
              <input
                type="text"
                value={state.reverseMime}
                onChange={(e) => update({ reverseMime: e.target.value })}
                data-testid="input-reverse-mime"
                placeholder="e.g. application/pdf"
                className={inputClass}
              />
            </label>
          }
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="search-inputs">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            {state.mode === 'extension' ? 'File extension' : 'MIME type or prefix'}
            <input
              ref={searchRef}
              type="text"
              value={state.query}
              onChange={(e) => update({ query: e.target.value })}
              data-testid="input-search"
              placeholder={
                state.mode === 'extension' ? 'e.g. png' : 'e.g. image/ or application/json'
              }
              className={inputClass}
            />
          </label>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Category
            <select
              value={state.category}
              onChange={(e) => update({ category: e.target.value })}
              data-testid="input-category"
              className={inputClass}
            >
              <option value="all">All categories</option>
              {MIME_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={state.exactOnly}
              onChange={(e) => update({ exactOnly: e.target.checked })}
              data-testid="input-exact-only"
            />
            Exact/prefix match only (no fuzzy label search)
          </label>
        </div>
      )}

      <ResultsPanel state={state} onCopy={handleCopy} copiedSnippet={copiedSnippet} />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Matches
        </h3>
        <ol className="space-y-1 text-xs text-gray-700 dark:text-gray-300" data-testid="steps-list">
          {stepsFor(state).map((step, i) => (
            <li key={i} className="font-mono">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Recent lookups
          </h3>
          {state.history.length > 0 ? (
            <button
              type="button"
              data-testid="btn-clear-history"
              onClick={() => update({ history: [] })}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear history
            </button>
          ) : null}
        </div>
        {state.history.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400" data-testid="history-empty">
            No recent lookups yet.
          </p>
        ) : (
          <ul className="space-y-1" data-testid="history-list">
            {state.history.map((entry, i) => (
              <li
                key={`${entry.createdAt}-${i}`}
                className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs dark:border-gray-800"
              >
                <button
                  type="button"
                  className="flex-1 text-left text-gray-700 hover:underline dark:text-gray-300"
                  data-testid="history-item"
                  onClick={() =>
                    isReverse
                      ? update({ reverseMime: entry.text })
                      : update({
                          query: entry.text,
                          mode:
                            state.mode === 'reverse'
                              ? 'prefix'
                              : /[^a-z0-9]/i.test(entry.text)
                                ? 'prefix'
                                : state.mode,
                        })
                  }
                >
                  {entry.text}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => void handleCopy(`history-${i}`, entry.text)}
                >
                  {copiedSnippet === `history-${i}` ? 'Copied!' : 'Copy'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        All lookups run locally in your browser; nothing is uploaded.
      </p>
    </div>
  );
};

const ResultsPanel: React.FC<{
  state: ToolState;
  onCopy: (key: string, value: string) => Promise<void>;
  copiedSnippet: string | null;
}> = ({ state, onCopy, copiedSnippet }) => {
  if (state.mode === 'reverse') {
    const match = state.reverseMime.trim() ? lookupReverse(state.reverseMime) : null;
    if (match) {
      return (
        <div
          className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
          data-testid="result-card"
          role="status"
        >
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Extensions
          </span>
          <span className="block font-mono text-2xl font-bold" data-testid="result-main">
            {match.extensions.map((ext) => `.${ext}`).join(', ')}
          </span>
          <span
            className="mt-2 block text-xs text-gray-600 dark:text-gray-300"
            data-testid="result-summary"
          >
            {match.label} — {match.mime}
          </span>
        </div>
      );
    }
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="block text-sm text-gray-500 dark:text-gray-400" data-testid="result-empty">
          {state.reverseMime.trim()
            ? notFoundMessage(state.reverseMime)
            : 'Paste a MIME type to find matching extensions.'}
        </span>
      </div>
    );
  }

  return <ResultList state={state} onCopy={onCopy} copiedSnippet={copiedSnippet} />;
};

function lookupReverse(mime: string): MimeEntry | null {
  return lookupByMime(mime);
}

const ResultList: React.FC<{
  state: ToolState;
  onCopy: (key: string, value: string) => Promise<void>;
  copiedSnippet: string | null;
}> = ({ state, onCopy, copiedSnippet }) => {
  const entries = state.exactOnly
    ? searchByPrefix(state.query).filter(
        (entry) => state.category === 'all' || entry.type === state.category
      )
    : searchMime(state.query, state.category);

  if (entries.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900"
        data-testid="result-card"
        role="status"
      >
        <span className="block text-sm text-gray-500 dark:text-gray-400" data-testid="result-empty">
          {state.query.trim()
            ? notFoundMessage(state.query)
            : 'Search by extension or type prefix.'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="result-card" role="list">
      {entries.map((entry, i) => {
        const snippets = snippetsFor(entry);
        const isTop = i === 0 && isBareExtension(state.query);
        return (
          <div
            key={`${entry.mime}-${i}`}
            role="listitem"
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-bold" data-testid="result-mime">
                {entry.mime}
                {isTop ? (
                  <span
                    className="ml-2 align-middle rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200"
                    data-testid="best-match"
                  >
                    best match
                  </span>
                ) : null}
              </span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                {entry.label}
              </span>
            </div>
            <p
              className="mt-1 text-xs text-gray-600 dark:text-gray-300"
              data-testid="result-extensions"
            >
              Extensions: {entry.extensions.map((ext) => `.${ext}`).join(', ')}
            </p>
            {entry.charset ? (
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Default charset: {entry.charset}
              </p>
            ) : null}
            <p
              className="text-xs text-gray-600 dark:text-gray-300"
              data-testid="result-compressible"
            >
              Compressible: {entry.compressible ? 'yes' : 'no'}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ['mime', snippets.mime],
                  ['data-uri', snippets.dataUri],
                  ['accept', snippets.acceptHeader],
                ] as const
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-2 py-1.5 dark:border-gray-800"
                >
                  <code
                    className="overflow-x-auto whitespace-nowrap text-[11px] text-gray-700 dark:text-gray-300"
                    title={value}
                  >
                    {value}
                  </code>
                  <button
                    type="button"
                    className="shrink-0 rounded border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                    onClick={() => void onCopy(`${key}-${i}`, value)}
                    aria-label={`Copy ${key} snippet`}
                  >
                    {copiedSnippet === `${key}-${i}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Canvas;
