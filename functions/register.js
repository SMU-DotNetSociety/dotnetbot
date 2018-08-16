const emoji = require('node-emoji');
const firebase = require('firebase');

const db = firebase.database();

function register(bot) {
  const session = {};
  let confirmationMessage;

  bot.on('/register', (msg) => {
    const { first_name: firstName, id } = msg.from;

    if (msg.chat.type !== 'private') { // user asked bot to register in group chat
      msg.reply.text(`Hello ${firstName}! Please PM me privately to use this function ${emoji.get('smiley')}`);
    } else {
      session.id = msg.chat.id;
      const response = 'What is your name? (real name please, thank you!)';

      return bot.sendMessage(id, response, { ask: 'name' });
    }
  });

  // Ask name event
  bot.on('ask.name', (msg) => {
    session.name = msg.text;
    const response = `Nice to meet you, ${session.name}! What's your SMU email? Please include your faculty e.g. _bob.tan.2015@sis.smu.edu.sg_`;

    return bot.sendMessage(session.id, response, { ask: 'email', parseMode: 'Markdown' });
  });

  // Ask email event
  bot.on('ask.email', (msg) => {
    session.email = msg.text;
    // TODO: check email validity here. regex

    if (!session.email) {
      const response = 'Invalid email. Please, try again!';
      return bot.sendMessage(session.id, response, { ask: 'email' });
    }

    // Last message (don't ask)
    let response = `Right, so its ${session.email}. Great!`;
    bot.sendMessage(session.id, response);

    const BUTTONS = {
      SIS: {
        label: 'SIS',
        command: 'SIS',
      },
      LKCSB: {
        label: 'LKCSB',
        command: 'LKCSB',
      },
      SOA: {
        label: 'SOA',
        command: 'SOA',
      },
      SOE: {
        label: 'SOE',
        command: 'SOE',
      },
      SOSS: {
        label: 'SOSS',
        command: 'SOSS',
      },
      SOL: {
        label: 'SOL',
        command: 'SOL',
      },
    };

    const replyMarkup = bot.keyboard([[
      BUTTONS.SIS.label,
      BUTTONS.LKCSB.label,
      BUTTONS.SOA.label,
      BUTTONS.SOE.label,
      BUTTONS.SOSS.label,
      BUTTONS.SOL.label,
    ]], { resize: true, once: true });

    response = 'Next, which faculty are you from?';
    bot.sendMessage(session.id, response, {
      replyMarkup,
      ask: 'faculty',
    });
  });

  // Ask faculty event
  bot.on('ask.faculty', (msg) => {
    session.faculty = msg.text;
    const response = `Nice! Another member from ${session.faculty} ${emoji.get('smiley')}. Which year are you currently in?`;

    return bot.sendMessage(msg.from.id, response, {
      replyMarkup: 'hide',
      ask: 'year',
    });
  });

  // Ask year event
  bot.on('ask.year', (msg) => {
    session.year = msg.text;

    const BUTTONS = {
      yes: {
        label: 'Yes',
        command: 'Yes',
      },
      no: {
        label: 'No',
        command: 'No',
      },
    };

    const replyMarkup = bot.keyboard([[
      BUTTONS.yes.label,
      BUTTONS.no.label,
    ]], { resize: true, once: true });

    const response = `Alright, here's what I've got so far:  \n\n*Name*: ${session.name} \n*Email*: ${session.email} \n*Faculty*: ${session.faculty} \n*Year of study*: ${session.year} \n\nAll good?`;

    return bot.sendMessage(msg.from.id, response, {
      replyMarkup,
      ask: 'confirm',
      parseMode: 'Markdown',
    });
  });

  bot.on('ask.confirm', (msg) => {
    const reply = msg.text;
    if (reply === 'Yes') {
      session.telegram_username = msg.from.username;

      db.ref(`users/${session.id}`).set(session)
        .then((error) => {
          if (!error) {
            const response = `Thank you for registering! Welcome to the community ${emoji.get('smiley')}`;
            return bot.sendMessage(session.id, response, { replyMarkup: 'hide' });
          }
          msg.reply.text('Oops, it looks like something went wrong. Please try registering again, thank you!');
          console.log(error);
        });
    } else {
      // Edit profile
      const markup = displayProfileKeyboard(session);
      const response = 'Which field has errors?';

      bot.sendMessage(msg.from.id, response, { replyMarkup: markup })
        .then((result) => {
          confirmationMessage = [msg.from.id, result.message_id]; // store this confirmation message
        });
    }
  });

  // On button callback
  bot.on('callbackQuery', (msg) => {
    // Callback query on inlineProfileKeyboard displayed on telegram chat - handles the button press
    console.log('edit profile callback');
    // Send confirm
    bot.answerCallbackQuery(msg.id);
    console.log('--- callbackQuery ---');
    console.log(msg);
    session.data = msg.data; // temp store callback data to track which field has to be edited

    if (msg.data == '/done') {
      delete session.data;
      db.ref(`users/${session.user_id}`).set(session)
        .then((error) => {
          if (!error) {
            const response = `Profile updated! ${emoji.get('smiley')}`;
            return bot.sendMessage(msg.from.id, response, { replyMarkup: 'hide' });
          }
          msg.reply.text('Whoops, looks like something went wrong!');
          console.log(error);
        });
    } else {
      const response = `Tell me what ${msg.data} should be`;
      return bot.sendMessage(msg.from.id, response, { ask: 'edit', replyMarkup: 'hide' });
    }
  });

  bot.on('ask.edit', (msg) => {
    console.log('--- ask.edit ---');
    console.log(`Session data: ${session.data}`);

    switch (session.data) {
      case 'name':
        session.name = msg.text;
        break;

      case 'email':
        session.email = msg.text;
        break;

      case 'faculty':
        session.faculty = msg.text;
        break;

      case 'year':
        session.year = msg.text;
        break;

      default:
        console.log('Should not reach here!');
        break;
    }

    const [chatId, messageId] = confirmationMessage;
    const replyMarkup = displayProfileKeyboard(session);

    return bot.editMessageReplyMarkup({ chatId, messageId }, { replyMarkup });
  });

  // this shouldn't be here.. but for now close one eye
  bot.on('/edit', (msg) => {
    const userId = msg.from.id;
    db.ref(`users/${userId}`).once('value').then((snapshot) => {
      console.log('--- snapshot from firebase db ---');
      console.log(snapshot.val());

      if (snapshot.val()) {
        console.log('profile found');
        const markup = displayProfileKeyboard(snapshot.val());
        bot.sendMessage(msg.from.id, 'Edit your profile details \nWhich data field has errors?', { replyMarkup: markup })
          .then((result) => {
            confirmationMessage = [msg.from.id, result.message_id]; // store this confirmation message
          });
      } else {
        console.log('profile not found');
        bot.sendMessage(msg.from.id, 'You have not registered a profile with me yet, would you like to do that now? What is your name?', { ask: 'name' });
      }
    });
  });

  // Returns keyboard markup
  function displayProfileKeyboard(data) {
    const {
      name, email, faculty, year,
    } = data;
    const done = '/done';

    return bot.inlineKeyboard([
      [bot.inlineButton(name, { callback: 'name' })],
      [bot.inlineButton(email, { callback: 'email' })],
      [bot.inlineButton(faculty, { callback: 'faculty' })],
      [bot.inlineButton(year, { callback: 'year' })],
      [bot.inlineButton(done, { callback: '/done' })],
    ]);
  }
}

module.exports = {
  register,
};
