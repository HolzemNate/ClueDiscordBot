import 'dotenv/config';
import { DiscordRequest } from './utils.js';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {
  getResult,
  startGame,
  joinGame,
  addBot,
  leaveGame,
  dealCards,
  GAME_STATE,
  endGame
} from './Clue.js'
import { channelLink } from 'discord.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Globally scope the start-from channel as destination public channel
let PUBLIC_CHANNEL;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, member, user, channel_id, data} = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND || type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE ) {
    const { name } = data;

    // "test" command
    if (name === "test") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `hello world`,
        },
      });
    }

    // "start" command
    if (name === "start") {
      if (GAME_STATE == 0) {
        startGame();
        PUBLIC_CHANNEL = channel_id;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `A game of clue has begun! Type /join to join the game!`,
          },
        });
      } else if (GAME_STATE == 1) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `A game of clue is already in progress! Type /join to join the game!`,
          },
        });
      } else if (GAME_STATE == 2) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `A game of clue is already in progress! Please wait for the game to finish or end with /end!`,
          },
        });
      }
    }

    // "join" command
    if (name === "join") {
      // Check if there is a joinable game
      if (GAME_STATE == 1) {
        joinGame(member.user);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${member.user.username} joined the game!`,
          },
        });
      } else {
        // Send a message into the channel where command was triggered from to notify there is no game
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `There is no joinable game!`,
          },
        });
      }
    }

    // "leave" command
    if (name === "leave") {
      // Check if there is a joinable game
      if (GAME_STATE == 1) {
        // Find out if player successfully left game
        let playerLeft = leaveGame(member.user);

        if (playerLeft) {
          // Notify that player left
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `${member.user.username} left the game!`,
            },
          });
        } else {
          // Player was already not in the game
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `${member.user.username} is already not in the game!`,
            },
          });
        }
      } else {
        // Send a message into the channel where command was triggered from to notify there is no game
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `You can't leave game!`,
          },
        });
      }
    }
    // bot command
    if(name === "bot"){
      if(GAME_STATE == 1){
        addBot();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `${Bot.user.username} joined the game!`,
          },
        });
      } else {
        // Send a message into the channel where command was triggered from to notify there is no game
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `There is no joinable game!`,
          },
        });
      }
    }

    // "deal" command
    if (name === "deal") {
      // Get card assignments and player list
      let [activePlayers, publicCards] = dealCards();

      // Loop through player list to send cards
      for (
        let playerIndex = 0;
        playerIndex < activePlayers.length;
        playerIndex++
      ) {
        let thisPlayer = activePlayers[playerIndex];
        let channelResponse = await DiscordRequest("/users/@me/channels", {
          method: "POST",
          body: {
            recipient_id: thisPlayer.id,
          },
        });
        let dmChannel = await channelResponse.json();
        let message = DiscordRequest(
          "/channels/" + dmChannel.id + "/messages",
          {
            method: "POST",
            body: {
              content: `Your cards are:\n${thisPlayer.cards.join("\n")}`,
            },
          }
        );
      }

      // Send a message into the channel where command was triggered from with the public cards
      if (publicCards.length == 0) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: `Cards have been dealt! There are no publically known cards.`,
          },
        });
      }
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `Cards have been dealt! The publically known cards are: \n ${publicCards.join(
            "\n"
          )}`,
        },
      });
    }

    // "guess" command
    if (name === "guess") {
      let guessPlayer;
      if(user) {
        guessPlayer = user;
      } else {
        guessPlayer = member.user;
      }
      console.log(
        `Guessing ${data.options[0].value}, ${data.options[1].value},${data.options[2].value}`
      );
      let guessResult = getResult(
        data.options[0].value,
        data.options[1].value,
        data.options[2].value
      );
      if (guessResult) {
        // Send message to public channel
        let message = DiscordRequest(
          "/channels/" + PUBLIC_CHANNEL + "/messages",
          {
            method: "POST",
            body: {
              content: `Player ${guessPlayer.username} has guessed correctly!`,
            },
          }
        );

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Congratulations! You guessed correctly!`,
            flags: 64,
          },
        });
      } else {
        // Send message to public channel
        let message = DiscordRequest(
          "/channels/" + PUBLIC_CHANNEL + "/messages",
          {
            method: "POST",
            body: {
              content: `Player ${guessPlayer.username} has guessed incorrectly!`,
            },
          }
        );

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Oh no! You guessed incorrectly!`,
            flags: 64,
          },
        });
      }
    }

    // "end" command
    if (name === "end") {
      // Verify game is endable:
      if (GAME_STATE != 0) {
        let [ ansSuspect, ansWeapon, ansRoom ] = endGame();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: `The game has been ended! \nThe Answer was ${ansSuspect} with the ${ansWeapon} in the ${ansRoom}!`,
          },
        });
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: `There is no game to end!`,
          },
        });
      }
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: "unknown command" });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
