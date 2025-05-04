const { createCanvas, registerFont } = require('canvas');
const path = require('path');

// Подключаем тот же шрифт, что и в рендере
registerFont(path.join(__dirname, '../assets/fonts/Pauls_Ransom_Note.ttf'), {
  family: 'Pauls Ransom Note',
});

const canvas = createCanvas(96, 96);
const ctx = canvas.getContext('2d');
ctx.font = 'bold 92px "Pauls Ransom Note"';
ctx.textBaseline = 'top';
ctx.fillStyle = '#ffffff';

// Проверка: появился ли хоть один цветной пиксель
function isRenderable(char) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(char, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
    if (a !== 0 && (r !== 0 || g !== 0 || b !== 0)) {
      return true;
    }
  }

  return false;
}

// Удаляем символы, которые не отображаются
function filterSupportedChars(text) {
  return [...text].filter(isRenderable).join('');
}

module.exports = { filterSupportedChars };
