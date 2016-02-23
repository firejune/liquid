import packageJSON from '../config.json';

export default function buildBSComponentFormat(pkg) {
  return {
    version: packageJSON._version_component_format,
    timestamp: Date.now(),
    'package': pkg.serialize()
  };
}
