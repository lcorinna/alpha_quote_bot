const { getUserAvatar } = require('../helpers/getAvatar');
const { translitPreserveEmoji } = require('../helpers/translit');
const { filterSupportedChars } = require('../helpers/filterSupportedChars');
const { generateImage } = require('../render/generateImage');
const { incrementStats } = require('../helpers/stats');

module.exports = async (ctx) => {
  // 🔒 Только в чатах
  if (ctx.chat.type === 'private') {
    return ctx.reply(
      '🔒 Эта команда работает только в группе — просто ответь на чьё-то сообщение и напиши /quote, чтобы сделать цитату.'
    );
  }

  const reply = ctx.message.reply_to_message;

  if (!reply || !reply.text || !reply.from || reply.from.is_bot) {
    return ctx.reply('👆 Используй команду /quote в ответ на сообщение от обычного пользователя.');
  }

  const commandText = ctx.message.text.split(' ').slice(1).join(' ').trim();
  let quoteText = commandText || reply.text || '';
  quoteText = translitPreserveEmoji(quoteText.trim());
  quoteText = filterSupportedChars(quoteText);

  const isTrimmed = quoteText.length > 100;
  if (isTrimmed) {
    quoteText = quoteText.substring(0, 77).trim();
  }

  let username = reply.from.first_name || 'User';
  username = translitPreserveEmoji(
    username.replace(/[ьЬъЪ\u0000-\u001F\u007F-\u009F]/g, '')
  );

  const avatarPath = await getUserAvatar(ctx, reply.from.id, username[0] || 'U');
  const imagePath = await generateImage(quoteText, username, avatarPath, isTrimmed);

  await ctx.replyWithPhoto({ source: imagePath });

  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Не удалось удалить сообщение с командой:', e.message);
  }

  incrementStats(ctx);
};
