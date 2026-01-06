const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;
let loadingScreen;

// Check if running in development
const isDev = process.env.NODE_ENV !== 'production';

function showLoadingScreen() {
    loadingScreen = new BrowserWindow({
        width: 400,
        height: 250,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        show: false
    });

    loadingScreen.loadURL(`data:text/html;charset=utf-8,
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: white;
                    overflow: hidden;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                
                .logo {
                    font-size: 48px;
                    margin-bottom: 20px;
                    color: #60a5fa;
                }
                
                .logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px;
                    height: 80px;
                    background: rgba(96, 165, 250, 0.1);
                    border-radius: 50%;
                    margin-bottom: 20px;
                }
                
                .title {
                    font-size: 22px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    background: linear-gradient(to right, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }
                
                .subtitle {
                    font-size: 14px;
                    opacity: 0.7;
                    margin-bottom: 30px;
                }
                
                .loader {
                    width: 60px;
                    height: 60px;
                    position: relative;
                    margin-bottom: 20px;
                }
                
                .loader-ring {
                    width: 100%;
                    height: 100%;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    position: absolute;
                }
                
                .loader-ring:after {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    width: 100%;
                    height: 100%;
                    border: 3px solid transparent;
                    border-top: 3px solid #60a5fa;
                    border-radius: 50%;
                    animation: spin 1.5s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .progress-container {
                    width: 200px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 10px;
                }
                
                .progress-bar {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(to right, #60a5fa, #a78bfa);
                    border-radius: 2px;
                    animation: progress 10s ease-in-out forwards;
                }
                
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                
                .status {
                    font-size: 12px;
                    margin-top: 15px;
                    opacity: 0.8;
                    text-align: center;
                    min-height: 18px;
                }
            </style>
        </head>
        <body>
            <div class="logo-container">
                <div class="logo">📚</div>
            </div>
            <div class="title">Library Management System</div>
            <div class="subtitle">Starting Application...</div>
            <div class="loader">
                <div class="loader-ring"></div>
            </div>
            <div class="progress-container">
                <div class="progress-bar"></div>
            </div>
            <div class="status" id="status">Initializing...</div>
            
            <script>
                const statusEl = document.getElementById('status');
                const statuses = [
                    'Loading modules...',
                    'Connecting to database...',
                    'Starting server...',
                    'Preparing interface...',
                    'Almost ready...'
                ];
                
                let currentStatus = 0;
                const interval = setInterval(() => {
                    if (currentStatus < statuses.length) {
                        statusEl.textContent = statuses[currentStatus];
                        currentStatus++;
                    } else {
                        clearInterval(interval);
                        statusEl.textContent = 'Ready to launch!';
                    }
                }, 2000);
            </script>
        </body>
        </html>
    `);

    loadingScreen.once('ready-to-show', () => {
        loadingScreen.show();
    });

    // Center the loading screen
    loadingScreen.center();
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../assets/icon.ico'),
        title: 'Library Management System',
        show: false,
        backgroundColor: '#f8fafc'
    });

    // Preload the main window but keep it hidden
    if (isDev) {
        mainWindow.loadURL('http://localhost:5000/login');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/login.html'));
    }

    // When main window content is loaded, smoothly transition from loading screen
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Main window content loaded');
        
        // Small delay to ensure all assets are loaded
        setTimeout(() => {
            // Fade out loading screen
            if (loadingScreen) {
                loadingScreen.webContents.executeJavaScript(`
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease-out';
                `).then(() => {
                    setTimeout(() => {
                        loadingScreen.close();
                        loadingScreen = null;
                        
                        // Show main window with fade-in effect
                        mainWindow.show();
                        mainWindow.focus();
                        
                        // Add fade-in effect to main window
                        mainWindow.webContents.executeJavaScript(`
                            document.body.style.opacity = '0';
                            document.body.style.transition = 'opacity 0.5s ease-in';
                            setTimeout(() => {
                                document.body.style.opacity = '1';
                            }, 50);
                        `);
                    }, 300);
                });
            } else {
                // If loading screen is already gone, just show main window
                mainWindow.show();
                mainWindow.focus();
            }
        }, 500);
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle authentication events from renderer
    ipcMain.handle('navigate-to', (event, page) => {
        if (mainWindow) {
            if (isDev) {
                mainWindow.loadURL(`http://localhost:5000/${page}`);
            } else {
                mainWindow.loadFile(path.join(__dirname, `../renderer/${page}.html`));
            }
        }
    });

    // Handle save dialog for exports
    ipcMain.handle('save-dialog', async (event, options) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: options.title || 'Save File',
            defaultPath: options.defaultPath || app.getPath('downloads'),
            filters: options.filters || [
                { name: 'Excel Files', extensions: ['xlsx'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        return result;
    });

    // Handle graceful navigation with fade effects
    ipcMain.handle('navigate-with-transition', async (event, page) => {
        return new Promise((resolve) => {
            if (mainWindow) {
                // Fade out current content
                mainWindow.webContents.executeJavaScript(`
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.3s ease-out';
                `).then(() => {
                    setTimeout(() => {
                        // Load new page
                        if (isDev) {
                            mainWindow.loadURL(`http://localhost:5000/${page}`);
                        } else {
                            mainWindow.loadFile(path.join(__dirname, `../renderer/${page}.html`));
                        }
                        
                        // Fade in new content
                        mainWindow.webContents.once('did-finish-load', () => {
                            mainWindow.webContents.executeJavaScript(`
                                document.body.style.opacity = '0';
                                document.body.style.transition = 'opacity 0.3s ease-in';
                                setTimeout(() => {
                                    document.body.style.opacity = '1';
                                }, 50);
                            `);
                            resolve({ success: true });
                        });
                    }, 300);
                });
            } else {
                resolve({ success: false, error: 'No main window' });
            }
        });
    });
}

function startBackendServer() {
    return new Promise((resolve, reject) => {
        console.log('Starting backend server...');
        
        const serverPath = path.join(__dirname, '../backend/server.js');
        
        backendProcess = spawn('node', [serverPath], {
            shell: true,
            cwd: path.join(__dirname, '..'),
            stdio: 'pipe'
        });

        backendProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`Backend: ${output}`);
            
            // Check if backend server is ready
            if (output.includes('Server running') || 
                output.includes('Listening on port') ||
                output.includes('Database connected')) {
                console.log('✓ Backend server is ready!');
                resolve();
            }
        });

        backendProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error(`Backend Error: ${error}`);
            
            // Some errors are okay (like port already in use)
            if (error.includes('EADDRINUSE')) {
                console.log('✓ Backend already running on port 5000');
                resolve();
            }
        });

        backendProcess.on('error', (error) => {
            console.error(`Failed to start backend: ${error}`);
            reject(error);
        });

        backendProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Backend exited with code ${code}`));
            }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            console.log('Backend startup timeout - continuing anyway');
            resolve();
        }, 10000);
    });
}

// App event handlers
app.whenReady().then(async () => {
    try {
        // Show loading screen immediately
        showLoadingScreen();
        
        // Start backend server and wait for it
        await startBackendServer();
        
        // Create main window (it will be preloaded but hidden)
        createMainWindow();
        
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Close loading screen if it exists
        if (loadingScreen) {
            loadingScreen.close();
        }
        
        // Show error dialog
        dialog.showErrorBox(
            'Startup Error',
            'Failed to start the application. Please check:\n\n' +
            '1. Port 5000 is not in use by another application\n' +
            '2. MongoDB is running (if using local database)\n' +
            '3. All dependencies are installed\n\n' +
            `Error: ${error.message}`
        );
        
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        // Don't show loading screen on reactivate
        createMainWindow();
    }
});

app.on('before-quit', () => {
    // Kill backend process when app quits
    if (backendProcess) {
        console.log('Stopping backend server...');
        backendProcess.kill();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Additional IPC handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-platform', () => {
    return process.platform;
});