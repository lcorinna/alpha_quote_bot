const { translitPreserveEmoji } = require('./translit');
const { filterSupportedChars } = require('./filterSupportedChars');

const TEXT_LIMIT = 100;
const TEXT_CUT = 77;

async function prepareQuoteContext(ctx, commandName) {
  if (ctx.chat.type === 'private') {
    await ctx.reply(
      `🔒 Эта команда работает только в группе — просто ответь на чьё-то сообщение и напиши ${commandName}, чтобы сделать цитату.`
    );
    return null;
  }

  const reply = ctx.message.reply_to_message;
  if (!reply || !reply.text || !reply.from || reply.from.is_bot) {
    await ctx.reply(`👆 Используй команду ${commandName} в ответ на сообщение от обычного пользователя.`);
    return null;
  }

  const commandText = ctx.message.text.split(' ').slice(1).join(' ').trim();
  let quoteText = commandText || reply.text;
  quoteText = translitPreserveEmoji(quoteText.trim());
  quoteText = filterSupportedChars(quoteText);

  const isTrimmed = quoteText.length > TEXT_LIMIT;
  if (isTrimmed) {
    quoteText = quoteText.substring(0, TEXT_CUT).trim();
  }

  const username = translitPreserveEmoji(reply.from.first_name || 'User');

  return { quoteText, username, isTrimmed, userId: reply.from.id };
}

module.exports = { prepareQuoteContext };
