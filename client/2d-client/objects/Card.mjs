import * as Config from '../client-config.mjs'
import * as Helpers from '../../shared/helpers.mjs';

class Card {

    constructor(card_name){
        this.name = card_name
    }

    get state(){
        return c.app.cardFromDeck(this.name);
    }

    setState(property, value){
        c.app.setCard(this.name, property, value)
    }

    async flip(flipped_next){
        return c.app.flipCard(this.name, flipped_next);
    }

    get deck(){
        return c.app.decks?.[this.state.deck_name];
    }

    get hand(){
        return c.app.player?.hands?.[this.state.deck_name];
    }

    get player(){
        return c.app.getPlayer(this.state.player_id);
    }

    // get table(){
    //     // get containing table
    // }

    // get author(){
    //     return this.state.author ?? 'system';
    // }

    // computed Getter
    get zIndex(){
        return this.hand.hand_order.length - this.hand.hand_order.indexOf(this.name);
    }

    canFlip(){
        // todo: check if card is at the top of it's containing stack
        return c.app.player.focused_card === this.name && !this.state.flipping;
    }

    onFlip(){
        if(this.state.flipped){
            // revealed
            if(this.state?.inputs?.length){

                let first_input = this.state.inputs[0];
                console.log('todo focus first input',first_input);
                document.querySelector(`.card.focused input[name="${first_input.name}"]`)?.focus()

            }else if(this.state?.actions?.length){

                document.querySelectorAll(`.card.focused .actions .action`)[this.state.actions.length-1]?.focus()
            }
        }
    }

    extraClassnames(){
        let cx = {};
        let stack_id = `stack-${this.state?.stack ?? 1}`
        cx[stack_id] = true;
        return cx
    }
}

export default Card