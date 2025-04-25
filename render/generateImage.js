const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { wrapText } = require('../helpers/wrapText');
const { getRandomBackground, drawAvatar } = require('../helpers/canvasUtils');

// Подключаем шрифты
registerFont(path.join(__dirname, '../assets/fonts/Pauls_Ransom_Note.ttf'), {
  family: 'Pauls Ransom Note'
});
registerFont(path.join(__dirname, '../assets/fonts/GreatVibes-Regular.ttf'), {
  family: 'Great Vibes'
});

const width = 1536;
const height = 1024;

async function generateImage(text, author, avatarPath, isTrimmed) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bg = await getRandomBackground();
  ctx.drawImage(bg, 0, 0, width, height);

  // Аватар
  await drawAvatar(ctx, avatarPath);

  // Цитата
  ctx.font = 'bold 92px "Pauls Ransom Note"';
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';

  const fullText = `"${text}${isTrimmed ? '...' : ''}"`;
  wrapText(ctx, fullText, 100, 680, 1340, 100);

  // Автор
  ctx.font = '60px "Great Vibes"';
  const authorText = `— ${author}`;
  const authorWidth = ctx.measureText(authorText).width;
  ctx.fillText(authorText,  width - authorWidth - 100, height - 100);

  const outPath = path.join(__dirname, '../assets/result.jpg');
  const out = fs.createWriteStream(outPath);
  const stream = canvas.createJPEGStream();
  stream.pipe(out);

  return new Promise((resolve) => {
    out.on('finish', () => resolve(outPath));
  });
}

module.exports = { generateImage };
