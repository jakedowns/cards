import Card from './objects/Card.mjs'
import * as Helpers from '../shared/helpers.mjs'
class ClientAPI {
    constructor(client){
        this.client = client;
        this.state = {
            loading: true
        }
    }

    init(){
        this.getInitialState().then(async (state) => {
            this.state = state?.data ?? {error: state};
            this.state.loading = false;

            // todo: move this into client.mjs
            if(!this.state.player.active_hand){
                this.state.player.hands = {
                    welcome: {...this.state.decks.welcome}
                };
                this.state.player.hands.welcome.hand_order
                    = [...this.state.decks.welcome.card_order];
                for(let card_name of this.state.player.hands.welcome.hand_order){
                    this.state.player.hands.welcome.cards[card_name] = {
                        ...this.state.decks.welcome.cards[card_name],
                        ...{
                            name: card_name,
                            deck_name: 'welcome',
                            player_id: this.state.player.id,
                            flipped: false, // default face-down
                            classnames: {
                                'position-stacked': true
                            },
                            instance: new Card(card_name)
                        }
                    }
                }
                this.state.player.active_hand = 'welcome';
            }else{
                for(let hand_name of Object.keys(this.state.player.hands)){
                    for(let card_id of this.state.player.hands[hand_name].hand_order){
                        this.state.player.hands[hand_name].cards[card_id] = {
                            ...this.state.player.hands[hand_name].cards[card_id],
                            ...{
                                name: card_id,
                                deck_name: hand_name,
                                player_id: this.state.player.id,
                                // flipped: false, // default face-down
                                // classnames: {
                                //     'position-stacked': true
                                // },
                                instance: new Card(card_id)
                            }
                        }
                    }
                }
            }
            this.client.app.state = this.state;
            await Helpers.delay(100);
            this.client.app.flipCard('welcome',true);
        }).catch(err => {
            this.state = {error:err}
        })
    }

    getInitialState(){
        return axios.get('/api/state');
    }
}

export default ClientAPI;