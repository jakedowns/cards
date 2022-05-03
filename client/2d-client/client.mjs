import ClientAPI from './client-api.mjs';
import * as Config from './client-config.mjs'
import * as Helpers from '../../shared/helpers.mjs';
import * as Animation from './client-animation.mjs';
import DynamicRenderer from './components/DynamicRenderer.mjs';
import Card from './objects/Card.mjs';
// todo move this to shared
import {STARTER_DECK_OPTIONS} from '../../server/decks/welcome.deck.mjs'
class Client {
    constructor(){
        this.api = new ClientAPI(this);
        this.api.init();

        let _client = this;

        this.app = Vue.createApp({
            mounted(){
                console.warn('todo: add browser history api integration for navigation')
                console.warn('todo: add player select when no player is active AND there\'s at least one player in the db')
                console.warn('todo: add ability to drag cards from hand to stack')
            },
            components: {
                DynamicRenderer
            },
            data(){
                return {
                    state: {
                        loading:true
                    },
                }
            },
            methods: {

                print(thing){
                    console.log(JSON.stringify(thing,null,2));
                },

                setCard(card_name, property, value){
                    // TODO: should we ALSO set it in this.state.decks?
                    let deck = this.state.player.hands[this.state.player.active_hand];
                    // allows passing an object to merge
                    if(typeof property === 'object'){
                        // deck.cards[card_name] = {
                        //     ...deck.cards[card_name],
                        //     ...property // object of properties to set
                        // };
                        for(let key in property){
                            deck.cards[card_name][key] = property[key];
                        }
                        return;
                    }
                    // single property setter
                    deck.cards[card_name][property] = value;
                },

                act(action){
                    console.log('ACT!',action);
                    switch(action?.name){
                        case 'nextCard':
                            this.nextCard();
                            break;
                        case 'prevCard':
                            this.prevCard();
                            break;
                        case 'goToCard':
                            this.goToCard(action?.card)
                            break;
                        case 'focusDeck':
                            this.focusDeck(action);
                            break;
                        case 'selectDeckType':
                            let deck_name = document.querySelector('.card.focused select[name="deck"]').value;
                            console.warn('todo save deck type to db',{name:this.active_hand.name,type:deck_name});
                            let card_id = null;
                            let i = 0;
                            while(!card_id && i<this.active_hand.card_order.length){
                                let _card_id = this.active_hand.card_order[i];
                                let _card = this.active_hand.cards[_card_id];
                                console.log({_card})
                                if(_card?.front?.text === 'Pick Deck Type'){
                                    card_id = _card_id;
                                }
                                i++;
                            }
                            this.removeCardFromDeck(card_id, this.active_hand.id)
                            this.goToCard(this.active_hand.card_order[0]);
                            break;
                        case 'createCardFromInput':
                            this.createCardFromInput(action);
                            break;
                        case 'createDeckAndFocus':
                            if(this.player.focused_card === 'setup2'){
                                // this is our main "create deck" card
                                let deck_name = document.querySelector('.card.focused select[name="deck"]').value;
                                this.createDeckAndFocus(deck_name);
                            }else{
                                this.createDeckAndFocus(action?.deck);

                            }
                            break;
                        default:
                            console.warn('unknown action',action);
                            break;
                    }
                },

                async createCardFromInput(e){
                    let card_name = document.querySelector('.card textarea[name="card_name"]').value;
                    let card_id = this.createCard(card_name);

                    // move into second stack
                    // HAND > stacks > 1 (primary)
                    //      > stacks > 2
                    this.active_hand.cards[card_id].stack = 2;
                    this.flipCard(card_id,true)
                    document.querySelector('.card textarea[name="card_name"]').value = '';
                    document.querySelector('.card textarea[name="card_name"]').focus();
                },

                removeCardFromDeck(card_id, deck_id){
                    console.log('removeCardFromDeck',card_id,deck_id);
                    // delete this.state.player.hands[this.state.player.active_hand].cards[card_id];
                    // for now, just remove from card_order/hand_order, but keep the card in the cards object
                    let indexCardOrder = this.active_hand.card_order.indexOf(card_id);
                    if(indexCardOrder > -1){
                        this.active_hand.card_order.splice(indexCardOrder,1);
                    }
                    let indexHandOrder = this.active_hand.hand_order.indexOf(card_id);
                    if(indexHandOrder > -1){
                        this.active_hand.hand_order.splice(indexHandOrder,1);
                    }

                },

                // for decluttering the deck-list
                putAwayDeck(deck_name){
                },
                getOutDeck(deck_name){

                },

                createCard(card_name,deck_id){
                    console.log('creating card!',{card_name});
                    deck_id = deck_id ?? this.player.active_hand
                    let deck = this.player.hands[deck_id]
                    let card_id = "id"+performance.now();
                    deck.card_order.unshift(card_id);
                    deck.hand_order.unshift(card_id);
                    const BASIC_CARD = {
                        id: card_id,
                        flipped: false,
                        deck_name: deck_id,
                        front: {
                            text: card_name
                        },
                        player_id: this.player.id,
                        instance: new Card(card_id)
                    }
                    if(card_name === 'Create Card'){
                        deck.cards[card_id] = {
                            ...BASIC_CARD,
                            ...{
                                inputs: [
                                    {
                                        type: 'textarea',
                                        name: 'card_name',
                                        placeholder: 'Card Title...',
                                    }
                                ],
                                actions: [
                                    {
                                        name: 'createCardFromInput',
                                        label: 'create card'
                                    }
                                ],
                                attributes:[
                                    'createCard',
                                ],
                            }
                        }
                        deck.cards[card_id].instance.onFlip = ()=>{
                            console.log('custom on flip function?');
                            document.querySelector('textarea[name="card_name"]').focus();
                        }
                    }else if(card_name === 'Pick Deck Type'){
                        deck.cards[card_id] = {
                            ...BASIC_CARD,
                            ...{
                                inputs: [
                                    {
                                        label: 'deck',
                                        type: 'select',
                                        name: 'deck',
                                        options: STARTER_DECK_OPTIONS,
                                        required: true
                                    }
                                ],
                                actions: [
                                    {
                                        name: 'selectDeckType',
                                        label: 'next'
                                    }
                                ],
                                attributes:[
                                    'deckTypeSelector',
                                ],
                            }
                        }
                    }else{
                        deck.cards[card_id] = {
                            ...BASIC_CARD,
                            ...{
                                stack: 2,
                            }
                        }
                    }
                    return card_id;
                },

                createDeckAndFocus(deck_name){
                    let id = this.createDeck(deck_name);
                    this.focusDeck(id);
                },

                createDeck(deck_name){
                    console.log('creating a new deck', deck_name);
                    // todo await this.api.createDeck(deck_name);
                    // for now, just stub it in
                    let deck_id = "id"+performance.now();
                    this.player.hands[deck_id] = {
                        id: deck_id,
                        player_id: this.player.id,
                        hand_order: [],
                        card_order: [],
                        cards: {},
                        name: deck_name,
                    }

                    let second_card = this.createCard('Create Card',deck_id);
                    let first_card = this.createCard('Pick Deck Type',deck_id);
                    this.player.hands[deck_id].cards[first_card].flipped = true;

                    this.goToCard(first_card);

                    return deck_id;
                },

                async focusDeck(deck_name){
                    console.log('focusing deck',{deck_name});
                    this.player.active_hand = deck_name;
                    this.player.focused_deck = deck_name;
                    // TODO: add a default card, a Create Card card.
                    let deck = this.player.hands[deck_name];
                    this.player.focused_card = deck.card_order[0];
                },

                // aka Focus card?
                async goToCard(card_name, deck_name){

                    console.log('goToCard',card_name);
                    console.warn('if current card had inputs need to make sure user is ok with losing them');
                    console.warn('if current card is required, block user from leaving card');
                    if(!deck_name){
                        deck_name = this.state.player.active_hand;
                    }
                    let deck = this.player.hands?.[deck_name];
                    let card = deck.cards[card_name];
                    if(!card){
                        console.warn('card not found',card_name,deck_name);
                        return;
                    }

                    let card_index = deck.hand_order.indexOf(card_name);
                    if(card_index === -1){
                        console.error('card not found in hand_order');
                        c.app.print([deck.hand_order, deck.card_order, card_name]);
                    }
                    // if card is on top just flip it over
                    if(card_index === 0){
                        this.flipCard(card_name,true);
                    }else{
                        // flip top card face down
                        //this.flipCard(this.player.focused_card, false)
                        this.topCardToBack();

                        if(card_index > 1){
                            // animate selected card out of the deck to the top
                            await this.animateCard(card_name, Animation.OutRightAndFront);
                        }else{
                            this.flipCard(card_name,true);
                        }
                    }


                    // "select" the new card
                    this.setPlayerFocusedCard(card_name);

                    // update our "hand order" (z-index order)
                    const hand_order_next = this.player.hands[
                        this.player.active_hand
                    ].hand_order.slice();
                    if(hand_order_next.indexOf(card_name) === -1){
                        console.warn('card not found in hand_order', card_name, hand_order_next);
                    }
                    Helpers.arraymove(
                        hand_order_next,
                        hand_order_next.indexOf(card_name),
                        0
                    );
                    this.setPlayerHandOrder(hand_order_next)
                    // console.log('hand_order_next',hand_order_next,this.player.focused_card);
                    // this.setPlayerFocusedDeck(deck_name);
                    // this.setCard(card_name, 'flipped', false);
                    // this.setCard(card_name, 'z-index', deck.cards.length);
                },

                onCardSubmit(event){
                    if(event.shiftKey){
                        return;
                    }
                    if(this.focused_card?.front?.text === 'Create Card'){
                        this.createCardFromInput(event);
                        return;
                    }

                    // TODO: make this a generic handler // or add some definitions at the card level
                    // TODO: v-model binding too
                    console.log('onCardSubmit TODO! validate and write to db!',event);
                    // TODO: bind inputs to v-model (slight chance that .value won't be able to be fetched)
                    // since front of card is wrapped in v-if, it could disappear from dom
                    let val = document.querySelector('.card.focused input[name="player name"]').value;
                    this.state.player.name = val;
                    console.log('SAVED PLAYER NAME',{val});
                    this.nextCard();
                },

                async flipCard(card_name, flipped_next){
                    if(!card_name){
                        card_name = this.state.player.focused_card
                    }
                    let card = this.cardFromDeck(card_name);
                    let state_next = !card.flipped
                    if(typeof flipped_next !== "undefined"){
                        state_next = flipped_next
                    }

                    console.log('flip card', {
                        card_name,
                        flipped_next,
                        state_next
                    });

                    await this.animateCard(card_name, Animation.flip(flipped_next))

                    card.instance.onFlip();
                },

                async nextCard(){
                    window.blur();
                    let card = this.focused_card;
                    if(card?.inputs?.length){
                        console.warn('validate inputs here');
                    }


                    // flip over before moving top card
                    // await this.topCardToBack();
                    this.topCardToBack();

                    const hand_order_next = this.player.hands[
                        this.player.active_hand
                    ].hand_order.slice();

                    // todo: animate card going off to one side, then back behind

                    // move focused card to the back of the deck.
                    Helpers.arraymove(
                        hand_order_next,
                        hand_order_next.indexOf(this.player.focused_card),
                        hand_order_next.length-1
                    );

                    this.setPlayerHandOrder(hand_order_next)

                    // set top card as focused card
                    this.setPlayerFocusedCard(hand_order_next[0]);

                    // await Helpers.delay(Config.CARD_FLIP_TIME);

                    // flip over top card
                    card = this.cardFromDeck(this.player.focused_card);
                    card.instance.flip(true);
                },

                async topCardToBack(skip_flip = false){
                    const card_name = this.player.focused_card;
                    // let card = this.cardFromDeck(card_name);
                    // if(!skip_flip){
                        // un-flip it (make face down)
                        // card.instance.flip(false);
                    // }
                    // let card = this.cardFromDeck(card_name);

                    // animate the card being pulled off to the left
                    // then drop it's z-index to the back of the deck
                    // TODO: need a way to manage z-indexes in a stack
                    // TODO: encapsulate this into a repeatable animation
                    // card.animations.outLeftAndBack()
                    // card.animate([
                    await this.animateCard(card_name,Animation.OutLeftAndBack);

                    // TODO: shift z-indexes for all cards in the deck

                },

                // does it make sense to put an Animate() function on Every Card instance?
                // or better to just have a global one here.. >_>
                async animateCard(card_name, animation){
                    return Animation.animateCard(card_name, animation);
                },

                setPlayerFocusedCard(card_name){
                    this.state.player.focused_card = card_name;
                },

                setPlayerHandOrder(hand_order_next, hand_name){
                    hand_name = hand_name ?? this.player.active_hand;
                    this.state.player.hands[hand_name].hand_order = hand_order_next;
                },

                // TODO: if(card?.canFlip)
                onClickCardBack(card_name){
                    let card = this.cardFromDeck(card_name);
                    if(!card?.flipped){
                        // flip it over
                        card.instance.flip(true);
                    }
                },

                getPlayer(player_id){
                    let found = null;
                    let i = 0;
                    while(!found && i<this.state.players.length){
                        if(this.state.players[i].id === player_id){
                            found = this.state.players[i];
                        }
                        i++;
                    }
                    return found;
                }
            },
            computed: {
                active_hand(){
                    return this.state?.player?.hands?.[
                        this?.state?.player?.active_hand
                    ];
                },
                // focused_deck(){
                //     return this.active_hand;
                // },
                focused_card(){
                    return this?.active_hand?.cards?.[this?.player?.focused_card];
                },
                cardFromDeck(){
                    return (card_name, deck_name) => {
                        deck_name = deck_name ?? this.state?.player?.active_hand
                        let card = this.state
                            ?.player
                            ?.hands
                            ?.[deck_name]
                            ?.cards
                            ?.[card_name];

                        // TODO: generate a Card class for each card
                        // when cloning deck of cards to player's hand
                        // temp: stub in prototype method on the object
                        /*
                        if(!card.animate){
                            console.warn('TODO: add card.animate here');
                            card.__proto__.animate = async (animation)=>{
                                console.log('animate',animation);
                                for(let i = 0; i < animation.length; i++){
                                    let anim = animation[i];
                                    debugger;
                                    card.classnames = anim?.classnames ?? {};
                                    card.style = anim?.style ?? {}
                                    card = {...card, ...(anim?.properties ?? {})};
                                    console.log(this.print(card));
                                    await Helpers.delay(anim.duration);
                                }
                            }
                        }
                        */
                        return card
                    }
                },
                player(){
                    return this?.state?.player ?? {}
                },
                actions(){
                    return this?.state?.actions ?? {}
                },
                currentTheme(){
                    return this.state.themes[this.state.player.active_theme] ?? 'default';
                },

                tableTopStyle(){
                    return this.currentTheme.tableTopStyle
                },

                cardStyle(){
                    return this.currentTheme.cards.globalStyle
                },

                cardFrontStyle(){
                    return {
                        ...this.currentTheme.cards?.frontStyle,
                        ...{
                            borderRadius: this.currentTheme.cards.globalStyle.borderRadius
                        }
                    }
                },

                cardBackStyle(){
                    return {
                        ...this.currentTheme.cards.backStyle,
                        ...{
                            borderRadius: this.currentTheme.cards.globalStyle.borderRadius
                        }
                    }
                },

                cardActionsStyle(){
                    return {
                        flexDirection: this.focused_card?.actions?.length > 3 ? 'column' : 'row',
                    }
                },

                cardActionStyle(){
                    let flexBasis = '100%';
                    if(this.focused_card?.actions?.length <= 3){
                        flexBasis = this.focused_card.actions?.length / 1 + '%';
                    }
                    return {
                        flexBasis
                    }
                }
            },
        }).mount('#app')
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    window.c = new Client();
})