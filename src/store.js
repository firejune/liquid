import Store from 'configstore';

const conf = new Store('psyclone');

function saveSettings(settingKey, settingValue) {
  conf.set(settingKey, settingValue);
}

function readSettings(settingKey) {
  return conf.get(settingKey);
}

export {saveSettings, readSettings};
