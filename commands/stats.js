const ADMIN_ID = 271223425;
const path = require('path');
const fs = require('fs');

function loadStats() {
  try {
    const statsPath = path.join(__dirname, '../data/stats.json');
    if (!fs.existsSync(statsPath)) return { triggerCount: 0, chats: [] };
    return JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  } catch (err) {
    return { triggerCount: 0, chats: [] };
  }
}

module.exports = async (ctx) => {
  // Только личные сообщения от админа
  if (ctx.chat.type !== 'private' || ctx.from.id !== ADMIN_ID) return;

  const stats = loadStats();

  await ctx.reply(
    `📊 Статистика:\n\nСработал: ${stats.triggerCount} раз\nЧатов: ${stats.chats.length}`
  );
};
