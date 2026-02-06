/// <reference types="vite/client" />

interface Window {
    electron: {
        quit: () => Promise<void>;
        minimize: () => Promise<void>;
        getVersion: () => Promise<string>;
    }
}
