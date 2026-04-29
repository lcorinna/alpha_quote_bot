require('../helpers/fonts');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const GIFEncoder = require('gifencoder');
const { getRandomBackground, drawAvatar } = require('../helpers/canvasUtils');
const { randomUUID } = require('crypto');

const WIDTH = 1280;
const HEIGHT = 720;
const TOTAL_FRAMES = 12;
const FRAME_DELAY = 250;
const LAST_FRAME_DELAY = 1500;
const AVATAR_SIZE = 260;
const TEXT_X = 100;
const TEXT_Y = 380;
const TEXT_MAX_WIDTH = 950;
const TEXT_MAX_Y = HEIGHT - 90;

function calcLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitText(ctx, text, maxWidth, availHeight, fontFamily, startSize) {
  for (let size = startSize; size >= 24; size -= 4) {
    ctx.font = `${size}px "${fontFamily}"`;
    const lh = Math.ceil(size * 1.2);
    const lines = calcLines(ctx, text, maxWidth);
    if (lines.length * lh <= availHeight) return { size, lh, lines };
  }
  const size = 24;
  ctx.font = `${size}px "${fontFamily}"`;
  return { size, lh: Math.ceil(size * 1.2), lines: calcLines(ctx, text, maxWidth) };
}

async function generateGif(text, author, avatarPath, isTrimmed) {
  const filePath = path.join(__dirname, `../assets/quote-${randomUUID()}.gif`);
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const stream = fs.createWriteStream(filePath);

  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setQuality(3);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const bg = await getRandomBackground();
  const avatarImage = await loadImage(avatarPath);

  const fullText = `"${text}${isTrimmed ? '...' : ''}"`;

  // Рассчитываем размер шрифта один раз для всех кадров
  ctx.textBaseline = 'top';
  const { size: textSize, lh: textLh } = fitText(
    ctx, fullText, TEXT_MAX_WIDTH, TEXT_MAX_Y - TEXT_Y, 'Pauls Ransom Note', 62
  );

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const isLast = i === TOTAL_FRAMES - 1;
    encoder.setDelay(isLast ? LAST_FRAME_DELAY : FRAME_DELAY);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
    ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);

    drawAvatar(ctx, avatarImage, AVATAR_SIZE);

    const gradient = ctx.createLinearGradient(0, 240, 0, HEIGHT);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 240, WIDTH, HEIGHT - 240);

    const visibleText = fullText.slice(0, Math.ceil((fullText.length / TOTAL_FRAMES) * (i + 1)));

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    if (visibleText.trim().length > 0) {
      ctx.font = `${textSize}px "Pauls Ransom Note"`;
      const visLines = calcLines(ctx, visibleText, TEXT_MAX_WIDTH);
      let y = TEXT_Y;
      for (const line of visLines) {
        ctx.fillText(line, TEXT_X, y);
        y += textLh;
      }
    }

    ctx.font = '52px "Great Vibes"';
    const authorText = `— ${author}`;
    const authorWidth = ctx.measureText(authorText).width;
    ctx.fillText(authorText, WIDTH - authorWidth - 100, HEIGHT - 80);

    ctx.restore();

    encoder.addFrame(ctx);
  }

  encoder.finish();

  return new Promise((resolve) => {
    stream.on('finish', () => resolve(filePath));
  });
}

module.exports = { generateGif };
