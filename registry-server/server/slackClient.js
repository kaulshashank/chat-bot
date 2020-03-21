const { RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

let rtm = null;
let nlp = null;
let registry = null;

const appData = {}; // Cache of bot data

function handleOnMessage(message) {
  if(message.text.toLowerCase().includes('floatingnuts')) {
    nlp.ask(message.text, (err, res) => {
      if(err) {
        console.log(err);
        return;
      }
      try {
        if(!res.intent || !res.intent[0] || !res.intent[0].value) {
          throw new Error("Could not find any intent.");
        }
        const intent = require('./intents/'+res.intent[0].value + 'intent');
        intent.process(res, registry, (err, response) => {
          if(err) {
            console.log(error.message);
            return;
          }
           return rtm.sendMessage(response, message.channel);
        });
      } catch(err) {
        console.log(err);
        console.log(res);
        rtm.sendMessage("Sorry, I dont know what you are talking about.", message.channel);
      }
      if(!res.intent) {
        return rtm.sendMessage('Sorry, I dont know what you are talking about.', message.channel);
      } else if(res.intent[0].value == 'time' && !res.location) {
        console.log(res);
        return rtm.sendMessage(`I dont yet know the time in ${res.location[0].value}`, message.channel);
      }
    });
  }
}

module.exports.init = function slackClient(token, logLevel, nlpClient, serviceRegistry) {
  // Initialize the RTM client with the recommended settings. Using the defaults for these
  // settings is deprecated.
  rtm = new RtmClient(token, {
    dataStore: false,
    useRtmConnect: true,
  });
  nlp = nlpClient;
  registry = serviceRegistry;
  // The client will emit an RTM.AUTHENTICATED event on when the connection data is avaiable
  // (before the connection is open)
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    // Cache the data necessary for this app in memory
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
  });


  // The client will emit an RTM.RTM_CONNECTION_OPEN the connection is ready for
  // sending and recieving messages
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPEN, () => {
    console.log(`Ready`);
  });

  rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);

  return rtm;
}
