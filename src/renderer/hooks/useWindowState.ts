import { useEffect, useState } from 'react';

type WindowState = {
  maximized: boolean;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
};

export function useWindowState(): WindowState {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.caret.window.isMaximized().then(setMaximized);
    return window.caret.window.onMaximizeChange(setMaximized);
  }, []);

  return {
    maximized,
    minimize: () => void window.caret.window.minimize(),
    toggleMaximize: () => void window.caret.window.toggleMaximize(),
    close: () => void window.caret.window.close()
  };
}
