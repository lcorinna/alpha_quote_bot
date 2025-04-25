const path = require('path');
const { loadImage } = require('canvas');

// Случайный фон
async function getRandomBackground() {
  const bgIndex = Math.floor(Math.random() * 5) + 1;
  const bgPath = path.join(__dirname, `../assets/quote${bgIndex}.jpg`);
  return await loadImage(bgPath);
}

// Отрисовка аватара
async function drawAvatar(ctx, avatarPath) {
  if (!avatarPath) return;

  const avatar = await loadImage(avatarPath);
  const size = 360;
  const x = 100;
  const y = 100;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(avatar, x, y, size, size);
  ctx.restore();
}

module.exports = {
  getRandomBackground,
  drawAvatar,
};
