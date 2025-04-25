const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const { wrapText } = require('../helpers/wrapText');
const { getRandomBackground, drawAvatar } = require('../helpers/canvasUtils');

// Шрифты
registerFont(path.join(__dirname, '../assets/fonts/Pauls_Ransom_Note.ttf'), {
  family: 'Pauls Ransom Note'
});
registerFont(path.join(__dirname, '../assets/fonts/GreatVibes-Regular.ttf'), {
  family: 'Great Vibes'
});

// Сниженное разрешение
const width = 1280;
const height = 720; 

async function generateGif(text, author, avatarPath, isTrimmed) {
  const encoder = new GIFEncoder(width, height);
  const filePath = path.join(__dirname, '../assets/quote.gif');
  const stream = fs.createWriteStream(filePath);

  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setTransparent('#000');           // помогает Telegram не перекодировать
  encoder.setQuality(10);                   // хорошее качество, сбалансированное
  const totalFrames = 12;
  const baseDelay = 250;                    // 250 * 11 + 1500 = 4.25 сек

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const bg = await getRandomBackground();

  const fullText = `"${text}${isTrimmed ? '...' : ''}"`;

  for (let i = 0; i < totalFrames; i++) {
    const isLast = i === totalFrames - 1;
    encoder.setDelay(isLast ? 1500 : baseDelay);

    // Очистка
    ctx.clearRect(0, 0, width, height);

    // Фон
    ctx.globalAlpha = 1;
    ctx.drawImage(bg, 0, 0, width, height);

    // Аватар
    await drawAvatar(ctx, avatarPath);

    // Цитата по буквам
    const visibleText = fullText.slice(0, Math.ceil((fullText.length / totalFrames) * (i + 1)));
    if (visibleText.trim().length > 0) {
      ctx.font = 'bold 72px "Pauls Ransom Note"';
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      wrapText(ctx, visibleText, 100, 500, 1080, 90);
    }

    // Автор
    ctx.font = '52px "Great Vibes"';
    const authorText = `— ${author}`;
    const authorWidth = ctx.measureText(authorText).width;
    ctx.fillText(authorText, width - authorWidth - 100, height - 80);

    encoder.addFrame(ctx);
  }

  encoder.finish();

  return new Promise((resolve) => {
    stream.on('finish', () => resolve(filePath));
  });
}

module.exports = { generateGif };
