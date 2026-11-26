'use client';

import React from 'react';
import { MODES } from '../ui-shared';
import { MIME_DATABASE_SIZE, MIME_CATEGORIES, type ToolState } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange?: (next: ToolState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  return (
    <div className="p-4 space-y-6 text-sm overflow-y-auto h-full" data-testid="mime-sidebar">
      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Modes</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {MODES.map((mode) => (
            <li key={mode.value} className="flex justify-between gap-2">
              <span>{mode.label}</span>
              <span className="text-gray-500 dark:text-gray-400">{mode.hint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Database</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <li data-testid="sidebar-db-size">{MIME_DATABASE_SIZE} unique MIME types</li>
          <li>Categories: {MIME_CATEGORIES.join(', ')}</li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Recent lookups</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300" data-testid="sidebar-history-count">
          {state.history.length} entr{state.history.length === 1 ? 'y' : 'ies'} in history
          {state.history.length > 0 ? ' (newest first, session-local)' : ''}
        </p>
        {state.history.length > 0 ? (
          <button
            type="button"
            data-testid="btn-sidebar-clear-history"
            onClick={() => onChange?.({ ...state, history: [] })}
            className="mt-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear history
          </button>
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Keyboard shortcuts</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          <li>
            <kbd>F</kbd> — Focus search field
          </li>
          <li>
            <kbd>R</kbd> — Copy snippet (within a result)
          </li>
          <li>
            <kbd>Esc</kbd> — Leave the search field
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Share</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Use the toolbar share button to create a URL containing the current state; open it to
          restore this exact lookup view.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
