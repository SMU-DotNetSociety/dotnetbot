function error(bot) {
    bot.on('error', (msg) => {
        console.log(msg)
        bot.sendMessage(msg.from.id, 'Uh oh');
    })
}

module.exports = {
    error: error
}