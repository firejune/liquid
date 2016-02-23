import packageJSON from '../config.json';

export default function buildBSDesignFormat(context) {
  return {
    version: packageJSON._version_design_format,
    timestamp: Date.now(),
    design: context.serialize()
  };
}
