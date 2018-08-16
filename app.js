const _ = require('lodash');
const emoji = require('node-emoji');
const TeleBot = require('telebot');
const config = require('./config');

process.on('uncaughtException', (err) => {
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, p) => {
  console.log(reason.message);
});

const bot = new TeleBot({
  token: config.token, // Required. Telegram Bot API token.
  usePlugins: ['askUser'],
});

// import bot functions
require('./functions/help').help(bot);
require('./functions/register').register(bot);
require('./functions/start').start(bot);

// bot error handling / debugging
// require('./error').error(bot);

bot.on('newChatMembers', (msg) => {
  let newMembers = [];
  _.each(msg.new_chat_members, (n) => {
    newMembers.push(n.first_name);
  });
  newMembers = newMembers.join(', ');

  bot.sendMessage(msg.chat.id, `Hey ${newMembers}, Welcome to SMU's Microsoft Student Community, hooray! ${emoji.get('smile')}`);
});

bot.start();
