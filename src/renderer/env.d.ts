/// <reference types="vite/client" />
import type { CaretApi } from '../shared/types';

declare global {
  interface Window {
    caret: CaretApi;
  }
}

export {};
