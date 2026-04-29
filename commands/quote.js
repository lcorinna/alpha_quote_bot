const fs = require('fs');
const { getUserAvatar } = require('../helpers/getAvatar');
const { generateImage } = require('../render/generateImage');
const { incrementStats } = require('../helpers/stats');
const { prepareQuoteContext } = require('../helpers/prepareQuoteContext');

module.exports = async (ctx) => {
  const context = await prepareQuoteContext(ctx, '/quote');
  if (!context) return;

  const { quoteText, username, isTrimmed, userId } = context;

  let avatarPath, imagePath;
  try {
    avatarPath = await getUserAvatar(ctx, userId, username[0] || 'U');
    imagePath = await generateImage(quoteText, username, avatarPath, isTrimmed);
    await ctx.replyWithPhoto({ source: imagePath });
  } catch (e) {
    console.error('Ошибка генерации изображения:', e);
    await ctx.reply('Произошла ошибка при генерации изображения 😢');
    return;
  } finally {
    await cleanup(avatarPath, imagePath);
  }

  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Не удалось удалить сообщение с командой:', e.message);
  }

  incrementStats(ctx);
};

async function cleanup(...paths) {
  for (const p of paths) {
    if (!p) continue;
    try { await fs.promises.unlink(p); } catch {}
  }
}
