import 'dotenv/config';
import { getOptions } from './Clue.js';
import { InstallGlobalCommands } from './utils.js';


// Get the game choices from game.js
function CreateCommandChoices(cardCategory) {
  // Retrieve the lists of options from Clue.js
  const optionsList = getOptions(cardCategory);
  const commandChoices = [];

  for (let option of optionsList) {
    commandChoices.push({
      name: option,
      value: option,
    });
  }

  return commandChoices;
}

// Simple test command for debugging
const TEST_COMMAND = {
  name: 'test',
  description: 'Is this thing on?',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Starts the game
const START_COMMAND = {
  name: 'start',
  description: 'Begins a game of CLUE!',
  type: 1,
  integration_types: [0],
  contexts: [0],
};

// Join the game of clue
const JOIN_COMMAND = {
  name: 'join',
  description: 'Join the game of CLUE!',
  type: 1,
  integration_types: [0],
  contexts: [0],
};

//Leave the game of clue
const LEAVE_COMMAND = {
  name: 'leave',
  description: 'Leave the game of CLUE!',
  type: 1,
  integration_types: [0],
  contexts: [0],
};

// Deal the cards to joined players
const DEAL_COMMAND = {
  name: 'deal',
  description: 'Join the game of CLUE!',
  type: 1,
  integration_types: [0],
  contexts: [0],
};

const BOT_COMMAND = {
  name: 'bot',
  description: 'Add a bot to the game',
  type: 1,
  integration_types: [0],
  contexts: [0],
}

// Guess the answer
const GUESS_COMMAND = {
  name: 'guess',
  description: 'Guess the answer.',
  options: [
    {
      type: 3,
      name: 'killer',
      description: 'Who did it?',
      required: true,
      choices: CreateCommandChoices("killer"),
    },{
      type: 3,
      name: 'weapon',
      description: 'Who did it?',
      required: true,
      choices: CreateCommandChoices("weapon"),
    },{
      type: 3,
      name: 'room',
      description: 'Who did it?',
      required: true,
      choices: CreateCommandChoices("room"),
    },
  ],
  type: 1,
  integration_types: [0,1],
  contexts: [0,1],
};

// Ends the game, announcing the answer and reseting the bot
const END_COMMAND = {
  name: 'end',
  description: 'End the game of CLUE',
  type: 1,
  integration_types: [0],
  contexts: [0],
};

const ALL_COMMANDS = [TEST_COMMAND, START_COMMAND, JOIN_COMMAND, LEAVE_COMMAND, DEAL_COMMAND, GUESS_COMMAND, END_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
