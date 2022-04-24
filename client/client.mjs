import ClientAPI from './client-api.mjs';

function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

async function delay(time){
    return new Promise(resolve => {
        setTimeout(resolve,time);
    });
}

class Client {
    constructor(){
        this.api = new ClientAPI(this);
        this.api.init();

        let _client = this;

        this.app = Vue.createApp({
            data(){
                return {
                    state: {
                        loading:true
                    },
                    message: 'Hello Girl' // hello world
                }
            },
            methods: {
                setCard(card_name, property, value){
                    this.state.decks[this.state.player.focused_deck].cards[card_name][property] = value;
                },
                act(name){
                    console.log('ACT! action name:',name);
                    if(name === 'nextCard'){
                        this.nextCard();
                    }
                },
                async nextCard(){
                    // flip over before moving top card
                    this.flipCard(this.player.focused_card,false);

                    await delay(500);

                    const hand_order_next = this.player.hands[
                        this.player.active_hand
                    ].hand_order.slice();

                    // todo: animate card going off to one side, then back behind

                    // move focused card to the back of the deck.
                    arraymove(
                        hand_order_next,
                        hand_order_next.indexOf(this.player.focused_card),
                        hand_order_next.length-1
                    );

                    this.setPlayerHandOrder(hand_order_next)

                    // set top card as focused card
                    this.setPlayerFocusedCard(hand_order_next[0]);

                    await delay(500);

                    // flip over top card
                    this.flipCard(this.player.focused_card,true)
                },
                flipCard(card_name, flipped_next){
                    let state_next = !this.cardFromDeck(card_name).flipped
                    if(typeof flipped_next !== "undefined"){
                        state_next = flipped_next
                    }
                    this.setCard(card_name,
                        'flipped',state_next);
                },
                setPlayerFocusedCard(card_name){
                    this.state.player.focused_card = card_name;
                },
                setPlayerHandOrder(hand_order_next, hand_name){
                    hand_name = hand_name ?? this.player.active_hand;
                    this.state.player.hands[hand_name].hand_order = hand_order_next;
                }
            },
            computed: {
                active_hand(){
                    return this.state?.player?.hands?.[
                        this?.state?.player?.active_hand
                    ];
                },
                focused_deck(){
                    return this.state.decks?.[this.state.player.focused_deck];
                },
                cardFromDeck(){
                    return (card_name, deck_name) => {
                        deck_name = deck_name ?? this.state?.player?.focused_deck
                        return this.state
                            ?.player
                            ?.hands
                            ?.[deck_name]
                            ?.cards
                            ?.[card_name];
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
                }
            }
        }).mount('#app')
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    window.c = new Client();
})