import type { editor } from 'monaco-editor';

let current: editor.IStandaloneCodeEditor | null = null;

export const editorRef = {
  set(e: editor.IStandaloneCodeEditor | null): void {
    current = e;
  },
  get(): editor.IStandaloneCodeEditor | null {
    return current;
  },
  trigger(action: string): boolean {
    if (!current) return false;
    current.focus();
    current.trigger('caret-menu', action, null);
    return true;
  },
  hasFocus(): boolean {
    return current?.hasTextFocus() ?? false;
  }
};
