const fs = require('fs');
const { getUserAvatar } = require('../helpers/getAvatar');
const { generateGif } = require('../render/generateGif');
const gifQueue = require('../helpers/queue');
const { incrementStats } = require('../helpers/stats');
const { prepareQuoteContext } = require('../helpers/prepareQuoteContext');

module.exports = (sendAsFile = false) => {
  const commandName = `/quote_gif${sendAsFile ? '_file' : ''}`;

  return async (ctx) => {
    const context = await prepareQuoteContext(ctx, commandName);
    if (!context) return;

    const { quoteText, username, isTrimmed, userId } = context;

    gifQueue.add(async () => {
      let avatarPath, gifPath;
      try {
        avatarPath = await getUserAvatar(ctx, userId, username[0] || 'U');
        gifPath = await generateGif(quoteText, username, avatarPath, isTrimmed);

        if (sendAsFile) {
          await ctx.replyWithDocument({ source: gifPath });
        } else {
          await ctx.replyWithAnimation({ source: gifPath });
        }

        try {
          await ctx.deleteMessage();
        } catch (e) {
          console.warn('Не удалось удалить команду:', e.message);
        }

        incrementStats(ctx);
      } catch (err) {
        console.error('Ошибка генерации гифки:', err);
        await ctx.reply('Произошла ошибка при генерации гифки 😢');
      } finally {
        await cleanup(avatarPath, gifPath);
      }
    });
  };
};

async function cleanup(...paths) {
  for (const p of paths) {
    if (!p) continue;
    try { await fs.promises.unlink(p); } catch {}
  }
}
