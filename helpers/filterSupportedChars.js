require('./fonts');
const { createCanvas } = require('@napi-rs/canvas');

const canvas = createCanvas(96, 96);
const ctx = canvas.getContext('2d');
ctx.font = 'bold 92px "Pauls Ransom Note"';
ctx.textBaseline = 'top';
ctx.fillStyle = '#ffffff';

function isRenderable(char) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(char, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a !== 0 && (r !== 0 || g !== 0 || b !== 0)) {
      return true;
    }
  }
  return false;
}

function filterSupportedChars(text) {
  return [...text].filter(char => {
    // Пробел и все не-ASCII (эмодзи, спецсимволы) пропускаем без проверки пикселей
    if (char === ' ' || char.codePointAt(0) > 127) return true;
    return isRenderable(char);
  }).join('');
}

module.exports = { filterSupportedChars };
