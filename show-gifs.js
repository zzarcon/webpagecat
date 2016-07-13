const request = require('superagent');
const imgcat = require('imgcat')
const endpoint = 'http://api.giphy.com/v1/gifs/trending';
const key = 'dc6zaTOxFJmzC';
const delay = 5000;

const getImages = () => {
  return new Promise((resolve, reject) => {
    request
    .get(endpoint)
    .query({api_key: key})
    .end((err, res) => {
      if (err) return reject(err);

      const images = res.body.data
        .filter(image => image.images.original.height <= 400)
        .map(image => image.images.original.url);
      
      resolve(images);
    });
  });
}

const logImage = images => {
  if (!images.length) return;

  const img = images.pop();

  imgcat(img, {log: true});
  setTimeout(_ => logImage(images), delay);
};

module.exports = _ => getImages().then(logImage);