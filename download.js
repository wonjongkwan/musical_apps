import fs from 'fs';
import https from 'https';

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 308) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
          return reject('Status code ' + response.statusCode);
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const getWikiAudioUrl = (filename) => {
  return new Promise((resolve, reject) => {
    https.get(`https://commons.wikimedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const key = Object.keys(pages)[0];
          if(pages[key].imageinfo && pages[key].imageinfo[0] && pages[key].imageinfo[0].url) {
              resolve(pages[key].imageinfo[0].url);
          } else {
              reject('Image info missing for ' + filename);
          }
        } catch(e) {
          reject('Parse Error or Not Found for ' + filename);
        }
      });
    });
  });
};

async function run() {
  try {
    const tUrl = await getWikiAudioUrl('Twinkle_twinkle_little_star_(vocal).ogg');
    console.log('Got URL 1:', tUrl);
    await downloadFile(tUrl, './public/audio/twinkle.ogg');
    console.log('Downloaded twinkle');
  } catch(e) {
    console.error('Failed 1:', e);
  }

  try {
    const rUrl = await getWikiAudioUrl('Row,_Row,_Row_Your_Boat.ogg');
    console.log('Got URL 2:', rUrl);
    await downloadFile(rUrl, './public/audio/rowboat.ogg');
    console.log('Downloaded rowboat');
  } catch(e) {
    console.error('Failed 2:', e);
  }
}
run();
