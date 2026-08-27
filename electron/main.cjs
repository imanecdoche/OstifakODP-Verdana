const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Performance: disable GPU compositing issues on some Linux drivers
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

// Disable hardware acceleration if LIBGL issues on Wayland/X11
// app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'OSTIFAK Digital Portal (ODP)',
    icon: path.join(__dirname, '..', 'dist', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // Performance optimizations
      backgroundThrottling: false,
      spellcheck: false,
    },
    show: false, // Show when ready to prevent white flash
  });

  // Load the built app
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Show window only when fully rendered — no white flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open external links in default browser, not in Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept navigation to external URLs
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
