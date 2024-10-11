export function getResult(Suspect, Weapon, Room) {
  let gameResult;
  if (Suspect == ChosenSuspect && Weapon == ChosenWeapon && Room == ChosenRoom) {
    //win
    gameResult = 'You Win'
  } 
  else {
    // lose
    gameResult = 'wrong answer dumbass'
  }

  return gameResult;
}

// this is just to figure out winner + verb
const Suspects = ['Colonel Mustard','Professor Plum','Reverend Green','Mrs Peacock','Miss Scarlet','Mrs White'];
const Weapons = ["Knife","Candlestick","Revolver","Rope","Lead Pipe",'Wrench'];
const Rooms = ["Hall","Lounge","Dining Room","Kitchen","Ballroom",'Conservatory','Billiard room','Library','Study'];
let ChosenRoom;
let ChosenSuspect;
let ChosenWeapon;

export let JOINABLE = false;
let playerList = [];

// Used to populate the guess command choices
export function getOptions(cardCategory) {
  // Takes a category parameter to return relevant choices
  switch(cardCategory) {
    case "room":
      return Rooms;
      break;
    case "weapon":
    return Weapons;
      break;
    case "killer":
      return Suspects;
      break;
  }
}

export function getCardChoices() {
  let min = 0;
  let max = Rooms.length;
  let i = Math.floor(Math.random() * (max - min + 1) + min);
  ChosenRoom = Rooms[i];

  max = Weapons.length;
  i = Math.floor(Math.random() * (max - min + 1) + min);
  ChosenWeapon = Weapons[i];

  max = Suspects.length;
  i = Math.floor(Math.random() * (max - min + 1) + min);
  ChosenSuspect = Suspects[i];

}

export function getPlayerCards(){
  let numPlayers = playerList.length;

  let AllCards = [...Suspects,...Rooms,...Weapons];
  
  AllCards.splice(AllCards.indexOf(ChosenRoom),1);
  AllCards.splice(AllCards.indexOf(ChosenSuspect), 1);
  AllCards.splice(AllCards.indexOf(ChosenWeapon), 1);

  let NumExtraCards = AllCards%numPlayers;
  let ExtraCards = [];
  for (let index = 0; index < NumExtraCards; index++) {
    i = Math.floor(Math.random() * (max - min + 1) + min);
    ExtraCards[index] = AllCards[i];
    AllCards.splice(i,1);
  }
  let min = 0;
  let numCards = AllCards.length / playerList.length;
  for (let index = 0; index < playerList.length; index++) {
    let player = playerList[index];
    player.cards = [];
    while (player.cards.length <= numCards) {
      let max = AllCards.length;
      let i = Math.floor(Math.random() * (max - min + 1) + min);
      // Append card string to player object and removes it from AllCards
      player.cards.push(AllCards.splice(i,1))
    }
  }
  return ExtraCards;
}

// Invoked on usage of the "start" command
export function startGame() {
  JOINABLE = true;
  playerList = [];
}

// Invoked on usage of the "join" command
export function joinGame(user) {
  // Check if player already joined
  if (playerList){
    if (playerList.includes(user)) {
    return false
  }
  }
  // Add the player
  playerList.push(user);
  return true
}

// Invoked on usage of the "leave" command
export function leaveGame(user) {
  // Check if player is in the game
  if (playerList.includes(user)) {
    //If so, remove the player
    playerList = playerList.filter((item) => item !== user)
    return true
  }
  return false
}

// Invoked on usage of the "deal" command
export function dealCards() {
  // Stop new players from joining
  JOINABLE = false;

  // Deal Cards Code
  getCardChoices();

  let publicCards = getPlayerCards();

  // Return playerList
  return [playerList, publicCards];

}
