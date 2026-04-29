const path = require('path');
const { loadImage } = require('@napi-rs/canvas');

const BG_COUNT = 5;
let cachedBackgrounds = null;

async function loadBackgrounds() {
  if (cachedBackgrounds) return cachedBackgrounds;
  cachedBackgrounds = await Promise.all(
    Array.from({ length: BG_COUNT }, (_, i) =>
      loadImage(path.join(__dirname, `../assets/quote${i + 1}.jpg`))
    )
  );
  return cachedBackgrounds;
}

async function getRandomBackground() {
  const backgrounds = await loadBackgrounds();
  return backgrounds[Math.floor(Math.random() * backgrounds.length)];
}

function drawAvatar(ctx, avatarImage, size = 360) {
  if (!avatarImage) return;

  const x = 100;
  const y = 100;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(avatarImage, x, y, size, size);
  ctx.restore();
}

module.exports = { getRandomBackground, drawAvatar };
