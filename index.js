require('dotenv').config(); 
const { Telegraf } = require('telegraf');
const startCommand = require('./commands/start');
const quoteCommand = require('./commands/quote');
const quoteGifBase = require('./commands/quote_gif');
const aboutCommand = require('./commands/about');
const statsCommand = require('./commands/stats');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startCommand);
bot.command('quote', quoteCommand);
bot.command('quote_gif', quoteGifBase(false));      // как gif
bot.command('quote_gif_file', quoteGifBase(true)); // как файл
bot.command('about', aboutCommand);
bot.command('stats', statsCommand);

// ✅ Зарегистрировать команды для Telegram интерфейса
bot.telegram.setMyCommands([
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'about', description: 'Инфо и обратная связь' },
  { command: 'quote', description: 'Сделать цитату' },
  { command: 'quote_gif', description: 'Сделать цитату в gif' },
  // { command: 'quote_gif_file', description: 'Сделать gif и отправить как файл' },
]);

bot.launch();
