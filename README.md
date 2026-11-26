# MIME Type Lookup

Look up correct MIME types by file extension or type string, and identify the MIME type for a pasted file extension with copyable snippets.

**Live:** [mime-type-lookup.itsjust.tools](https://mime-type-lookup.itsjust.tools)

## Features

- Search MIME types by extension (e.g. `png` → `image/png`) and by type string (e.g. `image/` prefix search)
- Built-in database of 150+ common mappings across image, video, audio, text, application, and font categories
- Category and exact/prefix search filters
- Copy MIME string, data-URI prefix, or Accept header snippet per result
- Reverse view: paste a MIME type and see matching file extensions
- URL hash state so a lookup is shareable via link
- Keyboard shortcut focus for fast searching and recent-lookups history (session-local)
- Detail panel with charset default, common aliases, and compressibility note per type
- 100% client-side — no data ever leaves your browser

## Keyboard shortcuts

| Key   | Action               |
| ----- | -------------------- |
| `F`   | Focus the search box |
| `Esc` | Leave the search box |

## Development

```bash
npm install
npm run build -w @itsjust/core   # build shared core first
npm run dev
npm test
```

## Deployment

```bash
docker build -t itsjust-mime-type-lookup .
docker run -p 3000:3000 itsjust-mime-type-lookup
```

## License

MIT
