import fs from 'fs';
import path from 'path';
import {clipboard, remote, webFrame, ipcRenderer} from 'electron';
import {saveSettings, readSettings} from './store';

// 두 손까락 더블 탭 줌 막기
webFrame.setZoomLevelLimits(1, 1);

const {Menu, dialog, shell} = remote;
const browserWindow = remote.getCurrentWindow();

// Binding to ports
let httpServer;
let sseServer;

const os = {darwin: 'osx', linux: 'linux', win32: 'windows'}[process.platform];
const electron = {
  os,
  development: !!remote.getGlobal('development'),
  homePath: remote.app.getPath('home'),
  appPath: remote.app.getAppPath(),

  // Will use this to open files from the command line
  commandLineArgs: remote.process.argv,
  separator: path.sep,
  pathSeparator: os === 'windows' ? '\\' : '/',

  /* Dialog functions */
  showFileOpenDialog(props, callback) {
    app.freezeUI();

    dialog.showOpenDialog({
      title: props.title || 'Open File',
      defaultPath: props.defaultPath || this.homePath,
      filters: props.filters || [],
      properties: props.properties || ['openFile']
    }, (filepath) => {
      app.unfreezeUI();
      callback(filepath);
    });
  },

  showFileSaveDialog(props, callback) {
    app.freezeUI();

    dialog.showSaveDialog({
      title: props.title || 'Save File',
      defaultPath: props.defaultPath || this.homePath,
      filters: props.filters || []
    }, filepath => {
      app.unfreezeUI();
      callback(filepath);
    });
  },

  pathExists(filepath) {
    return fs.existsSync(filepath);
  },

  readFile(filepath, process) {
    try {
      switch (process) {
        case 'base64':
          return Promise.resolve(ipcRenderer.sendSync('read-file-base64', filepath));
        case 'gzip':
          return Promise.resolve(ipcRenderer.sendSync('read-file-gzipped', filepath));
        default:
          return Promise.resolve(ipcRenderer.sendSync('read-file-raw', filepath));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  },

  mkdirSync(filepath) {
    try {
      fs.mkdirSync(filepath);
      return true;
    } catch (err) {
      // Returns true if the file exist, false on all other errors
      return /EEXIST/.test(err.message);
    }
  },

  writeFile(filepath, data, process) {
    try {
      let result;
      switch (process) {
        case 'raw-from-base64':
          result = ipcRenderer.sendSync('write-file-raw-from-base64', filepath, data);
          break;
        case 'gzip':
          result = ipcRenderer.sendSync('write-file-gzipped', filepath, data);
          break;
        default:
          result = ipcRenderer.sendSync('write-file-raw', filepath, data);
          break;
      }

      if (result) {
        return Promise.resolve();
      }

      throw new Error();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  listenOnNetwork(cb) {
    let cnt = 0;
    httpServer = remote.require('./httpserver')('preview');
    httpServer.start(null, null, address => {
      this.previewPort = address.port;
      if (++cnt === 2) cb(address);
    });

    sseServer = remote.require('./sseserver')('sse');
    sseServer.start(null, null, address => {
      this.ssePort = address.port;
      if (++cnt === 2) cb(address);
    });
  },

  stopListeningOnNetwork(cb) {
    httpServer.stop();
    sseServer.stop();
    setTimeout(cb, 250);
  },

  // Event stream server
  notifySSEClients(message) {
    ipcRenderer.send('sse-message', message);
  },

  /* Generic functions */
  getIPAddresses() {
    const interfaces = remote.require('os').networkInterfaces();
    const addresses = [];

    for (const k in interfaces) {
      for (const k2 in interfaces[k]) {
        const address = interfaces[k][k2];
        if (address.family === 'IPv4') {
          addresses.push(address.address);
        }
      }
    }
    return addresses;
  },

  openBrowserWindow(url) {
    shell.openExternal(url);
  },

  reloadWindow(item, focusedWindow) {
    focusedWindow && focusedWindow.reload();
  },

  toggleFullScreen(item, focusedWindow) {
    focusedWindow && focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
  },

  toggleDevTools(item, focusedWindow) {
    focusedWindow && focusedWindow.toggleDevTools();
  },

  quit() {
    remote.app.quit();
  },

  setTitle(title) {
    browserWindow.setTitle(title);
  },

  /* Misc */
  saveSetting(set, def) {
    console.log('electron.saveSetting', set, def);
    saveSettings(set, def);
  },

  readSetting(set, def) {
    console.log('electron.readSetting', set, def);
    return readSettings(set) || def || null;
  },

  addToRecent(filepath) {
    filepath && remote.app.addRecentDocument(filepath);
  },

  takeScreenshot() {
    ipcRenderer.send('take-screenshot');
  },

  /* Application menu */
  setMenu(menu) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  },

  /* Clipboard */
  clipboardGet() {
    return clipboard.readHtml() || clipboard.readText();
  },

  clipboardGetText() {
    return clipboard.readText();
  },

  clipboardGetHTML() {
    return clipboard.readHtml();
  },

  clipboardSet(text, html = '') {
    return clipboard.write({ text, html });
  },

  clipboardSetText(text) {
    return clipboard.writeText(text);
  },

  clipboardSetHTML(html) {
    return clipboard.writeHtml(html);
  }
};

// remove the electron's default menu
if (!electron.development) {
  electron.setMenu([]);
}

/* Design preview */
ipcRenderer.on('preview-request', (event, parsed, headers) => {
  app.handlePreviewRequest(parsed.pathname, parsed, headers).then(message => {
    // Possible values for message:
    // { decode, content, contentType, headers }
    // console.log('preview-response', parsed.pathname);
    ipcRenderer.send('preview-response', parsed.pathname, message);
  }).catch(() => {
    ipcRenderer.send('preview-response', parsed.pathname, {
      status: 404,
      content: 'Sorry, we can\'t find this resource.'
    });
  });
});

// Opening files
ipcRenderer.on('open-file', (event, filepath) => {
  if (!app) return;
  app.openBSPath(filepath);
  browserWindow.focus();

  if (electron.os === 'osx') {
    browserWindow.restore();
  }
});

// Taking screenshots
ipcRenderer.on('screenshot-ready', (event, dataURL) => {
  app.screenshotReady(dataURL);
});

// Listen for network requests
ipcRenderer.on('did-get-response-details', (event, arr) => {
  if (global.app) app.onNetworkRequest.apply(app, arr);
});

/*
// Prevent the app from triggering the unload dialog
window.addEventListener('beforeunload', e => {
  e.stopImmediatePropagation();
  e.stopPropagation();
});
*/

/*
function onlyInBstudio() {
  app.alertDialog.open({
    title: 'Not Available',
    message: 'This feature is not available in the web demo.'
  });
}
*/

export default electron;
