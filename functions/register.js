const emoji = require('node-emoji');
const firebase = require('firebase');
const db = firebase.database();

function register(bot) {
    let session = {};
    let confirmationMessage;

    bot.on('/register', (msg) => {
        const id = msg.from.id;
        if (msg.chat.type != 'private') { // user asked bot to register in group chat
            // Can they bot PM the user directly instead?
            msg.reply.text("Heyyyyyy, how about you PM me instead " + emoji.get('wink') + " we wouldn't want everyone to know your personal details now, would we?")
        } else {
            session.private_chat_id = msg.chat.id;
            return bot.sendMessage(id, "What is your name?", {ask: 'name'});
        }
    })

    // Ask name event
    bot.on('ask.name', msg => {

        const id = msg.from.id;
        const name = msg.text;
        session.name = name;
        // Ask user age
        return bot.sendMessage(id, `Nice to meet you, ${name}! Whats your SMU email?`, { ask: 'email' });

    });

    // Ask email event
    bot.on('ask.email', msg => {

        const id = msg.from.id;
        const email = msg.text;
        session.email = email;
        //TODO: check email validity here. regex

        if (!email) {

            // If incorrect age, ask again
            return bot.sendMessage(id, 'Invalid email. Please, try again!', { ask: 'email' });

        } else {

            // Last message (don't ask)
            bot.sendMessage(id, `Right, so its ${email}. Great!`);
            const BUTTONS = {
                SOB: {
                    label: 'SOB',
                    command: 'SOB'
                },
                SOA: {
                    label: 'SOA',
                    command: 'SOA'
                },
                SOE: {
                    label: 'SOE',
                    command: 'SOE'
                },
                SOSS: {
                    label: 'SOSS',
                    command: 'SOSS'
                },
                SIS: {
                    label: 'SIS',
                    command: 'SIS'
                },
                SOL: {
                    label: 'SOL',
                    command: 'SOL'
                }
            };

            let replyMarkup = bot.keyboard([[
                BUTTONS.SOB.label,
                BUTTONS.SOA.label,
                BUTTONS.SOE.label,
                BUTTONS.SOSS.label,
                BUTTONS.SIS.label,
                BUTTONS.SOL.label
            ]], { resize: true });

            bot.sendMessage(id, `Next, which faculty are you from?`, { 
                replyMarkup: replyMarkup,
                ask: 'faculty'}
            );

        }

    });

    // Ask faculty event
    bot.on('ask.faculty', msg => {
        const faculty = msg.text;
        session.faculty = faculty;
        return bot.sendMessage(msg.from.id, `Ooooooh so you're from ${faculty}. Which year are you in now?`, {
            replyMarkup: 'hide', 
            ask: 'year'
        });
        
    });

    // Ask year event
    bot.on('ask.year', msg => {
        const year = msg.text;
        session.year = year;
        session.user_id = msg.from.id;
        
        const BUTTONS = {
            yes: {
                label: 'Yes',
                command: 'No'
            },
            no: {
                label: 'No',
                command: 'Yes'
            }
        };

        let replyMarkup = bot.keyboard([[
            BUTTONS.yes.label,
            BUTTONS.no.label
        ]], { resize: true });

        return bot.sendMessage(msg.from.id, `Okay heres what I got so far ${session.name}:\n \n*Email:* ${session.email} \n*Faculty:* ${session.faculty} \n*Year:* ${year} \n\nAll good? ${emoji.get('grimacing')}`, {
            replyMarkup: replyMarkup,
            ask: 'register_confirm'
        });
        
    });

    bot.on('ask.register_confirm', msg => {
        const reply = msg.text;
        if (reply == "Yes") {
            session.telegram_username = msg.from.username;

            db.ref(`users/${session.user_id}`).set(session)
            .then((error) => {

                if (!error) {
                    return bot.sendMessage(msg.from.id, 'Thank you for registering! Welcome to the community ' + emoji.get('smiley'), { replyMarkup: 'hide' });
                } else {
                    msg.reply.text("hmmm looks like something went wrong!");
                    console.log(error);
                }

            });
        } else {
            // Edit profile
            const markup = displayProfileKeyboard(session);
            bot.sendMessage(msg.from.id, 'Which field has errors?', { replyMarkup: markup })
            .then((result) => {
                confirmationMessage = [msg.from.id, result.message_id]; // store this confirmation message
            })
        }
    })

    // On button callback
    bot.on('callbackQuery', msg => {
        // Callback query on inlineProfileKeyboard displayed on telegram chat - handles the button press
        console.log("edit profile callback");
        // Send confirm
        bot.answerCallbackQuery(msg.id);
        console.log("--- callbackQuery ---")
        console.log(msg)
        session.data = msg.data; // temp store callback data to track which field has to be edited
        
        if (msg.data == "/done") {
            delete session.data
            db.ref(`users/${session.user_id}`).set(session)
                .then((error) => {
                    if (!error) {
                        return bot.sendMessage(msg.from.id, 'Profile updated! ' + emoji.get('smiley'), { replyMarkup: 'hide' });
                    } else {
                        msg.reply.text("Whoops, looks like something went wrong!");
                        console.log(error);
                    }

                });
        } else {
            return bot.sendMessage(msg.from.id, `Tell me what ${msg.data} should be`, { ask: 'edit', replyMarkup: 'hide'})
        }
    });

    bot.on('ask.edit', msg => {
        console.log("--- ask.edit ---");
        console.log(`Session data: ${session.data}`);

        switch (session.data) {
            case "name":
                session.name = msg.text
                break;
            
            case "email":
                session.email = msg.text
                break;
            
            case "faculty":
                session.faculty = msg.text
                break;
            
            case "year":
                session.year = msg.text
                break;

            default:
                console.log("Should not reach here!")
                break;
        }

        const [chatId, messageId] = confirmationMessage;
        const replyMarkup = displayProfileKeyboard(session);

        return bot.editMessageReplyMarkup({ chatId, messageId }, { replyMarkup });
    })

    bot.on("/edit", msg => {
        if (!session.name) {
            bot.sendMessage(msg.from.id, "You haven't register a profile with me yet, would you like to do that now? What is your name?", {ask: 'name'})
        } else {
            const markup = displayProfileKeyboard(session);
            bot.sendMessage(msg.from.id, 'Edit your profile details \nWhich data field has errors?', { replyMarkup: markup })
            .then((result) => {
                confirmationMessage = [msg.from.id, result.message_id]; // store this confirmation message
            })
        }
    })

    // Returns keyboard markup
    function displayProfileKeyboard(data) {
        console.log("--- displayProfileKeyboard ---")

        let name = session.name;
        let email = session.email;
        let year = session.year;
        let faculty = session.faculty;
        let done = "/done";


        return bot.inlineKeyboard([
            [bot.inlineButton(name, { callback: 'name' })], 
            [bot.inlineButton(email, { callback: 'email' })],
            [bot.inlineButton(faculty, { callback: 'faculty' })], 
            [bot.inlineButton(year, { callback: 'year' })], 
            [bot.inlineButton(done, { callback: '/done' })]
        ]);

    }
}

module.exports = {
    register: register
}