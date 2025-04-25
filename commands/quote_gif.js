const { getUserAvatar } = require('../helpers/getAvatar');
const { translitPreserveEmoji } = require('../helpers/translit');
const { generateGif } = require('../render/generateGif');
const gifQueue = require('../helpers/queue');
const { incrementStats } = require('../helpers/stats');

module.exports = (sendAsFile = false) => {
  return async (ctx) => {
    const reply = ctx.message.reply_to_message;
    const commandText = ctx.message.text.split(' ').slice(1).join(' ').trim();

    if (!reply) {
      return ctx.reply(`Пожалуйста, используй команду /quote_gif${sendAsFile ? '_file' : ''} в ответ на сообщение.`);
    }

    let quoteText = commandText || reply.text || '';
    quoteText = translitPreserveEmoji(quoteText.trim());

    const isTrimmed = quoteText.length > 100;
    if (isTrimmed) {
      quoteText = quoteText.substring(0, 77).trim();
    }

    let username = reply.from.first_name || 'User';
    username = translitPreserveEmoji(username.replace(/[ьЬъЪ\u0000-\u001F\u007F-\u009F]/g, ''));

    const avatarPath = await getUserAvatar(ctx, reply.from.id);

    gifQueue.add(async () => {
      const gifPath = await generateGif(quoteText, username, avatarPath, isTrimmed);
      if (sendAsFile) {
        await ctx.replyWithDocument({ source: gifPath });
      } else {
        await ctx.replyWithAnimation({ source: gifPath });
      }
    }).catch((err) => {
      console.error('Ошибка генерации гифки:', err);
      ctx.reply('Произошла ошибка при генерации гифки 😢');
    });
  };

  incrementStats(ctx.chat.id);
};
