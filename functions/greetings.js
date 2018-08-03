// Bot small talk functions
function greetings(bot) {
    bot.on('hi', msg => msg.reply.text("Hello there!"));
}

module.exports = {
    greetings: greetings
}