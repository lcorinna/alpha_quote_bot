require('./fonts');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { createCanvas } = require('@napi-rs/canvas');
const { randomUUID } = require('crypto');

const AVATAR_SIZE = 360;
const telegramColors = [
  '#DF2C2C', '#A32CC4', '#FF5E3A',
  '#4D6AFF', '#00BCD4', '#4CAF50',
  '#FFC107', '#E91E63', '#FF9800',
];

async function generateFallbackAvatar(letter = 'U', color = '#4D6AFF') {
  const canvas = createCanvas(AVATAR_SIZE, AVATAR_SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(AVATAR_SIZE / 2, AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 160px "Great Vibes"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter.toUpperCase(), AVATAR_SIZE / 2, AVATAR_SIZE / 2);

  const fallbackPath = path.join(__dirname, `../assets/avatar-fallback-${randomUUID()}.jpg`);
  const buffer = await canvas.encode('jpeg');
  await fs.promises.writeFile(fallbackPath, buffer);
  return fallbackPath;
}

async function getUserAvatar(ctx, userId, fallbackLetter = 'U') {
  const colorIndex = fallbackLetter.charCodeAt(0) % telegramColors.length;

  try {
    const res = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);

    if (res.total_count > 0) {
      const fileId = res.photos[0].slice(-1)[0].file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });

      const filePath = path.join(__dirname, `../assets/avatar-${randomUUID()}.jpg`);
      await fs.promises.writeFile(filePath, response.data);
      return filePath;
    }

    return await generateFallbackAvatar(fallbackLetter, telegramColors[colorIndex]);
  } catch (err) {
    console.warn('Аватар не загружен, используем заглушку:', err.message);
    return await generateFallbackAvatar(fallbackLetter, telegramColors[colorIndex]);
  }
}

module.exports = { getUserAvatar };
