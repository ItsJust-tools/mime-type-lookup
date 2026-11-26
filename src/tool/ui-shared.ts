import type { ToolMode } from './types';

export interface ModeDefinition {
  value: ToolMode;
  label: string;
  hint: string;
}

export const MODES: ModeDefinition[] = [
  { value: 'extension', label: 'By extension', hint: 'look up a file extension' },
  { value: 'prefix', label: 'By type', hint: 'search MIME type strings' },
  { value: 'reverse', label: 'Reverse', hint: 'MIME back to extensions' },
];
