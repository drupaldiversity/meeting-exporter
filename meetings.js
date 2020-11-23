// @TODO: Change this file to be dynamic based on an argument
const data = require('./exports-temp/2019-04-18.json');
const usersExport = require('./exports-temp/users.json');

// Load all users into memory.
const users = {};
const contributors = {};
usersExport.forEach(user => {
    users[user.id] = user.profile.display_name_normalized ? user.profile.display_name_normalized : user.profile.real_name_normalized;
});

// Load all messages into memory.
const messages = {};
data.forEach(message => {
    if (message.type === 'message') {
        let parsedMessage = message;
        parsedMessage.text = parsedMessage.text.replace(/<@(U.+?)>/g, (match, p1) => {
            return `@${users[p1]}`;
        });
        parsedMessage.text = parsedMessage.text.replace(':zero:', '0️⃣');
        parsedMessage.text = parsedMessage.text.replace(':one:', '1️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':two:', '2️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':three:', '3️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':four:', '4️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':five:', '5️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':six:', '6️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':seven:', '7️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':eight:', '8️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':nine:', '9️⃣ ');
        parsedMessage.text = parsedMessage.text.replace(':ten:', '🔟 ');
        messages[message.ts] = parsedMessage;
    }
});

// Reconstruct threads.
let meetingStart = 0;
let moderator = '';
let threads = data
    .filter(message => message.type === 'message')
    .map((message, i) => {
        let reconstructedMessage = message;
        if (message.replies && message.replies.length) {
            reconstructedMessage.replies = message.replies
            .filter(reply => messages[reply.ts])
            .map(reply => {
                const replyMessage = messages[reply.ts];
                replyMessage.text = `<td>${users[reply.user]}</td><td>${replyMessage.text}</td>\n`;
                // Contributors
                if (!message.text.includes('0️⃣')) {
                contributors[reply.user] = users[reply.user];
                }
                return replyMessage;
            });
        }
        if (message.text.includes('Inclusion meeting!')) {
            meetingStart = i;
            moderator = users[message.user];
        }

        return reconstructedMessage;
    })
    .filter(message => !message.parent_user_id);

//threads = threads.slice(meetingStart);

if (!moderator.length) {
    console.log('No meeting found!');
}
else {
    let output = `<h3>Moderated By: ${moderator}</h3>\n`;

    threads.forEach(thread => {
        output += `<h2>${thread.text}</h2>\n`;
        if (thread.replies && thread.replies.length) {
            output += '<table>\n';
            thread.replies.forEach(reply => {
                output += `<tr>${reply.text}</tr>\n`;
            });
            output += '</table>\n';
        }
    });

    console.log(output, '\n\n\n', Object.keys(contributors).map(id => users[id]));
}
