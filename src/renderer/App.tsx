import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from './hooks/useWorkspace';
import { useFileTree } from './hooks/useFileTree';
import { useFileIndex } from './hooks/useFileIndex';
import { useGroups, type DropEdge } from './hooks/useGroups';
import { useSettings } from './hooks/useSettings';
import { useShortcut } from './hooks/useShortcut';
import { useChord } from './hooks/useChord';
import { TitleBar } from './components/TitleBar';
import { ActivityBar } from './components/ActivityBar';
import { Sidebar, type SidebarView } from './components/Sidebar';
import { EditorGroupView } from './components/EditorGroupView';
import { Welcome } from './components/Welcome';
import { QuickOpen } from './components/QuickOpen';
import { SettingsModal } from './components/SettingsModal';
import { AmbientBackground } from './components/AmbientBackground';
import { editorRef } from './lib/editor-ref';
import { basename, joinPath, parentOf, replaceName } from './lib/paths';
import type { MenuSection } from './components/MenuBar';

type DragState = { groupId: string; path: string } | null;

export default function App() {
  const { folder, ready, openFolder, closeFolder } = useWorkspace();
  const tree = useFileTree(folder);
  const index = useFileIndex(folder);
  const groups = useGroups();
  const { settings, ready: settingsReady, update: updateSettings, reset: resetSettings } = useSettings();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [quickOpen, setQuickOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drag, setDrag] = useState<DragState>(null);

  const activeGroup = useMemo(() => {
    for (const col of groups.columns) {
      const g = col.groups.find((x) => x.id === groups.activeGroupId);
      if (g) return g;
    }
    return groups.columns[0]?.groups[0] ?? null;
  }, [groups.columns, groups.activeGroupId]);

  const activeTab = useMemo(
    () => activeGroup?.tabs.find((t) => t.path === activeGroup.activePath) ?? null,
    [activeGroup]
  );

  const handleCreate = useCallback(
    async (parentDir: string, name: string, kind: 'file' | 'folder') => {
      const target = joinPath(parentDir, name);
      if (kind === 'file') await window.caret.fs.createFile(target);
      else await window.caret.fs.createFolder(target);
      await tree.refreshDir(parentDir);
      index.refresh();
    },
    [tree, index]
  );

  const handleRename = useCallback(
    async (oldPath: string, newName: string) => {
      const newPath = replaceName(oldPath, newName);
      await window.caret.fs.rename(oldPath, newPath);
      await tree.refreshDir(parentOf(oldPath));
      groups.renamePath(oldPath, newPath, newName);
      index.refresh();
    },
    [tree, groups, index]
  );

  const handleDelete = useCallback(
    async (path: string) => {
      await window.caret.fs.delete(path);
      await tree.refreshDir(parentOf(path));
      groups.closeUnder(path);
      index.refresh();
    },
    [tree, groups, index]
  );

  const handleSave = useCallback(() => {
    if (activeGroup?.activePath) groups.save(activeGroup.id, activeGroup.activePath);
  }, [activeGroup, groups]);

  const handleOpenFileAt = useCallback(
    async (path: string, name: string, line: number, column: number) => {
      await groups.open(path, name);
      requestAnimationFrame(() => {
        const ed = editorRef.get();
        if (!ed) return;
        ed.revealLineInCenter(line);
        ed.setPosition({ lineNumber: line, column });
        ed.focus();
      });
    },
    [groups]
  );

  const openSearch = useCallback(() => {
    setSidebarOpen(true);
    setSidebarView('search');
  }, []);

  const handleDrop = useCallback(
    (target: { groupId: string; edge: DropEdge }) => {
      if (!drag) return;
      groups.moveTab(drag, target);
      setDrag(null);
    },
    [drag, groups]
  );

  useShortcut({ key: 'b', mod: true }, () => setSidebarOpen((v) => !v));
  useShortcut({ key: 's', mod: true }, handleSave);
  useShortcut({ key: 'p', mod: true }, () => folder && setQuickOpen(true));
  useShortcut({ key: ',', mod: true }, () => setSettingsOpen(true));
  useShortcut({ key: 'w', mod: true }, () => {
    if (activeGroup?.activePath) groups.close(activeGroup.id, activeGroup.activePath);
  });
  useShortcut({ key: 'f', mod: true, shift: true }, openSearch);

  useChord('k', (key) => {
    if (key === '0') {
      editorRef.trigger('editor.foldAll');
      return true;
    }
    if (key === 'j') {
      editorRef.trigger('editor.unfoldAll');
      return true;
    }
    return false;
  });

  useEffect(() => {
    const onBlur = (): void => {
      groups.saveAll();
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [groups]);

  const menus = useMemo<MenuSection[]>(
    () =>
      buildMenus({
        onOpenFolder: openFolder,
        onCloseFolder: closeFolder,
        onSave: handleSave,
        onSaveAll: () => groups.saveAll(),
        onCloseTab: () => activeGroup?.activePath && groups.close(activeGroup.id, activeGroup.activePath),
        onQuit: () => window.caret.window.close(),
        onUndo: () => editorRef.trigger('undo'),
        onRedo: () => editorRef.trigger('redo'),
        onCut: () => editorRef.trigger('editor.action.clipboardCutAction'),
        onCopy: () => editorRef.trigger('editor.action.clipboardCopyAction'),
        onPaste: () => editorRef.trigger('editor.action.clipboardPasteAction'),
        onFind: () => editorRef.trigger('actions.find'),
        onReplace: () => editorRef.trigger('editor.action.startFindReplaceAction'),
        onSelectAll: () => editorRef.trigger('editor.action.selectAll'),
        onSelectExpand: () => editorRef.trigger('editor.action.smartSelect.expand'),
        onSelectShrink: () => editorRef.trigger('editor.action.smartSelect.shrink'),
        onQuickOpen: () => folder && setQuickOpen(true),
        onSearchInFiles: openSearch,
        onToggleSidebar: () => setSidebarOpen((v) => !v),
        onToggleMinimap: () => updateSettings({ minimap: !settings.minimap }),
        onToggleAmbient: () => updateSettings({ ambient: !settings.ambient }),
        onFoldAll: () => editorRef.trigger('editor.foldAll'),
        onUnfoldAll: () => editorRef.trigger('editor.unfoldAll'),
        onGotoLine: () => editorRef.trigger('editor.action.gotoLine'),
        onSettings: () => setSettingsOpen(true)
      }),
    [folder, openFolder, closeFolder, handleSave, groups, activeGroup, settings.minimap, settings.ambient, updateSettings, openSearch]
  );

  if (!ready || !settingsReady) return <div className="h-full bg-bg" />;

  return (
    <div className="flex h-full flex-col bg-bg">
      <TitleBar
        folderName={folder ? basename(folder) : null}
        activeFile={activeTab?.name ?? null}
        menus={menus}
      />
      <div className="flex min-h-0 flex-1">
        <ActivityBar
          sidebarOpen={sidebarOpen}
          view={sidebarView}
          ambient={settings.ambient}
          onSelectExplorer={() => {
            setSidebarOpen(true);
            setSidebarView('explorer');
          }}
          onSelectSearch={openSearch}
          onToggleAmbient={() => updateSettings({ ambient: !settings.ambient })}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <Sidebar
          open={sidebarOpen}
          view={sidebarView}
          folder={folder}
          nodes={tree.root}
          expanded={tree.expanded}
          activePath={activeGroup?.activePath ?? null}
          onOpenFolder={openFolder}
          onRefresh={() => {
            tree.refresh();
            index.refresh();
          }}
          onToggleDir={tree.toggle}
          onOpenFile={groups.open}
          onOpenFileAt={handleOpenFileAt}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
        <main className="relative flex min-w-0 flex-1 bg-bg">
          {folder ? (
            <>
              {groups.columns.map((col, ci) => (
                <div
                  key={col.id}
                  className={`flex min-w-0 flex-1 flex-col ${ci > 0 ? 'border-l border-border' : ''}`}
                >
                  {col.groups.map((g, gi) => (
                    <div
                      key={g.id}
                      className={`flex min-h-0 min-w-0 flex-1 flex-col ${gi > 0 ? 'border-t border-border' : ''}`}
                    >
                      <EditorGroupView
                        group={g}
                        isActive={g.id === groups.activeGroupId}
                        dragActive={!!drag}
                        settings={settings}
                        onFocusGroup={() => groups.setActiveGroup(g.id)}
                        onSelectTab={(path) => groups.setActiveTab(g.id, path)}
                        onCloseTab={(path) => void groups.close(g.id, path)}
                        onTabDragStart={(groupId, path) => setDrag({ groupId, path })}
                        onTabDragEnd={() => setDrag(null)}
                        onDrop={handleDrop}
                        onChange={(path, content) => groups.updateContent(g.id, path, content)}
                        onSave={(path) => groups.save(g.id, path)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <Welcome onOpen={openFolder} />
          )}
          <AmbientBackground enabled={settings.ambient} color={settings.accent} />
        </main>
      </div>
      <QuickOpen
        open={quickOpen}
        rootPath={folder}
        files={index.files}
        onClose={() => setQuickOpen(false)}
        onPick={groups.open}
      />
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onReset={resetSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

type MenuBuilderInputs = {
  onOpenFolder: () => void;
  onCloseFolder: () => void;
  onSave: () => void;
  onSaveAll: () => void;
  onCloseTab: () => void;
  onQuit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onFind: () => void;
  onReplace: () => void;
  onSelectAll: () => void;
  onSelectExpand: () => void;
  onSelectShrink: () => void;
  onQuickOpen: () => void;
  onSearchInFiles: () => void;
  onToggleSidebar: () => void;
  onToggleMinimap: () => void;
  onToggleAmbient: () => void;
  onFoldAll: () => void;
  onUnfoldAll: () => void;
  onGotoLine: () => void;
  onSettings: () => void;
};

function buildMenus(a: MenuBuilderInputs): MenuSection[] {
  return [
    {
      label: 'File',
      items: [
        { type: 'item', label: 'Open Folder…',  shortcut: '',          onSelect: a.onOpenFolder },
        { type: 'item', label: 'Close Folder',  shortcut: '',          onSelect: a.onCloseFolder },
        { type: 'separator' },
        { type: 'item', label: 'Save',          shortcut: 'Ctrl+S',    onSelect: a.onSave },
        { type: 'item', label: 'Save All',      shortcut: '',          onSelect: a.onSaveAll },
        { type: 'separator' },
        { type: 'item', label: 'Close Tab',     shortcut: 'Ctrl+W',    onSelect: a.onCloseTab },
        { type: 'separator' },
        { type: 'item', label: 'Settings…',     shortcut: 'Ctrl+,',    onSelect: a.onSettings },
        { type: 'item', label: 'Exit',          shortcut: '',          onSelect: a.onQuit }
      ]
    },
    {
      label: 'Edit',
      items: [
        { type: 'item', label: 'Undo',          shortcut: 'Ctrl+Z',    onSelect: a.onUndo },
        { type: 'item', label: 'Redo',          shortcut: 'Ctrl+Y',    onSelect: a.onRedo },
        { type: 'separator' },
        { type: 'item', label: 'Cut',           shortcut: 'Ctrl+X',    onSelect: a.onCut },
        { type: 'item', label: 'Copy',          shortcut: 'Ctrl+C',    onSelect: a.onCopy },
        { type: 'item', label: 'Paste',         shortcut: 'Ctrl+V',    onSelect: a.onPaste },
        { type: 'separator' },
        { type: 'item', label: 'Find',          shortcut: 'Ctrl+F',    onSelect: a.onFind },
        { type: 'item', label: 'Replace',       shortcut: 'Ctrl+H',    onSelect: a.onReplace }
      ]
    },
    {
      label: 'Selection',
      items: [
        { type: 'item', label: 'Select All',         shortcut: 'Ctrl+A',         onSelect: a.onSelectAll },
        { type: 'separator' },
        { type: 'item', label: 'Expand Selection',   shortcut: 'Shift+Alt+→',    onSelect: a.onSelectExpand },
        { type: 'item', label: 'Shrink Selection',   shortcut: 'Shift+Alt+←',    onSelect: a.onSelectShrink }
      ]
    },
    {
      label: 'View',
      items: [
        { type: 'item', label: 'Quick Open',        shortcut: 'Ctrl+P',          onSelect: a.onQuickOpen },
        { type: 'item', label: 'Search in Files',   shortcut: 'Ctrl+Shift+F',    onSelect: a.onSearchInFiles },
        { type: 'separator' },
        { type: 'item', label: 'Toggle Sidebar',    shortcut: 'Ctrl+B',          onSelect: a.onToggleSidebar },
        { type: 'item', label: 'Toggle Minimap',    shortcut: '',                onSelect: a.onToggleMinimap },
        { type: 'item', label: 'Toggle Ambient',    shortcut: '',                onSelect: a.onToggleAmbient },
        { type: 'separator' },
        { type: 'item', label: 'Fold All',          shortcut: 'Ctrl+K Ctrl+0',   onSelect: a.onFoldAll },
        { type: 'item', label: 'Unfold All',        shortcut: 'Ctrl+K Ctrl+J',   onSelect: a.onUnfoldAll }
      ]
    },
    {
      label: 'Go',
      items: [
        { type: 'item', label: 'Go to File…',  shortcut: 'Ctrl+P',  onSelect: a.onQuickOpen },
        { type: 'item', label: 'Go to Line…',  shortcut: 'Ctrl+G',  onSelect: a.onGotoLine }
      ]
    },
    {
      label: 'Help',
      items: [
        { type: 'item', label: 'caret · v0.1.0', shortcut: '', onSelect: () => undefined, disabled: true }
      ]
    }
  ];
}
