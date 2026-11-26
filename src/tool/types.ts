/**
 * MIME type domain model and lookup engine for the MIME Type Lookup tool.
 */

export type ToolMode = 'extension' | 'prefix' | 'reverse';

export interface HistoryEntry {
  /** Short human readable description of the lookup. */
  text: string;
  /** ISO timestamp when the entry was saved. */
  createdAt: string;
}

export interface ToolState {
  /** Active mode: by extension, by type-string prefix, or reverse lookup. */
  mode: ToolMode;
  /** Current search query (extension like "png" or prefix like "image/"). */
  query: string;
  /** Optional category filter, e.g. "image", "video", "*". */
  category: string;
  /** Match policy: exact tokens or prefix matching on the raw string. */
  exactOnly: boolean;
  /** Reverse view: MIME string pasted to find matching extensions. */
  reverseMime: string;
  /** Recent lookups, newest first (session-local history). */
  history: HistoryEntry[];
  /** Internal flag; present for parity with persisted payloads. */
  hydrated?: boolean;
}

export const DEFAULT_STATE: ToolState = {
  mode: 'extension',
  query: '',
  category: 'all',
  exactOnly: false,
  reverseMime: '',
  history: [],
};

export const MAX_HISTORY = 20;

/** One MIME type registration used by the lookup engine. */
export interface MimeEntry {
  /** Full MIME type string, e.g. image/png. */
  mime: string;
  /** Primary type, e.g. image. */
  type: string;
  /** Subtype, e.g. png. */
  subtype: string;
  /** File extensions mapped to this MIME type. */
  extensions: string[];
  /** Default charset for text types, when applicable. */
  charset?: string;
  /** Common alternate MIME strings registered for the same format. */
  aliases?: string[];
  /** Whether the payload compresses well with gzip/br. */
  compressible: boolean;
  /** Human friendly format name, e.g. "PNG image". */
  label: string;
}

/** Built-in database of common MIME mappings (150+ entries). */
export const MIME_DATABASE: MimeEntry[] = [
  // ── image ────────────────────────────────────────────────
  {
    mime: 'image/png',
    type: 'image',
    subtype: 'png',
    extensions: ['png'],
    compressible: false,
    label: 'PNG image',
  },
  {
    mime: 'image/jpeg',
    type: 'image',
    subtype: 'jpeg',
    extensions: ['jpg', 'jpeg', 'jpe', 'jif', 'jfif'],
    compressible: false,
    label: 'JPEG image',
  },
  {
    mime: 'image/gif',
    type: 'image',
    subtype: 'gif',
    extensions: ['gif'],
    compressible: false,
    label: 'GIF image',
  },
  {
    mime: 'image/webp',
    type: 'image',
    subtype: 'webp',
    extensions: ['webp'],
    compressible: false,
    label: 'WebP image',
  },
  {
    mime: 'image/avif',
    type: 'image',
    subtype: 'avif',
    extensions: ['avif'],
    compressible: false,
    label: 'AVIF image',
  },
  {
    mime: 'image/svg+xml',
    type: 'image',
    subtype: 'svg+xml',
    extensions: ['svg', 'svgz'],
    compressible: true,
    label: 'SVG image',
  },
  {
    mime: 'image/bmp',
    type: 'image',
    subtype: 'bmp',
    extensions: ['bmp'],
    compressible: false,
    label: 'Bitmap image',
  },
  {
    mime: 'image/x-icon',
    type: 'image',
    subtype: 'x-icon',
    extensions: ['ico', 'cur'],
    aliases: ['image/vnd.microsoft.icon', 'image/icon'],
    compressible: false,
    label: 'Icon image',
  },
  {
    mime: 'image/tiff',
    type: 'image',
    subtype: 'tiff',
    extensions: ['tif', 'tiff'],
    compressible: false,
    label: 'TIFF image',
  },
  {
    mime: 'image/heic',
    type: 'image',
    subtype: 'heic',
    extensions: ['heic'],
    aliases: ['image/heif', 'image/heif-sequence', 'image/heic-sequence'],
    compressible: false,
    label: 'HEIC image',
  },
  {
    mime: 'image/vnd.adobe.photoshop',
    type: 'image',
    subtype: 'vnd.adobe.photoshop',
    extensions: ['psd'],
    compressible: false,
    label: 'Photoshop document',
  },
  {
    mime: 'image/vnd.microsoft.icon',
    type: 'image',
    subtype: 'vnd.microsoft.icon',
    extensions: ['ico'],
    compressible: false,
    label: 'Icon image (alternate)',
  },
  {
    mime: 'image/vnd.wap.wbmp',
    type: 'image',
    subtype: 'vnd.wap.wbmp',
    extensions: ['wbmp'],
    compressible: false,
    label: 'Wireless bitmap',
  },
  {
    mime: 'image/x-ms-bmp',
    type: 'image',
    subtype: 'x-ms-bmp',
    extensions: ['bmp'],
    compressible: false,
    label: 'Bitmap image (alternate)',
  },
  {
    mime: 'image/x-tga',
    type: 'image',
    subtype: 'x-tga',
    extensions: ['tga'],
    compressible: false,
    label: 'Truevision Targa',
  },
  {
    mime: 'image/x-exr',
    type: 'image',
    subtype: 'x-exr',
    extensions: ['exr'],
    compressible: false,
    label: 'OpenEXR image',
  },
  {
    mime: 'image/x-xcf',
    type: 'image',
    subtype: 'x-xcf',
    extensions: ['xcf'],
    compressible: false,
    label: 'GIMP image',
  },
  {
    mime: 'image/x-rgb',
    type: 'image',
    subtype: 'x-rgb',
    extensions: ['rgb'],
    compressible: false,
    label: 'Silicon Graphics RGB',
  },
  {
    mime: 'image/x-pict',
    type: 'image',
    subtype: 'x-pict',
    extensions: ['pict', 'pct'],
    compressible: false,
    label: 'PICT image',
  },
  {
    mime: 'image/dicom',
    type: 'image',
    subtype: 'dicom',
    extensions: ['dcm', 'dicom'],
    compressible: false,
    label: 'DICOM image',
  },

  // ── video ────────────────────────────────────────────────
  {
    mime: 'video/mp4',
    type: 'video',
    subtype: 'mp4',
    extensions: ['mp4', 'mp4v', 'mpg4'],
    compressible: false,
    label: 'MP4 video',
  },
  {
    mime: 'video/mpeg',
    type: 'video',
    subtype: 'mpeg',
    extensions: ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
    compressible: false,
    label: 'MPEG video',
  },
  {
    mime: 'video/webm',
    type: 'video',
    subtype: 'webm',
    extensions: ['webm'],
    compressible: false,
    label: 'WebM video',
  },
  {
    mime: 'video/ogg',
    type: 'video',
    subtype: 'ogg',
    extensions: ['ogv'],
    compressible: false,
    label: 'Ogg video',
  },
  {
    mime: 'video/quicktime',
    type: 'video',
    subtype: 'quicktime',
    extensions: ['mov', 'qt'],
    compressible: false,
    label: 'QuickTime video',
  },
  {
    mime: 'video/x-msvideo',
    type: 'video',
    subtype: 'x-msvideo',
    extensions: ['avi'],
    compressible: false,
    label: 'AVI video',
  },
  {
    mime: 'video/x-flv',
    type: 'video',
    subtype: 'x-flv',
    extensions: ['flv'],
    compressible: false,
    label: 'Flash video',
  },
  {
    mime: 'video/x-matroska',
    type: 'video',
    subtype: 'x-matroska',
    extensions: ['mkv', 'mk3d', 'mks'],
    compressible: false,
    label: 'Matroska video',
  },
  {
    mime: 'video/mp2t',
    type: 'video',
    subtype: 'mp2t',
    extensions: ['ts', 'm2t', 'mts'],
    compressible: false,
    label: 'MPEG transport stream',
  },
  {
    mime: 'video/3gpp',
    type: 'video',
    subtype: '3gpp',
    extensions: ['3gp', '3gpp'],
    compressible: false,
    label: '3GPP video',
  },
  {
    mime: 'video/3gpp2',
    type: 'video',
    subtype: '3gpp2',
    extensions: ['3g2', '3gpp2'],
    compressible: false,
    label: '3GPP2 video',
  },
  {
    mime: 'video/x-ms-wm',
    type: 'video',
    subtype: 'x-ms-wm',
    extensions: ['wmv', 'wm'],
    compressible: false,
    label: 'Windows Media video',
  },
  {
    mime: 'video/h264',
    type: 'video',
    subtype: 'h264',
    extensions: ['h264'],
    compressible: false,
    label: 'H.264 video',
  },
  {
    mime: 'video/h265',
    type: 'video',
    subtype: 'h265',
    extensions: ['h265'],
    compressible: false,
    label: 'H.265 video',
  },
  {
    mime: 'video/x-f4v',
    type: 'video',
    subtype: 'x-f4v',
    extensions: ['f4v'],
    compressible: false,
    label: 'Flash video (f4v)',
  },
  {
    mime: 'video/x-m4v',
    type: 'video',
    subtype: 'x-m4v',
    extensions: ['m4v'],
    compressible: false,
    label: 'iTunes video',
  },
  {
    mime: 'video/vnd.mpegurl',
    type: 'video',
    subtype: 'vnd.mpegurl',
    extensions: ['mxu', 'murl'],
    compressible: true,
    label: 'MPEG playlist',
  },

  // ── audio ────────────────────────────────────────────────
  {
    mime: 'audio/mpeg',
    type: 'audio',
    subtype: 'mpeg',
    extensions: ['mp3', 'mpga', 'mp2', 'mp2a', 'm2a', 'm3a'],
    compressible: false,
    label: 'MP3 audio',
  },
  {
    mime: 'audio/mp4',
    type: 'audio',
    subtype: 'mp4',
    extensions: ['m4a', 'mp4a'],
    compressible: false,
    label: 'MP4 audio',
  },
  {
    mime: 'audio/aac',
    type: 'audio',
    subtype: 'aac',
    extensions: ['aac'],
    compressible: false,
    label: 'AAC audio',
  },
  {
    mime: 'audio/ogg',
    type: 'audio',
    subtype: 'ogg',
    extensions: ['oga', 'ogg', 'spx', 'opus'],
    compressible: false,
    label: 'Ogg audio',
  },
  {
    mime: 'audio/wav',
    type: 'audio',
    subtype: 'wav',
    extensions: ['wav'],
    aliases: ['audio/x-wav', 'audio/wave', 'audio/vnd.wave'],
    compressible: false,
    label: 'WAV audio',
  },
  {
    mime: 'audio/x-wav',
    type: 'audio',
    subtype: 'x-wav',
    extensions: ['wav'],
    compressible: false,
    label: 'WAV audio (alternate)',
  },
  {
    mime: 'audio/webm',
    type: 'audio',
    subtype: 'webm',
    extensions: ['weba'],
    compressible: false,
    label: 'WebM audio',
  },
  {
    mime: 'audio/flac',
    type: 'audio',
    subtype: 'flac',
    extensions: ['flac'],
    aliases: ['audio/x-flac'],
    compressible: false,
    label: 'FLAC audio',
  },
  {
    mime: 'audio/x-flac',
    type: 'audio',
    subtype: 'x-flac',
    extensions: ['flac'],
    compressible: false,
    label: 'FLAC audio (alternate)',
  },
  {
    mime: 'audio/midi',
    type: 'audio',
    subtype: 'midi',
    extensions: ['mid', 'midi', 'kar', 'rmi'],
    aliases: ['audio/x-midi'],
    compressible: true,
    label: 'MIDI audio',
  },
  {
    mime: 'audio/x-midi',
    type: 'audio',
    subtype: 'x-midi',
    extensions: ['mid', 'midi'],
    compressible: true,
    label: 'MIDI audio (alternate)',
  },
  {
    mime: 'audio/aiff',
    type: 'audio',
    subtype: 'aiff',
    extensions: ['aif', 'aiff', 'aifc'],
    aliases: ['audio/x-aiff'],
    compressible: false,
    label: 'AIFF audio',
  },
  {
    mime: 'audio/x-aiff',
    type: 'audio',
    subtype: 'x-aiff',
    extensions: ['aif', 'aiff'],
    compressible: false,
    label: 'AIFF audio (alternate)',
  },
  {
    mime: 'audio/basic',
    type: 'audio',
    subtype: 'basic',
    extensions: ['au', 'snd'],
    compressible: false,
    label: 'Basic audio',
  },
  {
    mime: 'audio/amr',
    type: 'audio',
    subtype: 'amr',
    extensions: ['amr'],
    compressible: false,
    label: 'AMR audio',
  },
  {
    mime: 'audio/amr-wb',
    type: 'audio',
    subtype: 'amr-wb',
    extensions: ['awb'],
    compressible: false,
    label: 'AMR wideband audio',
  },
  {
    mime: 'audio/vnd.wave',
    type: 'audio',
    subtype: 'vnd.wave',
    extensions: ['wav'],
    compressible: false,
    label: 'WAV audio (vnd.wave)',
  },
  {
    mime: 'audio/x-pn-realaudio',
    type: 'audio',
    subtype: 'x-pn-realaudio',
    extensions: ['ram', 'ra', 'rm'],
    compressible: false,
    label: 'RealAudio',
  },
  {
    mime: 'audio/x-m4a',
    type: 'audio',
    subtype: 'x-m4a',
    extensions: ['m4a'],
    compressible: false,
    label: 'iTunes audio',
  },
  {
    mime: 'audio/eac3',
    type: 'audio',
    subtype: 'eac3',
    extensions: ['eac3'],
    compressible: false,
    label: 'E-AC-3 audio',
  },
  {
    mime: 'audio/opus',
    type: 'audio',
    subtype: 'opus',
    extensions: ['opus'],
    aliases: ['audio/ogg;codecs=opus'],
    compressible: false,
    label: 'Opus audio',
  },
  {
    mime: 'audio/speex',
    type: 'audio',
    subtype: 'speex',
    extensions: ['spx'],
    compressible: false,
    label: 'Speex audio',
  },
  {
    mime: 'audio/vorbis',
    type: 'audio',
    subtype: 'vorbis',
    extensions: ['vorbis'],
    compressible: false,
    label: 'Vorbis audio',
  },

  // ── text ─────────────────────────────────────────────────
  {
    mime: 'text/plain',
    type: 'text',
    subtype: 'plain',
    extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'nfo'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Plain text',
  },
  {
    mime: 'text/html',
    type: 'text',
    subtype: 'html',
    extensions: ['html', 'htm', 'htmls'],
    charset: 'UTF-8',
    compressible: true,
    label: 'HTML document',
  },
  {
    mime: 'text/css',
    type: 'text',
    subtype: 'css',
    extensions: ['css'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Stylesheet',
  },
  {
    mime: 'text/csv',
    type: 'text',
    subtype: 'csv',
    extensions: ['csv'],
    charset: 'UTF-8',
    compressible: true,
    label: 'CSV data',
  },
  {
    mime: 'text/javascript',
    type: 'text',
    subtype: 'javascript',
    extensions: ['js', 'mjs', 'cjs'],
    charset: 'UTF-8',
    aliases: [
      'application/javascript',
      'text/ecmascript',
      'application/ecmascript',
      'application/x-javascript',
    ],
    compressible: true,
    label: 'JavaScript source',
  },
  {
    mime: 'text/markdown',
    type: 'text',
    subtype: 'markdown',
    extensions: ['md', 'markdown', 'mdown', 'mkd'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Markdown document',
  },
  {
    mime: 'text/xml',
    type: 'text',
    subtype: 'xml',
    extensions: ['xml'],
    charset: 'UTF-8',
    compressible: true,
    label: 'XML document',
  },
  {
    mime: 'text/calendar',
    type: 'text',
    subtype: 'calendar',
    extensions: ['ics', 'ifb'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Calendar data',
  },
  {
    mime: 'text/tab-separated-values',
    type: 'text',
    subtype: 'tab-separated-values',
    extensions: ['tsv'],
    charset: 'UTF-8',
    compressible: true,
    label: 'TSV data',
  },
  {
    mime: 'text/vcard',
    type: 'text',
    subtype: 'vcard',
    extensions: ['vcard', 'vcf'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Contact card',
  },
  {
    mime: 'text/richtext',
    type: 'text',
    subtype: 'richtext',
    extensions: ['rtx'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Rich text',
  },
  {
    mime: 'text/rtf',
    type: 'text',
    subtype: 'rtf',
    extensions: ['rtf'],
    charset: 'UTF-8',
    compressible: false,
    label: 'RTF document',
  },
  {
    mime: 'text/uri-list',
    type: 'text',
    subtype: 'uri-list',
    extensions: ['uris', 'uri'],
    charset: 'UTF-8',
    compressible: true,
    label: 'URI list',
  },
  {
    mime: 'text/enriched',
    type: 'text',
    subtype: 'enriched',
    extensions: ['enriched'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Enriched text',
  },

  // ── application: web & data ──────────────────────────────
  {
    mime: 'application/json',
    type: 'application',
    subtype: 'json',
    extensions: ['json', 'map'],
    charset: 'UTF-8',
    compressible: true,
    label: 'JSON data',
  },
  {
    mime: 'application/pdf',
    type: 'application',
    subtype: 'pdf',
    extensions: ['pdf'],
    compressible: false,
    label: 'PDF document',
  },
  {
    mime: 'application/xml',
    type: 'application',
    subtype: 'xml',
    extensions: ['xml', 'xsd'],
    charset: 'UTF-8',
    compressible: true,
    label: 'XML data',
  },
  {
    mime: 'application/zip',
    type: 'application',
    subtype: 'zip',
    extensions: ['zip'],
    compressible: false,
    label: 'ZIP archive',
  },
  {
    mime: 'application/gzip',
    type: 'application',
    subtype: 'gzip',
    extensions: ['gz', 'gzip'],
    compressible: false,
    label: 'Gzip archive',
  },
  {
    mime: 'application/x-tar',
    type: 'application',
    subtype: 'x-tar',
    extensions: ['tar'],
    compressible: false,
    label: 'Tar archive',
  },
  {
    mime: 'application/x-7z-compressed',
    type: 'application',
    subtype: 'x-7z-compressed',
    extensions: ['7z'],
    compressible: false,
    label: '7z archive',
  },
  {
    mime: 'application/x-rar-compressed',
    type: 'application',
    subtype: 'x-rar-compressed',
    extensions: ['rar'],
    aliases: ['application/vnd.rar'],
    compressible: false,
    label: 'RAR archive',
  },
  {
    mime: 'application/vnd.rar',
    type: 'application',
    subtype: 'vnd.rar',
    extensions: ['rar'],
    compressible: false,
    label: 'RAR archive (vnd)',
  },
  {
    mime: 'application/x-bzip2',
    type: 'application',
    subtype: 'x-bzip2',
    extensions: ['bz2'],
    compressible: false,
    label: 'Bzip2 archive',
  },
  {
    mime: 'application/x-httpd-php',
    type: 'application',
    subtype: 'x-httpd-php',
    extensions: ['php', 'php3', 'php4', 'php5', 'php7', 'phps'],
    compressible: true,
    label: 'PHP source',
  },
  {
    mime: 'application/graphql',
    type: 'application',
    subtype: 'graphql',
    extensions: ['graphql', 'gql'],
    charset: 'UTF-8',
    compressible: true,
    label: 'GraphQL schema',
  },
  {
    mime: 'application/wasm',
    type: 'application',
    subtype: 'wasm',
    extensions: ['wasm'],
    compressible: true,
    label: 'WebAssembly module',
  },
  {
    mime: 'application/sql',
    type: 'application',
    subtype: 'sql',
    extensions: ['sql'],
    compressible: true,
    label: 'SQL script',
  },
  {
    mime: 'application/x-yaml',
    type: 'application',
    subtype: 'x-yaml',
    extensions: ['yaml', 'yml'],
    aliases: ['text/yaml', 'text/x-yaml'],
    compressible: true,
    label: 'YAML document',
  },
  {
    mime: 'application/toml',
    type: 'application',
    subtype: 'toml',
    extensions: ['toml'],
    compressible: true,
    label: 'TOML document',
  },
  {
    mime: 'application/manifest+json',
    type: 'application',
    subtype: 'manifest+json',
    extensions: ['webmanifest'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Web app manifest',
  },

  // ── application: documents ───────────────────────────────
  {
    mime: 'application/msword',
    type: 'application',
    subtype: 'msword',
    extensions: ['doc', 'dot'],
    compressible: false,
    label: 'Word document',
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['docx'],
    compressible: true,
    label: 'Word document (OOXML)',
  },
  {
    mime: 'application/vnd.ms-excel',
    type: 'application',
    subtype: 'vnd.ms-excel',
    extensions: ['xls', 'xlm', 'xla'],
    compressible: false,
    label: 'Excel workbook',
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['xlsx'],
    compressible: true,
    label: 'Excel workbook (OOXML)',
  },
  {
    mime: 'application/vnd.ms-powerpoint',
    type: 'application',
    subtype: 'vnd.ms-powerpoint',
    extensions: ['ppt', 'pps', 'pot'],
    compressible: false,
    label: 'PowerPoint presentation',
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    type: 'application',
    subtype: 'vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['pptx'],
    compressible: true,
    label: 'PowerPoint presentation (OOXML)',
  },
  {
    mime: 'application/vnd.oasis.opendocument.text',
    type: 'application',
    subtype: 'vnd.oasis.opendocument.text',
    extensions: ['odt'],
    compressible: true,
    label: 'OpenDocument text',
  },
  {
    mime: 'application/vnd.oasis.opendocument.spreadsheet',
    type: 'application',
    subtype: 'vnd.oasis.opendocument.spreadsheet',
    extensions: ['ods'],
    compressible: true,
    label: 'OpenDocument spreadsheet',
  },
  {
    mime: 'application/vnd.oasis.opendocument.presentation',
    type: 'application',
    subtype: 'vnd.oasis.opendocument.presentation',
    extensions: ['odp'],
    compressible: true,
    label: 'OpenDocument presentation',
  },
  {
    mime: 'application/rtf',
    type: 'application',
    subtype: 'rtf',
    extensions: ['rtf'],
    compressible: false,
    label: 'RTF document (app)',
  },
  {
    mime: 'application/vnd.ms-works',
    type: 'application',
    subtype: 'vnd.ms-works',
    extensions: ['wps', 'wks', 'wcm'],
    compressible: false,
    label: 'Works document',
  },

  // ── application: images & media containers ───────────────
  {
    mime: 'application/x-shockwave-flash',
    type: 'application',
    subtype: 'x-shockwave-flash',
    extensions: ['swf', 'cab'],
    compressible: false,
    label: 'Flash movie',
  },
  {
    mime: 'application/vnd.rn-realmedia',
    type: 'application',
    subtype: 'vnd.rn-realmedia',
    extensions: ['rm'],
    compressible: false,
    label: 'RealMedia',
  },
  {
    mime: 'application/x-msdownload',
    type: 'application',
    subtype: 'x-msdownload',
    extensions: ['exe', 'dll', 'com', 'bat', 'msi'],
    compressible: false,
    label: 'Windows executable',
  },

  // ── application: fonts ───────────────────────────────────
  {
    mime: 'application/font-woff',
    type: 'application',
    subtype: 'font-woff',
    extensions: ['woff'],
    aliases: ['font/woff', 'application/x-font-woff'],
    compressible: true,
    label: 'WOFF font',
  },
  {
    mime: 'application/font-woff2',
    type: 'application',
    subtype: 'font-woff2',
    extensions: ['woff2'],
    aliases: ['font/woff2'],
    compressible: true,
    label: 'WOFF2 font',
  },
  {
    mime: 'font/woff',
    type: 'font',
    subtype: 'woff',
    extensions: ['woff'],
    compressible: true,
    label: 'WOFF font (font)',
  },
  {
    mime: 'font/woff2',
    type: 'font',
    subtype: 'woff2',
    extensions: ['woff2'],
    compressible: true,
    label: 'WOFF2 font (font)',
  },
  {
    mime: 'font/ttf',
    type: 'font',
    subtype: 'ttf',
    extensions: ['ttf'],
    aliases: ['application/x-font-ttf', 'font/truetype'],
    compressible: true,
    label: 'TrueType font',
  },
  {
    mime: 'font/otf',
    type: 'font',
    subtype: 'otf',
    extensions: ['otf'],
    aliases: ['application/x-font-otf', 'font/opentype'],
    compressible: true,
    label: 'OpenType font',
  },
  {
    mime: 'font/collection',
    type: 'font',
    subtype: 'collection',
    extensions: ['ttc'],
    compressible: true,
    label: 'Font collection',
  },
  {
    mime: 'application/vnd.ms-fontobject',
    type: 'application',
    subtype: 'vnd.ms-fontobject',
    extensions: ['eot'],
    compressible: false,
    label: 'Embedded OpenType font',
  },
  {
    mime: 'application/x-font-ttf',
    type: 'application',
    subtype: 'x-font-ttf',
    extensions: ['ttf'],
    compressible: true,
    label: 'TrueType font (app)',
  },
  {
    mime: 'application/x-font-opentype',
    type: 'application',
    subtype: 'x-font-opentype',
    extensions: ['otf'],
    compressible: true,
    label: 'OpenType font (app)',
  },
  {
    mime: 'application/x-font-type1',
    type: 'application',
    subtype: 'x-font-type1',
    extensions: ['pfa', 'pfb', 'pfm', 'afm'],
    compressible: false,
    label: 'PostScript Type 1 font',
  },

  // ── application: office & misc binary ────────────────────
  {
    mime: 'application/octet-stream',
    type: 'application',
    subtype: 'octet-stream',
    extensions: ['bin', 'dms', 'lrf', 'mar', 'so', 'dist', 'elc', 'dmz', 'iso'],
    compressible: false,
    label: 'Binary data',
  },
  {
    mime: 'application/x-iso9660-image',
    type: 'application',
    subtype: 'x-iso9660-image',
    extensions: ['iso'],
    aliases: ['application/octet-stream'],
    compressible: false,
    label: 'ISO disk image',
  },
  {
    mime: 'application/epub+zip',
    type: 'application',
    subtype: 'epub+zip',
    extensions: ['epub'],
    compressible: false,
    label: 'EPUB book',
  },
  {
    mime: 'application/java-archive',
    type: 'application',
    subtype: 'java-archive',
    extensions: ['jar', 'war', 'ear'],
    compressible: false,
    label: 'Java archive',
  },
  {
    mime: 'application/x-abiword',
    type: 'application',
    subtype: 'x-abiword',
    extensions: ['abw', 'abw-crtd', 'abw.gz', 'zabw'],
    compressible: false,
    label: 'AbiWord document',
  },
  {
    mime: 'application/vnd.amazon.ebook',
    type: 'application',
    subtype: 'vnd.amazon.ebook',
    extensions: ['azw'],
    compressible: false,
    label: 'Amazon Kindle book',
  },
  {
    mime: 'application/postscript',
    type: 'application',
    subtype: 'postscript',
    extensions: ['ai', 'eps', 'ps'],
    compressible: false,
    label: 'PostScript document',
  },
  {
    mime: 'application/x-csh',
    type: 'application',
    subtype: 'x-csh',
    extensions: ['csh'],
    compressible: true,
    label: 'C shell script',
  },
  {
    mime: 'application/x-sh',
    type: 'application',
    subtype: 'x-sh',
    extensions: ['sh'],
    compressible: true,
    label: 'Shell script',
  },
  {
    mime: 'application/x-dvi',
    type: 'application',
    subtype: 'x-dvi',
    extensions: ['dvi'],
    compressible: false,
    label: 'TeX DVI document',
  },
  {
    mime: 'application/x-latex',
    type: 'application',
    subtype: 'x-latex',
    extensions: ['latex'],
    compressible: true,
    label: 'LaTeX source',
  },
  {
    mime: 'application/x-sqlite3',
    type: 'application',
    subtype: 'x-sqlite3',
    extensions: ['sqlite', 'db'],
    compressible: false,
    label: 'SQLite database',
  },
  {
    mime: 'application/vcard+json',
    type: 'application',
    subtype: 'vcard+json',
    extensions: ['vcard'],
    charset: 'UTF-8',
    compressible: true,
    label: 'vCard JSON',
  },
  {
    mime: 'application/vnd.apple.pkpass',
    type: 'application',
    subtype: 'vnd.apple.pkpass',
    extensions: ['pkpass'],
    compressible: false,
    label: 'Apple wallet pass',
  },
  {
    mime: 'application/vnd.visio',
    type: 'application',
    subtype: 'vnd.visio',
    extensions: ['vsd', 'vst'],
    compressible: false,
    label: 'Visio document',
  },
  {
    mime: 'application/x-nesrom',
    type: 'application',
    subtype: 'x-nesrom',
    extensions: ['nes'],
    compressible: false,
    label: 'NES ROM',
  },
  {
    mime: 'application/pkix-cert',
    type: 'application',
    subtype: 'pkix-cert',
    extensions: ['cer'],
    compressible: false,
    label: 'PKIX certificate',
  },
  {
    mime: 'application/x-pkcs12',
    type: 'application',
    subtype: 'x-pkcs12',
    extensions: ['p12', 'pfx'],
    compressible: false,
    label: 'PKCS#12 key store',
  },
  {
    mime: 'image/x-freehand',
    type: 'image',
    subtype: 'x-freehand',
    extensions: ['fh', 'fhc', 'fh4', 'fh5', 'fh7'],
    compressible: false,
    label: 'Freehand image',
  },
  {
    mime: 'image/x-jng',
    type: 'image',
    subtype: 'x-jng',
    extensions: ['jng'],
    compressible: false,
    label: 'JNG image',
  },
  {
    mime: 'image/jp2',
    type: 'image',
    subtype: 'jp2',
    extensions: ['jp2', 'jpg2'],
    aliases: ['image/jpeg2000', 'image/jpm', 'image/jpx'],
    compressible: false,
    label: 'JPEG 2000 image',
  },
  {
    mime: 'image/aces',
    type: 'image',
    subtype: 'aces',
    extensions: ['exr'],
    compressible: false,
    label: 'ACES image',
  },
  {
    mime: 'video/x-sgi-movie',
    type: 'video',
    subtype: 'x-sgi-movie',
    extensions: ['movie'],
    compressible: false,
    label: 'SGI movie',
  },
  {
    mime: 'video/x-dv',
    type: 'video',
    subtype: 'x-dv',
    extensions: ['dif', 'dv'],
    compressible: false,
    label: 'Digital video',
  },
  {
    mime: 'video/annodex',
    type: 'video',
    subtype: 'annodex',
    extensions: ['axv'],
    compressible: true,
    label: 'Annodex video',
  },
  {
    mime: 'video/vnd.uvvu.mp4',
    type: 'video',
    subtype: 'vnd.uvvu.mp4',
    extensions: ['uvu', 'uvvu'],
    compressible: false,
    label: 'UVVU video',
  },
  {
    mime: 'video/vivo',
    type: 'video',
    subtype: 'vivo',
    extensions: ['viv', 'vivo'],
    compressible: false,
    label: 'Vivo video',
  },
  {
    mime: 'audio/x-caf',
    type: 'audio',
    subtype: 'x-caf',
    extensions: ['caf'],
    compressible: false,
    label: 'CAF audio',
  },
  {
    mime: 'audio/mp3',
    type: 'audio',
    subtype: 'mp3',
    extensions: ['mp3'],
    compressible: false,
    label: 'MP3 audio (alternate)',
  },
  {
    mime: 'audio/g722',
    type: 'audio',
    subtype: 'g722',
    extensions: ['g722'],
    compressible: false,
    label: 'G.722 audio',
  },
  {
    mime: 'audio/g729',
    type: 'audio',
    subtype: 'g729',
    extensions: ['g729'],
    compressible: false,
    label: 'G.729 audio',
  },
  {
    mime: 'audio/dls',
    type: 'audio',
    subtype: 'dls',
    extensions: ['dls'],
    compressible: false,
    label: 'Downloadable sounds',
  },
  {
    mime: 'audio/j2k',
    type: 'audio',
    subtype: 'j2k',
    extensions: ['j2k'],
    compressible: false,
    label: 'JPEG 2000 audio stream',
  },
  {
    mime: 'text/ecmascript',
    type: 'text',
    subtype: 'ecmascript',
    extensions: ['es'],
    charset: 'UTF-8',
    compressible: true,
    label: 'ECMAScript source',
  },
  {
    mime: 'text/less',
    type: 'text',
    subtype: 'less',
    extensions: ['less'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Less stylesheet',
  },
  {
    mime: 'text/scss',
    type: 'text',
    subtype: 'scss',
    extensions: ['scss'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Sass stylesheet',
  },
  {
    mime: 'text/spreadsheet',
    type: 'text',
    subtype: 'spreadsheet',
    extensions: ['sls'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Spreadsheet text',
  },
  {
    mime: 'text/troff',
    type: 'text',
    subtype: 'troff',
    extensions: ['t', 'troff', 'roff', 'man', 'me', 'ms'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Troff document',
  },
  {
    mime: 'text/turtle',
    type: 'text',
    subtype: 'turtle',
    extensions: ['ttl'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Turtle RDF',
  },
  {
    mime: 'application/x-shockwave-flash2-preview',
    type: 'application',
    subtype: 'x-shockwave-flash2-preview',
    extensions: ['swf'],
    compressible: false,
    label: 'Flash preview',
  },
  {
    mime: 'application/vnd.wordperfect',
    type: 'application',
    subtype: 'vnd.wordperfect',
    extensions: ['wpd', 'wp5', 'wp4', 'wpp'],
    compressible: false,
    label: 'WordPerfect document',
  },
  {
    mime: 'application/x-bittorrent',
    type: 'application',
    subtype: 'x-bittorrent',
    extensions: ['torrent'],
    compressible: false,
    label: 'BitTorrent metadata',
  },
  {
    mime: 'application/x-chrome-extension',
    type: 'application',
    subtype: 'x-chrome-extension',
    extensions: ['crx'],
    compressible: false,
    label: 'Chrome extension',
  },
  {
    mime: 'application/x-debian-package',
    type: 'application',
    subtype: 'x-debian-package',
    extensions: ['deb', 'udeb'],
    compressible: false,
    label: 'Debian package',
  },
  {
    mime: 'application/x-redhat-package-manager',
    type: 'application',
    subtype: 'x-redhat-package-manager',
    extensions: ['rpm'],
    compressible: false,
    label: 'RPM package',
  },
  {
    mime: 'application/xml-dtd',
    type: 'application',
    subtype: 'xml-dtd',
    extensions: ['dtd'],
    charset: 'UTF-8',
    compressible: true,
    label: 'XML DTD',
  },
  {
    mime: 'application/mbox',
    type: 'application',
    subtype: 'mbox',
    extensions: ['mbox'],
    compressible: true,
    label: 'Mailbox data',
  },
  {
    mime: 'application/pgp-keys',
    type: 'application',
    subtype: 'pgp-keys',
    extensions: ['key'],
    compressible: true,
    label: 'PGP keys',
  },
  {
    mime: 'application/pgp-signature',
    type: 'application',
    subtype: 'pgp-signature',
    extensions: ['sig', 'asc'],
    compressible: true,
    label: 'PGP signature',
  },
  {
    mime: 'application/rdf+xml',
    type: 'application',
    subtype: 'rdf+xml',
    extensions: ['rdf', 'owl'],
    charset: 'UTF-8',
    compressible: true,
    label: 'RDF XML',
  },
  {
    mime: 'application/rss+xml',
    type: 'application',
    subtype: 'rss+xml',
    extensions: ['rss'],
    charset: 'UTF-8',
    compressible: true,
    label: 'RSS feed',
  },
  {
    mime: 'application/atom+xml',
    type: 'application',
    subtype: 'atom+xml',
    extensions: ['atom'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Atom feed',
  },
  {
    mime: 'application/vnd.google-earth.kml+xml',
    type: 'application',
    subtype: 'vnd.google-earth.kml+xml',
    extensions: ['kml'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Google Earth KML',
  },
  {
    mime: 'application/vnd.google-earth.kmz',
    type: 'application',
    subtype: 'vnd.google-earth.kmz',
    extensions: ['kmz'],
    compressible: false,
    label: 'Google Earth KMZ',
  },
  {
    mime: 'application/x-wais-source',
    type: 'application',
    subtype: 'x-wais-source',
    extensions: ['src', 'wsrc'],
    compressible: true,
    label: 'WAIS source',
  },
  {
    mime: 'application/patch-notes',
    type: 'application',
    subtype: 'patch-notes',
    extensions: ['patch', 'diff'],
    compressible: true,
    label: 'Patch notes',
  },
  {
    mime: 'application/mac-binhex40',
    type: 'application',
    subtype: 'mac-binhex40',
    extensions: ['hqx'],
    compressible: false,
    label: 'Mac BinHex',
  },
  {
    mime: 'application/mac-compactpro',
    type: 'application',
    subtype: 'mac-compactpro',
    extensions: ['cpt'],
    compressible: false,
    label: 'Compact Pro archive',
  },
  {
    mime: 'font/sfnt',
    type: 'font',
    subtype: 'sfnt',
    extensions: ['sfnt'],
    aliases: ['application/font-sfnt'],
    compressible: true,
    label: 'SFNT font container',
  },
  {
    mime: 'image/vnd.dwg',
    type: 'image',
    subtype: 'vnd.dwg',
    extensions: ['dwg', 'dxf', 'svf'],
    compressible: false,
    label: 'AutoCAD drawing',
  },
  {
    mime: 'image/g3fax',
    type: 'image',
    subtype: 'g3fax',
    extensions: ['g3'],
    compressible: false,
    label: 'G3 fax image',
  },
  {
    mime: 'text/x-nfo',
    type: 'text',
    subtype: 'x-nfo',
    extensions: ['nfo'],
    charset: 'UTF-8',
    compressible: true,
    label: 'NFO file (alt)',
  },
  {
    mime: 'text/x-java-source',
    type: 'text',
    subtype: 'x-java-source',
    extensions: ['java'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Java source',
  },
  {
    mime: 'text/x-c',
    type: 'text',
    subtype: 'x-c',
    extensions: ['c', 'cc', 'cpp', 'cxx', 'h', 'hh'],
    charset: 'UTF-8',
    compressible: true,
    label: 'C/C++ source',
  },
  {
    mime: 'text/x-python',
    type: 'text',
    subtype: 'x-python',
    extensions: ['py', 'pyw'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Python script',
  },
  {
    mime: 'text/x-ruby',
    type: 'text',
    subtype: 'x-ruby',
    extensions: ['rb'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Ruby script',
  },
  {
    mime: 'text/x-perl',
    type: 'text',
    subtype: 'x-perl',
    extensions: ['pl', 'pm'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Perl script',
  },
  {
    mime: 'text/x-go',
    type: 'text',
    subtype: 'x-go',
    extensions: ['go'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Go source',
  },
  {
    mime: 'text/x-rust',
    type: 'text',
    subtype: 'x-rust',
    extensions: ['rs'],
    charset: 'UTF-8',
    compressible: true,
    label: 'Rust source',
  },
  {
    mime: 'application/x-pem-file',
    type: 'application',
    subtype: 'x-pem-file',
    extensions: ['pem'],
    compressible: true,
    label: 'PEM certificate',
  },
];

/** Count of unique MIME type strings in the database. */
export const MIME_DATABASE_SIZE = new Set(MIME_DATABASE.map((entry) => entry.mime)).size;

/** Categories present in the database, sorted alphabetically. */
export const MIME_CATEGORIES: readonly string[] = Array.from(
  new Set(MIME_DATABASE.map((entry) => entry.type))
).sort();

/** Normalized lowercase extension; strips any leading dot. */
export function normalizeExtension(input: string): string {
  return input.trim().replace(/^\./, '').toLowerCase();
}

/** True when a string is a bare extension token (letters, digits, +-._ only). */
export function isBareExtension(input: string): boolean {
  return /^[a-z0-9][a-z0-9+\-_.]*$/.test(normalizeExtension(input));
}

/** Look up the first entry whose extension list contains the given extension. */
export function lookupByExtension(extension: string): MimeEntry | null {
  const ext = normalizeExtension(extension);
  if (!ext) return null;
  const direct = MIME_DATABASE.find((entry) => entry.extensions.includes(ext));
  if (direct) return direct;
  const withAlias = MIME_DATABASE.find((entry) =>
    entry.aliases?.some((alias) => alias.toLowerCase() === ext)
  );
  return withAlias ?? null;
}

/** All MIME entries whose type matches the category filter. */
export function filterByCategory(entries: MimeEntry[], category: string): MimeEntry[] {
  if (category === 'all') return entries;
  return entries.filter((entry) => entry.type === category);
}

/** Exact-match lookup by full MIME string. */
export function lookupByMime(mime: string): MimeEntry | null {
  const needle = mime.trim().toLowerCase();
  if (!needle) return null;
  return MIME_DATABASE.find((entry) => entry.mime === needle) ?? null;
}

/** All entries sharing the same base type string (suffix search like "image/"). */
export function searchByPrefix(prefix: string): MimeEntry[] {
  const needle = prefix.trim().toLowerCase().replace(/\/+$/, '');
  if (!needle) return [];
  const exact = MIME_DATABASE.filter((entry) => entry.mime === needle);
  if (exact.length > 0) return exact;
  return MIME_DATABASE.filter((entry) => entry.mime.startsWith(`${needle}/`));
}

/**
 * General search used by the Canvas search box.
 * Matches extensions, subtypes, full MIME strings, labels, and aliases.
 */
export function searchMime(query: string, category = 'all'): MimeEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return filterByCategory(MIME_DATABASE, category);
  const dotless = normalizeExtension(needle);
  const matches = MIME_DATABASE.filter((entry) => {
    if (category !== 'all' && entry.type !== category) return false;
    if (entry.extensions.some((ext) => ext === dotless)) return true;
    if (entry.mime.includes(dotless)) return true;
    if (entry.subtype.includes(dotless)) return true;
    if (entry.label.toLowerCase().includes(dotless)) return true;
    return entry.aliases?.some((alias) => alias.includes(dotless)) ?? false;
  });
  return matches;
}

/** Reverse lookup: all extensions registered for a MIME type string. */
export function extensionsForMime(mime: string): string[] {
  const entry = lookupByMime(mime);
  if (!entry) return [];
  return entry.extensions;
}

/** Suffix used to build a base64 data-URI prefix, e.g. "data:image/png;base64,". */
export function dataUriPrefix(entry: MimeEntry): string {
  const charset = entry.charset ? `;charset=${entry.charset}` : '';
  return `data:${entry.mime}${charset};base64,`;
}

export interface Snippets {
  /** The plain MIME type string. */
  mime: string;
  /** data: prefix for embedding binary payloads. */
  dataUri: string;
  /** HTTP Accept header value. */
  acceptHeader: string;
}

/** Copyable snippets for a MIME entry. */
export function snippetsFor(entry: MimeEntry): Snippets {
  return {
    mime: entry.mime,
    dataUri: dataUriPrefix(entry),
    acceptHeader: `Accept: ${entry.mime}`,
  };
}

/** Friendly not-found message for a failed extension lookup. */
export function notFoundMessage(query: string): string {
  if (!query.trim()) return 'Enter a file extension to look up its MIME type.';
  if (isBareExtension(query)) {
    return `No MIME type found for "${normalizeExtension(query)}". Try a different extension.`;
  }
  return `"${query}" does not look like a file extension. Try something like "png" or ".svg".`;
}

/** True when a state value is a valid ToolState shape (lenient on history). */
export function isValidState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    (v.mode === 'extension' || v.mode === 'prefix' || v.mode === 'reverse') &&
    typeof v.query === 'string' &&
    typeof v.category === 'string' &&
    typeof v.exactOnly === 'boolean' &&
    typeof v.reverseMime === 'string' &&
    Array.isArray(v.history)
  );
}

/** Compact summary line for a given query state, used in status/copy. */
export function resultText(state: ToolState): string {
  if (state.mode === 'reverse') {
    const exts = extensionsForMime(state.reverseMime);
    return exts.length > 0
      ? `${state.reverseMime} → ${exts.join(', ')}`
      : `${state.reverseMime} → no extensions found`;
  }
  const entries = searchMime(state.query, state.category);
  if (entries.length === 0) return notFoundMessage(state.query);
  const first = entries[0];
  if (!first) return notFoundMessage(state.query);
  const extra = entries.length > 1 ? ` (+${entries.length - 1} more)` : '';
  return `${first.mime}${extra}`;
}

/** Steps shown in the detail panel. */
export function stepsFor(state: ToolState): string[] {
  if (state.mode === 'reverse') {
    const exts = extensionsForMime(state.reverseMime);
    return exts.length > 0
      ? [`Base: ${state.reverseMime}`, `Matches: ${exts.join(', ')}`]
      : ['Enter a known MIME type to see matching extensions.'];
  }
  const entries = searchMime(state.query, state.category);
  if (entries.length === 0) return [notFoundMessage(state.query)];
  return entries
    .slice(0, 5)
    .map(
      (entry) =>
        `${entry.mime} — ${entry.label}${entry.extensions.length ? ` (.${entry.extensions.join(', .')})` : ''}`
    );
}

/** Compact summary used by status bar and copy actions. */
export function summaryText(state: ToolState): string {
  if (state.mode === 'reverse') {
    const exts = extensionsForMime(state.reverseMime);
    return exts.length > 0
      ? `Reverse: ${state.reverseMime} → ${exts.length} extension${exts.length === 1 ? '' : 's'}`
      : `Reverse: ${state.reverseMime} → none`;
  }
  const entries = searchMime(state.query, state.category);
  if (entries.length === 0) {
    return state.query.trim() ? `No matches for "${state.query}"` : 'Enter a query to search';
  }
  const first = entries[0];
  if (!first) return 'Enter a query to search';
  return `${first.label}: ${first.mime}`;
}

/** Build a history entry text for the current state. */
export function historyText(state: ToolState): string {
  return summaryText(state);
}

export { searchMime as searchMimeTypes };
