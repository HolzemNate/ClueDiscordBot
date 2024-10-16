export class BotPlayer {
    constructor(){
        this.bot = true;
        this.cards = [];
        this.allGameCards = [
            'Colonel Mustard','Professor Plum','Reverend Green','Mrs Peacock','Miss Scarlet','Mrs White',
            "Knife","Candlestick","Revolver","Rope","Lead Pipe",'Wrench',
            "Hall","Lounge","Dining Room","Kitchen","Ballroom",'Conservatory','Billiard room','Library','Study'
        ];
    }

    checkCards(cardArray){
        let overlap = this.cards.filter(element => cardArray.includes(element));
        if(overlap.length > 0) {
            let index = Math.floor(Math.random() * overlap.length);
            return overlap[index];
        } else {
            return false
        }
    }
}

export class LiarBot extends BotPlayer {
  constructor() {
    super();
  }

    // Unique to liar. Tell the opposite of the truth
    checkCards(cardArray) {
        // First say NO if any of the mentioned cards are present.
        let overlap = this.cards.filter((element) => cardArray.includes(element));
        if (overlap.length > 0) {
        return false;
        } else {
            // Otherwise, if NONE of the cards are owned by the bot, name a random card from the game that is NOT in this bots deck
            let otherCards = this.allGameCards.filter((element) =>
            !cardArray.includes(element));
            let index = Math.floor(Math.random() * otherCards.length);
        return otherCards[index];
        }
    }
}