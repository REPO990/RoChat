export {};

declare global {
  interface Window {
    electron?: {
      setAlwaysOnTop: (flag: boolean) => void;
      setOpacity: (opacity: number) => void;
      minimize: () => void;
      close: () => void;
      resizeTo: (width: number, height: number) => void;
      openExternal: (url: string) => void; // Add this line
    };
  }
}