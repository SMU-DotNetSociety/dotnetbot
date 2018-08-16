function help(bot) {
  bot.on('/help', (msg) => {
    const response = `Thanks for asking! Here's what I can do for now:  
- /register - save your details for priority access to our events!  
- /feedback - send your feedback directly to my creators!`;

    bot.sendMessage(msg.from.id, response);
  });
}

module.exports = {
  help,
};
