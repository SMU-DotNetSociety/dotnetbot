const emoji = require('node-emoji');
const fs = require('fs');

function help(bot) {    
    bot.on('/help', (msg) => {
        let res = "/start - Greetings!\n /register - Register your profile with us";
        
        response = '';
        bot.sendMessage(msg.from.id, '');
    })
}

module.exports = {
    help: help
}