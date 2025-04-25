module.exports = async (ctx) => {
  if (ctx.chat.type !== 'private') {
    return; // Только в личке
  }

  await ctx.reply('👤 Автор: @gaydaychuk\n💬 Нашли баг? Есть идеи? Пишите в личку!');
};