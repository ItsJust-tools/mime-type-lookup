import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import manifest from '@/app/manifest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import ErrorPage from '@/app/error';
import NotFound from '@/app/not-found';
import { JsonLd } from '@/app/json-ld';
import ToolPage from '@/app/page';
import { cn } from '@/lib/utils';
import { generateJsonLd, generateToolMetadata } from '@/lib/seo';
import toolConfig from '@/tool/tool.config';
import { getPublicSiteUrl, templateMetadata } from '@/tool/template-metadata';
import { mimeTypeLookupTool } from '@/tool/tool-definition';
import { Canvas } from '@/tool/components/Canvas';
import { Sidebar } from '@/tool/components/Sidebar';
import { Toolbar } from '@/tool/components/Toolbar';
import { DEFAULT_STATE } from '@/tool/types';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/tool-client-wrapper', () => ({
  default: () => <div data-testid="tool-client-wrapper">tool-client-wrapper</div>,
}));

describe('app and seo', () => {
  it('builds metadata and json-ld values', () => {
    const metadata = generateToolMetadata(toolConfig);
    const jsonLd = generateJsonLd(toolConfig);

    expect(metadata.creator).toBe(toolConfig.name);
    expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/');
    expect(jsonLd.url).toBe('http://localhost:3000');
    expect(jsonLd.featureList.length).toBeGreaterThan(0);
  });

  it('returns site manifest, robots and sitemap', () => {
    const man = manifest();
    const rob = robots();
    const sm = sitemap();

    expect(man.name).toBe(templateMetadata.appName);
    expect(rob.sitemap).toBe('http://localhost:3000/sitemap.xml');
    expect(sm[0]?.url).toBe('http://localhost:3000');
  });

  it('renders json-ld script safely', () => {
    render(<JsonLd config={{ ...toolConfig, name: '</script>' }} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toContain('\\u003c/script>');
  });

  it('renders error page and invokes reset', () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders not-found page', () => {
    render(<NotFound />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });

  it('renders top-level tool page', () => {
    render(<ToolPage />);
    expect(screen.getByTestId('tool-client-wrapper')).toBeInTheDocument();
    expect(document.querySelector('script[type="application/ld+json"]')).toBeInTheDocument();
  });

  it('covers tool definition and helper exports', () => {
    expect(cn('a', undefined, 'b', false, null, 'c')).toBe('a b c');
    expect(getPublicSiteUrl()).toBe('http://localhost:3000');
    expect(mimeTypeLookupTool.name).toBe(toolConfig.name);
    expect(
      mimeTypeLookupTool.deserialize({
        mode: 'reverse',
        reverseMime: 'application/pdf',
        history: [{ text: 'image/png', createdAt: '2026-11-26T10:00:00.000Z' }],
      })
    ).toEqual({
      success: true,
      data: {
        mode: 'reverse',
        query: '',
        category: 'all',
        exactOnly: false,
        reverseMime: 'application/pdf',
        history: [{ text: 'image/png', createdAt: '2026-11-26T10:00:00.000Z' }],
      },
    });
    const repaired = mimeTypeLookupTool.deserialize({ nope: true });
    expect(repaired.success).toBe(true);
    if (repaired.success) {
      expect(repaired.data.mode).toBe(DEFAULT_STATE.mode);
      expect(repaired.data.history).toEqual([]);
    }
    expect(mimeTypeLookupTool.serialize({ ...DEFAULT_STATE, query: 'png' })).toContain(
      '"query":"png"'
    );
  });

  it('renders tool components', () => {
    render(
      <>
        <Toolbar
          state={{ ...DEFAULT_STATE }}
          onChange={() => {}}
          onClear={() => {}}
          onCopy={() => {}}
        />
        <Sidebar state={{ ...DEFAULT_STATE }} onChange={() => {}} />
        <Canvas state={{ ...DEFAULT_STATE, query: 'png' }} onChange={() => {}} />
      </>
    );

    expect(screen.getByTestId('mode-tab-extension')).toBeInTheDocument();
    expect(screen.getByTestId('result-card')).toBeInTheDocument();
    expect(screen.getByTestId('result-card')).toHaveTextContent('image/png');
    expect(screen.getByTestId('sidebar-db-size')).toBeInTheDocument();
  });

  it('shows not-found state for unknown extension with no crash', () => {
    render(<Canvas state={{ ...DEFAULT_STATE, query: 'qqqqzzzz' }} onChange={() => {}} />);
    expect(screen.getByTestId('result-empty')).toBeInTheDocument();
    expect(screen.getByTestId('result-empty').textContent).toContain('No MIME type found');
  });

  it('shows reverse mode results', () => {
    render(
      <Canvas
        state={{ ...DEFAULT_STATE, mode: 'reverse', reverseMime: 'application/pdf' }}
        onChange={() => {}}
      />
    );
    expect(screen.getByTestId('result-main')).toHaveTextContent('.pdf');
  });

  it('updates category filter from the canvas', () => {
    const onChange = vi.fn();
    render(<Canvas state={{ ...DEFAULT_STATE, query: 'ma' }} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('input-category'), { target: { value: 'image' } });
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(next.category).toBe('image');
  });

  it('clears history from the sidebar', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        state={{
          ...DEFAULT_STATE,
          history: [{ text: 'image/png', createdAt: '2026-11-26T00:00:00.000Z' }],
        }}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByTestId('btn-sidebar-clear-history'));
    expect(onChange).toHaveBeenCalled();
  });
});
