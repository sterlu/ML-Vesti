const fetch = require('node-fetch');
const fs = require('fs')

const _isUpper = str => str && str.replace('j', 'J').replace('ž', 'Ž').replace('i', 'I') === str.toUpperCase();
const _isNumber = str => str && (new RegExp(/^[\d.,$€]+$/).test(str))
const isHype = str => str && (_isNumber(str) || _isUpper(str))

if (process.argv.length < 3)
  throw new Error('usage: node scrapefeed link');

const scrapeNews = async (continuation = '') => {
  try {
    const response = await fetch(
        `https://feedly.com/v3/streams/contents`
        + `?streamId=feed%2F${encodeURIComponent(process.argv[2])}`
        + `&count=1000`
        + `&ranked=newest`
        + `&continuation=${continuation}`
    );
    const data = await response.json();
    console.log('fetched ' + data.items.length);
    console.log('continue from ', data.continuation);
    const parsed = data.items.map(({id, title, summary, originId, published}) => {
      let _title = title.split(' ');
      let hypeTitle = '';
      while (isHype(_title[0]) && !(_title[0].length === 1 && !isHype(_title[1]))) {
        hypeTitle += _title[0] + ' ';
        _title = _title.slice(1);
      }
      const normalizedTitle = _title.join(' ').replace(/[„“"']/g, '');
      hypeTitle = hypeTitle.replace(/[„“"']/g, '');
      return {title, normalizedTitle, hypeTitle}
    });
    fs.appendFileSync('podaci/novi_podaci/pred_naslovi.input', parsed.map(i => i.hypeTitle).filter(a => a.length).join('\n') + '\n');
    fs.appendFileSync('podaci/novi_podaci/post_naslovi.input', parsed.map(i => i.normalizedTitle).filter(a => a.length).join('\n') + '\n');
    fs.appendFileSync('podaci/novi_podaci/puni_naslovi.input', parsed.map(i => i.title).filter(a => a.length).join('\n') + '\n');
    if (data.continuation) scrapeNews(data.continuation);
  } catch (e) {
    if (e.message.includes('invalid json response')) scrapeNews(continuation);
  }
};

scrapeNews();