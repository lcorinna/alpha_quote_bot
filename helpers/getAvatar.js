const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { createCanvas, registerFont } = require('canvas');

// Регистрируем красивый шрифт
registerFont(path.join(__dirname, '../assets/fonts/GreatVibes-Regular.ttf'), {
  family: 'Great Vibes'
});

// Цвета, как у Telegram-заглушек
const telegramColors = [
  '#DF2C2C', '#A32CC4', '#FF5E3A',
  '#4D6AFF', '#00BCD4', '#4CAF50',
  '#FFC107', '#E91E63', '#FF9800'
];

// Генерация заглушки
function generateFallbackAvatar(letter = 'U', color = '#4D6AFF') {
  const size = 360;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Фон
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Буква
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 160px "Great Vibes"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter.toUpperCase(), size / 2, size / 2);

  const fallbackPath = path.join(__dirname, '../assets/avatar-fallback.jpg');
  const out = fs.createWriteStream(fallbackPath);
  const stream = canvas.createJPEGStream();
  stream.pipe(out);

  return new Promise((resolve) => {
    out.on('finish', () => resolve(fallbackPath));
  });
}

async function getUserAvatar(ctx, userId, fallbackLetter = 'U') {
  try {
    const res = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);

    if (res.total_count > 0) {
      const fileId = res.photos[0].slice(-1)[0].file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });

      const filePath = path.join(__dirname, '../assets/avatar.jpg');
      fs.writeFileSync(filePath, response.data);
      return filePath;
    }

    // если фото нет — сгенерируем заглушку
    const colorIndex = fallbackLetter.charCodeAt(0) % telegramColors.length;
    return await generateFallbackAvatar(fallbackLetter, telegramColors[colorIndex]);
  } catch (err) {
    console.warn('Аватар не загружен, используем заглушку:', err.message);
    const colorIndex = fallbackLetter.charCodeAt(0) % telegramColors.length;
    return await generateFallbackAvatar(fallbackLetter, telegramColors[colorIndex]);
  }
}

module.exports = { getUserAvatar };
