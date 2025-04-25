const { getUserAvatar } = require('../helpers/getAvatar');
const { translitPreserveEmoji } = require('../helpers/translit');
const { generateImage } = require('../render/generateImage');
const { incrementStats } = require('../helpers/stats');

module.exports = async (ctx) => {
  const reply = ctx.message.reply_to_message;

  if (!reply) {
    return ctx.reply(
      'Я не вижу сообщение, на которое ты ответил. Возможно, это бот или системное сообщение.\n\nПожалуйста, используй /quote в ответ на обычный текст от пользователя.'
    );
  }

  if (!reply.text || !reply.from || reply.from.is_bot) {
    return ctx.reply('Можно цитировать только текстовые сообщения от людей 👤');
  }

  const commandText = ctx.message.text.split(' ').slice(1).join(' ').trim();
  let quoteText = commandText || reply.text || '';
  quoteText = translitPreserveEmoji(quoteText.trim());

  const isTrimmed = quoteText.length > 100;
  if (isTrimmed) {
    quoteText = quoteText.substring(0, 77).trim();
  }

  let username = reply.from.first_name || 'User';
  username = translitPreserveEmoji(username.replace(/[ьЬъЪ\u0000-\u001F\u007F-\u009F]/g, ''));

  const avatarPath = await getUserAvatar(ctx, reply.from.id, reply.from.first_name?.[0] || 'U');
  const imagePath = await generateImage(quoteText, username, avatarPath, isTrimmed);

  await ctx.replyWithPhoto({ source: imagePath });

  // Пытаемся удалить сообщение с командой
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Не удалось удалить сообщение с командой:', e.message);
  }

  incrementStats(ctx.chat.id);
};
