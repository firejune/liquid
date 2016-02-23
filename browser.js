'use strict';

const remote = require('electron').remote;
if (!!remote.getGlobal('development')) {
  // install babel hooks in the browser process
  require('babel-core/register')();
  require('./src');
} else {
  require('./dist');
}
