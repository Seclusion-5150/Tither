// a tiny React Native stub with the same module name that exports a harmless placeholder. 
// Expo/Metro prefers *.native.ts on mobile, so if someone accidentally imports the server 
// module path from the app, the stub gets used instead preventing the Node SDK (and its crypto dependency) 
// from being bundled.
export const stripe = undefined as never;