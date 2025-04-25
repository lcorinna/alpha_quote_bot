const ADMIN_ID = 271223425;
const { loadStats } = require('../helpers/stats');

module.exports = async (ctx) => {
  if (ctx.chat.type !== 'private' || ctx.from.id !== ADMIN_ID) return;

  const stats = loadStats();
  await ctx.reply(
    `📊 Статистика:\n\nСработал: ${stats.triggerCount} раз\nЧатов: ${stats.chats.length}`
  );
};
