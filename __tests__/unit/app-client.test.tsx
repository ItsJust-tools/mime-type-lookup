import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import ToolClient from '@/app/tool-client';
import ToolClientWrapper from '@/app/tool-client-wrapper';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="dynamic-tool-client">dynamic-tool-client</div>,
}));

const mockSetData = vi.fn();
const mockToast = vi.fn();
const mockHandleExport = vi.fn();
const mockImport = vi.fn();

vi.mock('@itsjust/core', () => ({
  ToolShell: ({ toolbar, sidebar, canvas, statusBar }: Record<string, unknown>) => (
    <div>
      <div>{toolbar as ReactNode}</div>
      <div>{sidebar as ReactNode}</div>
      <div>{canvas as ReactNode}</div>
      <div>{statusBar as ReactNode}</div>
    </div>
  ),
  ImportExport: ({ onShare }: { onShare?: () => void }) => (
    <button type="button" onClick={onShare}>
      trigger-share
    </button>
  ),
  useTool: () => ({
    state: {
      data: {
        mode: 'extension',
        query: '',
        category: 'all',
        exactOnly: false,
        reverseMime: '',
        history: [],
      },
      setData: mockSetData,
      isDirty: false,
      lastSaved: 'just now',
    },
    toast: mockToast,
    supportedFormats: ['json'],
    handleExport: mockHandleExport,
    importFromFile: mockImport,
    isImporting: false,
  }),
}));

vi.mock('@/tool', () => ({
  toolConfig: {
    id: 'mime-type-lookup',
    name: 'MIME Type Lookup',
    version: '1.0.0',
    features: { sidebar: true },
    theme: { brand: 'MIME Type Lookup' },
  },
  templateBaseVersion: '1.4.0',
  Canvas: ({ state }: { state: Record<string, unknown> }) => <div>canvas:{String(state.mode)}</div>,
  Toolbar: ({ onCopy }: { onCopy?: () => void }) => (
    <button type="button" data-testid="btn-copy-result" onClick={onCopy}>
      copy
    </button>
  ),
  Sidebar: () => <div>sidebar</div>,
  summaryText: () => 'summary',
}));

vi.mock('@/tool/tool-definition', () => ({
  mimeTypeLookupTool: {
    serialize: (s: unknown) => JSON.stringify(s),
    deserialize: (d: unknown) => ({ success: true, data: d }),
  },
}));

describe('app client', () => {
  beforeEach(() => {
    mockSetData.mockReset();
    mockToast.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    window.history.replaceState(null, '', 'http://localhost:3000/');
  });

  it('renders dynamic tool client wrapper', () => {
    render(<ToolClientWrapper />);
    expect(screen.getByTestId('dynamic-tool-client')).toBeInTheDocument();
  });

  it('renders tool client sections', () => {
    render(<ToolClient />);
    expect(screen.getByText('sidebar')).toBeInTheDocument();
    expect(screen.getByText('canvas:extension')).toBeInTheDocument();
    expect(screen.getByText('summary')).toBeInTheDocument();
  });

  it('copies result through toolbar copy', async () => {
    render(<ToolClient />);
    const copyBtn = screen.getByTestId('btn-copy-result');
    fireEvent.click(copyBtn);
    await Promise.resolve();
    expect(mockToast).toHaveBeenCalled();
  });

  it('handles share flow', async () => {
    render(<ToolClient />);
    fireEvent.click(screen.getByText('trigger-share'));
    await Promise.resolve();
    expect(mockToast).toHaveBeenCalled();
  });

  it('applies hash state on load', () => {
    window.history.replaceState(
      null,
      '',
      'http://localhost:3000/#mode=reverse&mime=application%2Fpdf'
    );
    render(<ToolClient />);
    expect(mockSetData).toHaveBeenCalled();
    const call = mockSetData.mock.calls[0]?.[0] as (prev: Record<string, unknown>) => unknown;
    expect(typeof call).toBe('function');
    const next = call({
      mode: 'extension',
      query: '',
      category: 'all',
      exactOnly: false,
      reverseMime: '',
      history: [],
    });
    expect((next as Record<string, unknown>).mode).toBe('reverse');
    expect((next as Record<string, unknown>).reverseMime).toBe('application/pdf');
  });

  it('shows a toast when shared ?state= is invalid', () => {
    window.history.replaceState(null, '', 'http://localhost:3000/?state=%%%bad');
    render(<ToolClient />);
    expect(mockToast).toHaveBeenCalled();
  });
});
