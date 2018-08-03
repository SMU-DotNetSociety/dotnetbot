const emoji = require('node-emoji');

function start (bot) {
    bot.on(['hi', '/start', '/hello', 'hello'], (msg) => {
        console.log(msg)
        bot.sendMessage(msg.from.id, 'Hello! I am **DotNetBot** %s, your friendly neighbourhood chatbot built for the **SMU Microsoft Student Community**.  \n\nSend /dotnet to learn more about what DotNet Society and our Microsoft Student Partners do or /help to see what else I can do!');
    })
}

module.exports = {
    start: start
}