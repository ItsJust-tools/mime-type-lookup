import type { ToolConfig } from '@itsjust/core';

const toolConfig: ToolConfig = {
  id: 'mime-type-lookup',
  name: 'MIME Type Lookup',
  description:
    'Look up correct MIME types by file extension or type string, and identify the MIME type for a pasted file extension with copyable snippets.',
  version: '1.0.0',
  exportFormats: ['json'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    brand: 'MIME Type Lookup',
    icon: '🗂️',
  },
  shortcuts: [
    {
      title: 'Lookup',
      shortcuts: [
        {
          keys: 'F',
          label: 'Focus search',
          description: 'Move focus to the search field',
        },
        {
          keys: 'R',
          label: 'Reverse mode',
          description: 'Switch to reverse (MIME → extensions) mode',
        },
      ],
    },
  ],
};

export default toolConfig;
