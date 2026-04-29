require('../helpers/fonts');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { getRandomBackground, drawAvatar } = require('../helpers/canvasUtils');
const { randomUUID } = require('crypto');

const WIDTH = 1536;
const HEIGHT = 1024;
const TEXT_X = 100;
const TEXT_Y = 490;
const TEXT_MAX_WIDTH = 1100;
const TEXT_MAX_Y = HEIGHT - 120;

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
  for (let size = startSize; size >= 36; size -= 4) {
    ctx.font = `${size}px "${fontFamily}"`;
    const lh = Math.ceil(size * 1.2);
    const lines = calcLines(ctx, text, maxWidth);
    if (lines.length * lh <= availHeight) return { size, lh, lines };
  }
  const size = 36;
  ctx.font = `${size}px "${fontFamily}"`;
  return { size, lh: Math.ceil(size * 1.2), lines: calcLines(ctx, text, maxWidth) };
}

async function generateImage(text, author, avatarPath, isTrimmed) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const bg = await getRandomBackground();
  ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);

  const avatarImage = await loadImage(avatarPath);
  drawAvatar(ctx, avatarImage);

  const gradient = ctx.createLinearGradient(0, 380, 0, HEIGHT);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 380, WIDTH, HEIGHT - 380);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';

  const fullText = `"${text}${isTrimmed ? '...' : ''}"`;
  const { size, lh, lines } = fitText(ctx, fullText, TEXT_MAX_WIDTH, TEXT_MAX_Y - TEXT_Y, 'Pauls Ransom Note', 88);

  ctx.font = `${size}px "Pauls Ransom Note"`;
  let y = TEXT_Y;
  for (const line of lines) {
    ctx.fillText(line, TEXT_X, y);
    y += lh;
  }

  ctx.font = '60px "Great Vibes"';
  const authorText = `— ${author}`;
  const authorWidth = ctx.measureText(authorText).width;
  ctx.fillText(authorText, WIDTH - authorWidth - 100, HEIGHT - 100);

  ctx.restore();

  const outPath = path.join(__dirname, `../assets/result-${randomUUID()}.jpg`);
  const buffer = await canvas.encode('jpeg');
  await fs.promises.writeFile(outPath, buffer);
  return outPath;
}

module.exports = { generateImage };
