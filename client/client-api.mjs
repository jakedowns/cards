class ClientAPI {
    constructor(client){
        this.client = client;
        this.state = {
            loading: true
        }
    }

    init(){
        this.getInitialState().then(state => {
            this.state = state?.data ?? {error: state};
            this.state.loading = false;
            if(!this.state.player.active_hand){
                this.state.player.hands = {
                    welcome: {...this.state.decks.welcome}
                };
                this.state.player.hands.welcome.hand_order
                    = [...this.state.decks.welcome.card_order];
                this.state.player.active_hand = 'welcome';
            }
            this.client.app.state = this.state;
        }).catch(err => {
            this.state = {error:err}
        })
    }

    getInitialState(){
        return axios.get('/api/state');
    }
}

export default ClientAPI;