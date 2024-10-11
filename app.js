import 'dotenv/config';
import { DiscordRequest } from './utils.js';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {
  startGame,
  joinGame,
  leaveGame,
  dealCards,
  JOINABLE
} from './Clue.js'

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, member, data } = req.body;

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
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
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
    if (name === 'start') {
      // Make game joinable and reset variables
      startGame();
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `A game of clue has begun! Type /join to join the game!`,
        },
      });
    }

    // "join" command
    if (name === 'join') {
      // Check if there is a joinable game
      if( JOINABLE ) {
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
    if (name === 'leave') {
      // Check if there is a joinable game
      if( JOINABLE ) {
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

    // "deal" command
    if (name === 'deal') {
      // Get card assignments and player list
      let [ activePlayers, publicCards ] = dealCards();

      // Loop through player list to send cards
      for (let playerIndex = 0; playerIndex < activePlayers.length; playerIndex++) {
        let thisPlayer = activePlayers[playerIndex];
          let channelResponse = await DiscordRequest("/users/@me/channels", 
          {
            method: 'POST',
            body:{
              recipient_id: thisPlayer.id
            }
          })
          let dmChannel = await channelResponse.json();
          console.log(dmChannel);
          console.log('/channels/' + dmChannel.id + '/messages');
          let message = DiscordRequest('/channels/' + dmChannel.id + '/messages', 
          {
            method: 'POST',
            body:{
              content: `Your cards are: ${thisPlayer.cards.toString()}`
            }
          });
        }

      // Send a message into the channel where command was triggered from with the public cards
      console.log(publicCards)
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `The publically known cards are: ${publicCards.toString()}`,
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
