'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const conf = new (require('configstore'))('psyclone', {
  'app width': 800,
  'app height': 512,
  'open devtools': false,
  'position x': 0,
  'position y': 0
});

// This is the only instance running
const env = process.argv.indexOf('development') > -1 ? 'development' : 'production';
const idx = process.argv.indexOf('-url');
const url = idx > -1 ? process.argv[idx + 1] : null; // https://bootstrapstudio.io/app/

electron.crashReporter.start({
  productName: 'Psyclone Studio',
  companyName: 'RSUPPORT',
  submitURL: 'https://git.rsupport.com/rsupport/psyclone/issues',
  autoSubmit: true
});

console.log({
  env,
  electron: process.versions.electron,
  v8: process.versions.v8,
  chrome: process.versions.chrome,
  node: process.versions.node,
  modules: process.versions.modules
});

let mainWindow = null;
let openOnStartup = null;
let started = false;

app.on('ready', () => {
  // Keep a global reference of the window object, if you don't, the window will be closed
  // automatically when the JavaScript object is garbage collected.
  mainWindow = new BrowserWindow({
    // Window's width in pixels.
    width: conf.get('app width'),
    // Window's height in pixels.
    height: conf.get('app height'),
    // Window's minimum width.
    minWidth: 640,
    // Window's minimum height.
    minHeight: 480,
    // Window's left offset from screen.
    x: conf.get('position x'),
    // Window's top offset from screen.
    y: conf.get('position y'),
    // OS X - specifies the style of window title bar. This option is supported on
    // OS X 10.10 Yosemite and newer. 'default' or 'hidden' or 'hidden-inset'
    titleBarStyle: 'hidden-inset',
    transparent: true,
    // NativeImage - The window icon, when omitted on Windows
    // the executable's icon would be used as window icon.
    icon: require('path').join(__dirname, 'assets/icon.png'),
    webPreferences: {
      // Make TextArea elements resizable.
      textAreasAreResizable: false,
      // When setting false, it will disable the same-origin policy
      // (Usually using testing websites by people), and set allowDisplayingInsecureContent
      // and allowRunningInsecureContent to true if these two options are not set by user.
      webSecurity: false,
      // Enables WebGL support.
      // webgl: false,
      // Enables WebAudio support.
      webaudio: false
    }
  });

  global.bridge = module;
  global.browserWindow = mainWindow;
  global.development = env === 'development';

  mainWindow.loadURL(url || `file://${__dirname}/index.html`);

  if (conf.get('open devtools') && env !== 'production') {
    mainWindow.openDevTools();
  }

  // 윈도 크기 및 위치 기억
  let resizeTimer;
  let moveTimer;

  mainWindow.on('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wh = mainWindow.getSize();
      conf.set('app width', wh[0]);
      conf.set('app height', wh[1]);
    }, 200);
  });

  mainWindow.on('move', () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      const bounds = mainWindow.getBounds();
      conf.set('position x', bounds.x);
      conf.set('position y', bounds.y);
    }, 400);
  });

  mainWindow.on('closed', () => {
    clearTimeout(resizeTimer);
    clearTimeout(moveTimer);
    mainWindow = null;
  });

  mainWindow.on('devtools-opened', () => {
    conf.set('open devtools', true);
  });

  mainWindow.on('devtools-closed', () => {
    conf.set('open devtools', false);
  });

  conf.set('last opened', null);

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.show();
    started = true;
    if (openOnStartup) {
      mainWindow.webContents.send('open-file', openOnStartup);
    }
  });

  mainWindow.webContents.on('will-navigate', e => {
    e.preventDefault();
  });
});

app.on('open-file', (e, path) => {
  if (started) {
    if (mainWindow.webContents) {
      mainWindow.webContents.send('open-file', [path]);
    } else {
      app.quit();
    }
  } else {
    openOnStartup = [path];
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});
