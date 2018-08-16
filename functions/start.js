const emoji = require('node-emoji');
const config = require('../config');

function start(bot) {
  bot.on(['/start', /[Hh](i|ello)/], (msg) => {
    const res = `Hello ${msg.from.first_name}! I am *DotNetBot* ${emoji.get('robot_face')}, your friendly neighbourhood chatbot built for the *SMU Microsoft Student Community*.  We'd love for you to join us here:  \n${config.chat}  \n\nSend /help to see what else I can do!`;

    bot.sendMessage(msg.from.id, res, { parseMode: 'Markdown' });
  });
}

module.exports = {
  start,
};
