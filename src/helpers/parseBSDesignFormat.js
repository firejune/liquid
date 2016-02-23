import packageJSON from '../config.json';
import maliciousDetector from './maliciousDetector';
import Context from '../base/Context';
import design1to2 from '../converters/design_1to2';
import design2to3 from '../converters/design_2to3';
import design3to4 from '../converters/design_3to4';
import design4to5 from '../converters/design_4to5';
import design5to6 from '../converters/design_5to6';
import design6to7 from '../converters/design_6to7';

const converters = {
  1: design1to2,
  2: design2to3,
  3: design3to4,
  4: design4to5,
  5: design5to6,
  6: design6to7
};

export default function parseBSDesignFormat(json, path = null) {
  if (json.version > packageJSON._version_design_format) {
    throw new Error('version');
  }

  while (true) {
    if (converters.hasOwnProperty(json.version)) {
      json = converters[json.version](json);
      continue;
    }
    break;
  }

  if (!maliciousDetector.validateDesign(json.design)) {
    throw new Error('malicious');
  }

  const ctx = new Context;
  ctx.unserialize(json.design);

  if (path) {
    ctx.markAsSaved(path);
  }

  return ctx;
}
