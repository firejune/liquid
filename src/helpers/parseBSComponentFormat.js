import packageJSON from '../config.json';
import maliciousDetector from './maliciousDetector';
import Package from '../base/Package';

import package1to2 from '../converters/package_1to2';
import package2to3 from '../converters/package_2to3';
import package3to4 from '../converters/package_3to4';
import package4to5 from '../converters/package_4to5';

const converters = {
  1: package1to2,
  2: package2to3,
  3: package3to4,
  4: package4to5
};

export default function parseBSComponentFormat(json) {
  if (json.version > packageJSON._version_component_format) {
    throw new Error('version');
  }

  const pkg = new Package;
  while (true) {
    if (converters.hasOwnProperty(json.version)) {
      json = converters[json.version](json);
      continue;
    }
    break;
  }

  if (!maliciousDetector.validatePackage(json.package)) {
    throw new Error('malicious');
  }

  pkg.unserialize(json.package);

  return pkg;
}
