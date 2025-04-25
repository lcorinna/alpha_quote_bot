module.exports = async (ctx) => {
  if (ctx.chat.type !== 'private') {
    return; // Не отвечаем в группах/супергруппах
  }

  const user = ctx.from.first_name || 'друг';

  await ctx.replyWithMarkdownV2(
    `👋 Привет, *${user}*\\!\n\n` +
    `Чтобы сделать цитату, просто ответь на сообщение и напиши:\n` +
    `\`/quote\` — сделаю картинку\\.\n` +
    `\`/quote_gif\` — сделаю гифку\\.\n` +
    `\`/quote_gif_file\` — сделаю гифку, но отправлю как файл\\.`
  );
};
