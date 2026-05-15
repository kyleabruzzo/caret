import { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { buildCaretTheme } from '../lib/monaco-theme';
import { languageFor } from '../lib/languages';
import { editorRef } from '../lib/editor-ref';
import type { TextTab } from '../hooks/useGroups';
import type { Settings } from '../lib/settings';

type Props = {
  tab: TextTab;
  settings: Settings;
  onChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
  onFocus?: () => void;
};

export function EditorPane({ tab, settings, onChange, onSave, onFocus }: Props) {
  const tabRef = useRef<TextTab>(tab);
  tabRef.current = tab;

  const wrapRef = useRef<HTMLDivElement>(null);
  const lang = languageFor(tab.name);

  useEffect(() => {
    if (wrapRef.current) {
      const color = settings.cursorTint ? lang.color : settings.accent;
      wrapRef.current.style.setProperty('--caret-cursor', color);
    }
  }, [lang, settings.cursorTint, settings.accent]);

  useEffect(() => {
    const monaco = (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco;
    if (!monaco) return;
    monaco.editor.defineTheme(
      'caret',
      buildCaretTheme(settings.accent, settings.bg, settings.panel)
    );
    monaco.editor.setTheme('caret');
  }, [settings.accent, settings.bg, settings.panel]);

  const handleMount: OnMount = (editor, monaco) => {
    (window as unknown as { monaco?: typeof import('monaco-editor') }).monaco = monaco;
    monaco.editor.defineTheme(
      'caret',
      buildCaretTheme(settings.accent, settings.bg, settings.panel)
    );
    monaco.editor.setTheme('caret');
    editorRef.set(editor);

    editor.onDidFocusEditorWidget(() => {
      editorRef.set(editor);
      onFocus?.();
    });
    editor.onDidDispose(() => {
      if (editorRef.get() === editor) editorRef.set(null);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave(tabRef.current.path);
    });

    editor.addCommand(
      monaco.KeyMod.chord(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0
      ),
      () => editor.getAction('editor.foldAll')?.run()
    );

    editor.addCommand(
      monaco.KeyMod.chord(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ
      ),
      () => editor.getAction('editor.unfoldAll')?.run()
    );
  };

  return (
    <div ref={wrapRef} className="caret-editor-wrap relative h-full">
      <Editor
        key={tab.path}
        path={tab.path}
        value={tab.content}
        language={lang.monacoId}
        theme="caret"
        onMount={handleMount}
        onChange={(value) => onChange(tab.path, value ?? '')}
        options={{
          fontFamily: settings.fontFamilyMono,
          fontSize: settings.fontSizeEditor,
          fontLigatures: true,
          lineHeight: 1.65,
          cursorSmoothCaretAnimation: 'on',
          cursorBlinking: 'smooth',
          cursorWidth: 2,
          smoothScrolling: true,
          minimap: {
            enabled: settings.minimap,
            side: 'right',
            size: 'proportional',
            showSlider: 'mouseover',
            renderCharacters: true,
            maxColumn: 80,
            scale: 1
          },
          lineNumbers: settings.lineNumbers ? 'on' : 'off',
          scrollBeyondLastLine: false,
          renderLineHighlight: 'line',
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
          guides: { indentation: false },
          renderWhitespace: 'none',
          bracketPairColorization: { enabled: true },
          wordWrap: settings.wordWrap ? 'on' : 'off',
          tabSize: settings.tabSize,
          automaticLayout: true,
          folding: true,
          foldingHighlight: false,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            useShadows: false
          }
        }}
      />
    </div>
  );
}
