require('dotenv').load()
const TeleBot = require('telebot');
const express = require('express');
const app = express();

const bot = new TeleBot({
    token: "624543678: AAGdVFJG9D8unbKtfC_JqaSgmYld6DbFZLw", // Required. Telegram Bot API token.
});


bot.setWebhook("https://9ed417ff.ngrok.io/624543678: AAGdVFJG9D8unbKtfC_JqaSgmYld6DbFZLw");
bot.on('text', (msg) => {
    msg.reply.text(msg.text)
    bot.getWebhookInfo().then((info) => {
        console.log(info);
    })
});

app.post('/', (req, res) => {
 const update = req.body;
 bot.receiveUpdates([update]).then(() => res.end());
});

app.listen(8080, () => {
    console.log("Listening on 8080")
});