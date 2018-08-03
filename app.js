require('./config/config')

const TeleBot = require('telebot');
process.on('uncaughtException', function (err) {
    console.error(err.stack);
});

process.on('unhandledRejection', function (reason, p) {
    console.log(reason.message);
});

const port = process.env.PORT
const url = process.env.HEROKU_URL
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TeleBot({
    token: token, // Required. Telegram Bot API token.
    usePlugins: ['askUser']
});


// import bot functions/
require('./functions/start').start(bot);
require('./functions/register').register(bot);
require('./functions/help').help(bot);
require('./functions/greetings').greetings(bot);
require('./functions/test').test(bot);

// bot error handling / debugging
// require('./error').error(bot);

// echo bot
/* bot.on('text', (msg) => {
    console.log(msg)
    return msg.reply.text(msg.text)
}); */

bot.on('newChatMembers', (msg) => {
    console.log(msg)
    // bot.sendMessage(msg.from.id, "Welcome to SMU's Microsoft Student Community, hooray!");
})

// bot.on(/(show\s)?kitty*/, (msg) => {
//     return msg.reply.photo('http://thecatapi.com/api/images/get');
// });

bot.start();