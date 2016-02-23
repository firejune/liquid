export default function convert(json) {
  json.design.pages = [{
    name: 'index.html',
    html: json.design.components
  }];

  delete json.design.components;

  json.version = 6;

  return json;
}
