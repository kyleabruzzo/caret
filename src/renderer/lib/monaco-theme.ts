import type { editor } from 'monaco-editor';

export function buildCaretTheme(accent: string, bg: string, panel: string): editor.IStandaloneThemeData {
  const clean = (c: string): string => c.replace('#', '');
  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e6e6e8', background: clean(bg) },
      { token: 'comment', foreground: '5a5a60', fontStyle: 'italic' },
      { token: 'keyword', foreground: clean(accent) },
      { token: 'string', foreground: 'a3c98c' },
      { token: 'number', foreground: 'd99b73' },
      { token: 'type', foreground: '5ab7ff' },
      { token: 'function', foreground: 'f1d96d' },
      { token: 'variable', foreground: 'e6e6e8' },
      { token: 'identifier', foreground: 'e6e6e8' },
      { token: 'delimiter', foreground: '8b8b93' }
    ],
    colors: {
      'editor.background': bg,
      'editor.foreground': '#e6e6e8',
      'editor.lineHighlightBackground': panel,
      'editor.lineHighlightBorder': panel,
      'editor.selectionBackground': '#1f3a40',
      'editor.inactiveSelectionBackground': '#16292e',
      'editorCursor.foreground': accent,
      'editorLineNumber.foreground': '#36363c',
      'editorLineNumber.activeForeground': '#8b8b93',
      'editorIndentGuide.background': '#16161a',
      'editorIndentGuide.activeBackground': '#26262b',
      'editorWidget.background': panel,
      'editorWidget.border': '#1f1f23',
      'editorSuggestWidget.background': panel,
      'editorSuggestWidget.border': '#1f1f23',
      'editorSuggestWidget.selectedBackground': '#16161a',
      'scrollbarSlider.background': '#2a2a2d80',
      'scrollbarSlider.hoverBackground': '#3a3a3d80',
      'scrollbarSlider.activeBackground': '#4a4a4d80',
      'minimap.background': bg,
      'peekView.border': accent,
      'peekViewTitle.background': panel,
      'peekViewTitleLabel.foreground': '#e6e6e8',
      'peekViewTitleDescription.foreground': '#6b6b73',
      'peekViewEditor.background': bg,
      'peekViewEditor.matchHighlightBackground': `${accent}33`,
      'peekViewEditor.matchHighlightBorder': accent,
      'peekViewEditorGutter.background': bg,
      'peekViewResult.background': panel,
      'peekViewResult.fileForeground': '#e6e6e8',
      'peekViewResult.lineForeground': '#8b8b93',
      'peekViewResult.matchHighlightBackground': `${accent}44`,
      'peekViewResult.selectionBackground': '#16161a',
      'peekViewResult.selectionForeground': '#e6e6e8',
      'list.hoverBackground': '#16161a',
      'list.activeSelectionBackground': '#1f1f23',
      'list.activeSelectionForeground': '#e6e6e8',
      'list.focusBackground': '#1f1f23',
      'list.focusForeground': '#e6e6e8',
      'list.inactiveSelectionBackground': '#16161a'
    }
  };
}
