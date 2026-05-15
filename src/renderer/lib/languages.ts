export type LanguageConfig = {
  id: string;
  label: string;
  monacoId: string;
  color: string;
  extensions: readonly string[];
  filenames?: readonly string[];
};

const LANGUAGES: readonly LanguageConfig[] = [
  { id: 'js',         label: 'JavaScript',   monacoId: 'javascript',       color: '#f1d96d', extensions: ['.js', '.mjs', '.cjs', '.jsx'] },
  { id: 'ts',         label: 'TypeScript',   monacoId: 'typescript',       color: '#5ab7ff', extensions: ['.ts', '.tsx', '.mts', '.cts'] },
  { id: 'vue',        label: 'Vue',          monacoId: 'html',             color: '#4fc08d', extensions: ['.vue'] },
  { id: 'svelte',     label: 'Svelte',       monacoId: 'html',             color: '#ff6e51', extensions: ['.svelte'] },
  { id: 'astro',      label: 'Astro',        monacoId: 'html',             color: '#ff5d01', extensions: ['.astro'] },

  { id: 'c',          label: 'C',            monacoId: 'c',                color: '#9aaad1', extensions: ['.c', '.h'] },
  { id: 'cpp',        label: 'C++',          monacoId: 'cpp',              color: '#a679d5', extensions: ['.cpp', '.cxx', '.cc', '.hpp', '.hxx', '.ipp'] },
  { id: 'cs',         label: 'C#',           monacoId: 'csharp',           color: '#b97ed9', extensions: ['.cs'] },
  { id: 'rs',         label: 'Rust',         monacoId: 'rust',             color: '#d99b73', extensions: ['.rs'] },
  { id: 'go',         label: 'Go',           monacoId: 'go',               color: '#5dc9a8', extensions: ['.go'] },
  { id: 'zig',        label: 'Zig',          monacoId: 'plaintext',        color: '#ec9156', extensions: ['.zig'] },
  { id: 'nim',        label: 'Nim',          monacoId: 'plaintext',        color: '#efc150', extensions: ['.nim'] },
  { id: 'd',          label: 'D',            monacoId: 'plaintext',        color: '#cd6b5f', extensions: ['.d'] },
  { id: 'swift',      label: 'Swift',        monacoId: 'swift',            color: '#f05138', extensions: ['.swift'] },
  { id: 'objc',       label: 'Objective-C',  monacoId: 'objective-c',      color: '#9aaad1', extensions: ['.m', '.mm'] },
  { id: 'pas',        label: 'Pascal',       monacoId: 'pascal',           color: '#b06a3c', extensions: ['.pas', '.pp'] },

  { id: 'java',       label: 'Java',         monacoId: 'java',             color: '#e07b5a', extensions: ['.java'] },
  { id: 'kt',         label: 'Kotlin',       monacoId: 'kotlin',           color: '#b78aff', extensions: ['.kt', '.kts'] },
  { id: 'scala',      label: 'Scala',        monacoId: 'scala',            color: '#dc322f', extensions: ['.scala', '.sc'] },
  { id: 'groovy',     label: 'Groovy',       monacoId: 'plaintext',        color: '#7accc8', extensions: ['.groovy', '.gradle'] },
  { id: 'clj',        label: 'Clojure',      monacoId: 'clojure',          color: '#7ac76a', extensions: ['.clj', '.cljs', '.cljc', '.edn'] },

  { id: 'dart',       label: 'Dart',         monacoId: 'dart',             color: '#52b6dc', extensions: ['.dart'] },
  { id: 'py',         label: 'Python',       monacoId: 'python',           color: '#9bd17a', extensions: ['.py', '.pyi', '.pyw'] },
  { id: 'rb',         label: 'Ruby',         monacoId: 'ruby',             color: '#cc342d', extensions: ['.rb', '.rake', '.gemspec'], filenames: ['Gemfile', 'Rakefile'] },
  { id: 'lua',        label: 'Lua',          monacoId: 'lua',              color: '#6286d4', extensions: ['.lua'] },
  { id: 'pl',         label: 'Perl',         monacoId: 'perl',             color: '#79a8e0', extensions: ['.pl', '.pm'] },
  { id: 'php',        label: 'PHP',          monacoId: 'php',              color: '#8e93cf', extensions: ['.php', '.phtml'] },
  { id: 'r',          label: 'R',            monacoId: 'r',                color: '#3a8bcf', extensions: ['.r', '.rmd'] },
  { id: 'jl',         label: 'Julia',        monacoId: 'julia',            color: '#a86dc1', extensions: ['.jl'] },
  { id: 'cr',         label: 'Crystal',      monacoId: 'plaintext',        color: '#8e8e93', extensions: ['.cr'] },

  { id: 'hs',         label: 'Haskell',      monacoId: 'plaintext',        color: '#9b6cb5', extensions: ['.hs', '.lhs'] },
  { id: 'elm',        label: 'Elm',          monacoId: 'plaintext',        color: '#56b0d0', extensions: ['.elm'] },
  { id: 'ex',         label: 'Elixir',       monacoId: 'elixir',           color: '#a779b5', extensions: ['.ex', '.exs'] },
  { id: 'erl',        label: 'Erlang',       monacoId: 'plaintext',        color: '#b6418f', extensions: ['.erl', '.hrl'] },
  { id: 'fs',         label: 'F#',           monacoId: 'fsharp',           color: '#52a3d4', extensions: ['.fs', '.fsx', '.fsi'] },
  { id: 'ml',         label: 'OCaml',        monacoId: 'plaintext',        color: '#ec8a31', extensions: ['.ml', '.mli'] },
  { id: 'rkt',        label: 'Racket',       monacoId: 'scheme',           color: '#9f1d20', extensions: ['.rkt'] },
  { id: 'scm',        label: 'Scheme',       monacoId: 'scheme',           color: '#7a8c91', extensions: ['.scm', '.ss'] },
  { id: 'lisp',       label: 'Lisp',         monacoId: 'plaintext',        color: '#9aaad1', extensions: ['.lisp', '.cl'] },

  { id: 'sh',         label: 'Shell',        monacoId: 'shell',            color: '#8acc4f', extensions: ['.sh', '.bash', '.zsh', '.fish'] },
  { id: 'ps1',        label: 'PowerShell',   monacoId: 'powershell',       color: '#5391fe', extensions: ['.ps1', '.psm1', '.psd1'] },
  { id: 'bat',        label: 'Batch',        monacoId: 'bat',              color: '#c1d12e', extensions: ['.bat', '.cmd'] },
  { id: 'docker',     label: 'Dockerfile',   monacoId: 'dockerfile',       color: '#3a7ec1', extensions: ['.dockerfile'], filenames: ['Dockerfile', 'Containerfile'] },
  { id: 'make',       label: 'Makefile',     monacoId: 'plaintext',        color: '#7d9c4c', extensions: ['.mk', '.mak'], filenames: ['Makefile', 'GNUmakefile'] },

  { id: 'html',       label: 'HTML',         monacoId: 'html',             color: '#e07a5f', extensions: ['.html', '.htm', '.xhtml'] },
  { id: 'css',        label: 'CSS',          monacoId: 'css',              color: '#a288e3', extensions: ['.css'] },
  { id: 'scss',       label: 'SCSS',         monacoId: 'scss',             color: '#cf649a', extensions: ['.scss', '.sass'] },
  { id: 'less',       label: 'LESS',         monacoId: 'less',             color: '#5d83b3', extensions: ['.less'] },
  { id: 'pug',        label: 'Pug',          monacoId: 'pug',              color: '#a86b3f', extensions: ['.pug', '.jade'] },
  { id: 'graphql',    label: 'GraphQL',      monacoId: 'graphql',          color: '#e535ab', extensions: ['.graphql', '.gql'] },

  { id: 'json',       label: 'JSON',         monacoId: 'json',             color: '#cfa56b', extensions: ['.json', '.jsonc', '.json5'] },
  { id: 'yaml',       label: 'YAML',         monacoId: 'yaml',             color: '#d75050', extensions: ['.yml', '.yaml'] },
  { id: 'toml',       label: 'TOML',         monacoId: 'plaintext',        color: '#c87a48', extensions: ['.toml'] },
  { id: 'xml',        label: 'XML',          monacoId: 'xml',              color: '#cf8841', extensions: ['.xml', '.xsd', '.xsl', '.svg'] },
  { id: 'ini',        label: 'INI',          monacoId: 'ini',              color: '#8b8b93', extensions: ['.ini', '.cfg', '.conf'] },
  { id: 'env',        label: 'Env',          monacoId: 'plaintext',        color: '#ecd53f', extensions: ['.env'], filenames: ['.env', '.env.local', '.env.production'] },
  { id: 'csv',        label: 'CSV',          monacoId: 'plaintext',        color: '#7a9c5a', extensions: ['.csv', '.tsv'] },
  { id: 'proto',      label: 'Protobuf',     monacoId: 'protobuf',         color: '#4285f4', extensions: ['.proto'] },
  { id: 'hcl',        label: 'HCL',          monacoId: 'hcl',              color: '#9b5fd5', extensions: ['.tf', '.hcl', '.tfvars'] },

  { id: 'sql',        label: 'SQL',          monacoId: 'sql',              color: '#e38e2f', extensions: ['.sql'] },

  { id: 'md',         label: 'Markdown',     monacoId: 'markdown',         color: '#8b9bb4', extensions: ['.md', '.markdown', '.mdx'] },
  { id: 'tex',        label: 'LaTeX',        monacoId: 'plaintext',        color: '#5a8c3a', extensions: ['.tex', '.bib'] },
  { id: 'rst',        label: 'reST',         monacoId: 'restructuredtext', color: '#bb8fce', extensions: ['.rst'] },
  { id: 'adoc',       label: 'AsciiDoc',     monacoId: 'plaintext',        color: '#dfa55a', extensions: ['.adoc', '.asciidoc'] },

  { id: 'sol',        label: 'Solidity',     monacoId: 'sol',              color: '#aa6746', extensions: ['.sol'] },
  { id: 'wgsl',       label: 'WGSL',         monacoId: 'wgsl',             color: '#5a8a93', extensions: ['.wgsl'] },
  { id: 'glsl',       label: 'GLSL',         monacoId: 'plaintext',        color: '#5586a4', extensions: ['.glsl', '.vert', '.frag'] },
  { id: 'cmake',      label: 'CMake',        monacoId: 'plaintext',        color: '#649ad2', extensions: ['.cmake'], filenames: ['CMakeLists.txt'] },
  { id: 'vim',        label: 'Vim Script',   monacoId: 'plaintext',        color: '#019733', extensions: ['.vim'] }
];

const FALLBACK: LanguageConfig = {
  id: 'txt',
  label: 'Text',
  monacoId: 'plaintext',
  color: '#5a5a60',
  extensions: []
};

export function languageFor(filename: string): LanguageConfig {
  const named = LANGUAGES.find((l) => l.filenames?.includes(filename));
  if (named) return named;

  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf('.');
  if (dot === -1) return FALLBACK;
  const ext = lower.slice(dot);
  return LANGUAGES.find((l) => l.extensions.includes(ext)) ?? FALLBACK;
}
