const { contextBridge, ipcRenderer } = require('electron');

// Safe wrapper to expose APIs
try {
    // Check if electronAPI already exists
    if (!window.electronAPI) {
        contextBridge.exposeInMainWorld('electronAPI', {
            // Navigation
            navigateTo: (page) => ipcRenderer.invoke('navigate-to', page),
            
            // File dialogs
            showSaveDialog: (options) => ipcRenderer.invoke('save-dialog', options),
            
            // Print
            print: () => ipcRenderer.send('print'),
            
            // Platform info - these are static values from preload context
            platform: process.platform,
            appVersion: process.env.npm_package_version || '1.0.0',
            
            // App quit
            quitApp: () => ipcRenderer.send('quit-app'),
            
            // Reload
            reloadApp: () => ipcRenderer.send('reload-app')
        });
    }
    
    // DO NOT expose localStorage from preload - it doesn't exist here!
    // Instead, we'll check for the renderer's localStorage availability
    // and provide a fallback if needed
    contextBridge.exposeInMainWorld('isElectron', true);
    
    
} catch (error) {
    console.error('Error in preload script:', error);
}