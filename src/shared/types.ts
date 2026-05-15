export type TreeFile = {
  type: 'file';
  name: string;
  path: string;
};

export type TreeDirectory = {
  type: 'directory';
  name: string;
  path: string;
  children: TreeNode[] | null;
};

export type TreeNode = TreeFile | TreeDirectory;

export type WorkspaceStore = {
  lastFolder?: string;
  settings?: Record<string, unknown>;
};

export type SearchOptions = {
  query: string;
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
};

export type SearchHit = {
  line: number;
  column: number;
  length: number;
  preview: string;
};

export type SearchFileResult = {
  path: string;
  hits: SearchHit[];
};

export type ReplaceTarget = {
  path: string;
  hits: SearchHit[];
};

export type CaretApi = {
  window: {
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<boolean>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (cb: (maximized: boolean) => void) => () => void;
  };
  dialog: {
    openFolder: () => Promise<string | null>;
  };
  fs: {
    readDir: (path: string) => Promise<TreeNode[]>;
    listFiles: (path: string) => Promise<string[]>;
    readFile: (path: string) => Promise<string>;
    readBase64: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    createFile: (path: string) => Promise<void>;
    createFolder: (path: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    delete: (path: string) => Promise<void>;
    searchInFiles: (root: string, options: SearchOptions) => Promise<SearchFileResult[]>;
    replaceInFiles: (
      targets: ReplaceTarget[],
      options: SearchOptions,
      replacement: string
    ) => Promise<number>;
  };
  store: {
    get: () => Promise<WorkspaceStore>;
    set: (data: WorkspaceStore) => Promise<void>;
  };
};
