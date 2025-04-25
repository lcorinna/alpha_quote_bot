const path = require('path');
const fs = require('fs');

const statsPath = path.join(__dirname, '../stats.json');

function loadStats() {
  if (!fs.existsSync(statsPath)) {
    return { triggerCount: 0, chats: [] };
  }
  try {
    const data = fs.readFileSync(statsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ошибка чтения stats.json:', err);
    return { triggerCount: 0, chats: [] };
  }
}

function saveStats(stats) {
  try {
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {
    console.error('Ошибка записи stats.json:', err);
  }
}

function incrementStats(chatId) {
  const stats = loadStats();
  stats.triggerCount += 1;
  if (!stats.chats.includes(chatId)) {
    stats.chats.push(chatId);
  }
  saveStats(stats);
}

module.exports = { loadStats, incrementStats };
