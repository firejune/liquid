import url from 'url';
import request from 'request';
import $ from 'jquery';

// import electron from './electron';
// import Application from './base/Application';

$(() => {
  global.$ = $;
  // global.app = new Application;
  global.win = $(window);
  global.doc = $(document);
  global.body = $(document.body);
  global.html = doc.find('html');

  const ifrmae = frames[0].document;
  $('iframe').on('load', function(e) {
    console.log('test', e.target.contentDocument.location.href);
  });

  $('#input').on('keydown', function(e) {
    if (e.keyCode == 13) {

      httpGet(this.value);
      // $('iframe').attr('src', this.value);
    }
  }).on('click', function() {
    console.log('click')
    $(this).focus();
  })

  let index = 0;
  const opacities = [0.75, 0.5, 0.25, 1];
  $('#opacity').on('click', function() {
    $('#main').css('opacity', opacities[index++]);
    if (index >= 4) index = 0;
  });

  function httpGet(href) {
    request.get({
      method: 'GET',
      uri: href,
      encoding: 'utf8',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
        'Accept-Language': 'ko,en;q=0.8,ja;q=0.6,zh-CN;q=0.4,zh;q=0.2,zh-TW;q=0.2'
      },
      gzip: true
    }, (err, res, body) => {
      if (href !== res.request.href) {
        href = res.request.href;
        $('#input').val(href);
      }

      // console.log(res.headers);

      href = url.parse(href);
      href = `${href.protocol}//${href.host}`;
      body = body.replace('<head>', `<head><base href="${href}"></base>`);

      ifrmae.open();
      ifrmae.write(body);
      ifrmae.close();

      frames[0].onerror = function(e) {
        console.log('test', e);
      };
    });
  }


  // app.setup(doc, $);
});
