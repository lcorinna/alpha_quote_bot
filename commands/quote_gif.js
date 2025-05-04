const { getUserAvatar } = require('../helpers/getAvatar');
const { translitPreserveEmoji } = require('../helpers/translit');
const { filterSupportedChars } = require('../helpers/filterSupportedChars');
const { generateGif } = require('../render/generateGif');
const gifQueue = require('../helpers/queue');
const { incrementStats } = require('../helpers/stats');

module.exports = (sendAsFile = false) => {
  return async (ctx) => {
    // 🔒 Только в группах
    if (ctx.chat.type === 'private') {
      return ctx.reply(
        '🔒 Эта команда работает только в чатах!Эта команда работает только в группе — просто ответь на чьё-то сообщение и напиши /quote_gif, чтобы сделать цитату.'
      );
    }

    const reply = ctx.message.reply_to_message;
    const command = `/quote_gif${sendAsFile ? '_file' : ''}`;

    if (!reply || !reply.text || reply.from?.is_bot) {
      return ctx.reply(`👆 Используй команду ${command} в ответ на сообщение от пользователя.`);
    }

    let quoteText = ctx.message.text.split(' ').slice(1).join(' ').trim() || reply.text;
    quoteText = translitPreserveEmoji(quoteText.trim());
    quoteText = filterSupportedChars(quoteText);

    const isTrimmed = quoteText.length > 100;
    if (isTrimmed) {
      quoteText = quoteText.substring(0, 77).trim();
    }

    let username = reply.from.first_name || 'User';
    username = translitPreserveEmoji(username.replace(/[ьЬъЪ\u0000-\u001F\u007F-\u009F]/g, ''));

    const avatarPath = await getUserAvatar(ctx, reply.from.id, username[0] || 'U');

    // Генерация гифки через очередь
    gifQueue.add(async () => {
      const gifPath = await generateGif(quoteText, username, avatarPath, isTrimmed);
      if (sendAsFile) {
        await ctx.replyWithDocument({ source: gifPath });
      } else {
        await ctx.replyWithAnimation({ source: gifPath });
      }

      // Удалить команду
      try {
        await ctx.deleteMessage();
      } catch (e) {
        console.warn('Не удалось удалить команду:', e.message);
      }

      // Статистика
      incrementStats(ctx);
    }).catch((err) => {
      console.error('Ошибка генерации гифки:', err);
      ctx.reply('Произошла ошибка при генерации гифки 😢');
    });
  };
};
