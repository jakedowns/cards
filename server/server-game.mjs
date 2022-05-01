import {
    performance
} from 'perf_hooks';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class ServerGame{
    constructor(){
        this.clients = {};
        this.rooms = {};
        this.games = {
            default:{
                started:false,
            }
        };
        this.game_host = null;
        this.rounds = {};
        this.cards = [];
        this.zones = [];
        this.available_cards = [];
        this.flipped = [];
        this.player_turn = null;
        this.match_checks = [];

        // heartbeat
        this.ping_interval = setInterval(()=>{
            this.ping();
        },1000);

        // create a default room for now
        this.rooms.default = {
            players: [], // client ids
            scene: {
                camera: {
                    type: 'PerspectiveCamera', // todo use consts
                    fov: 60,
                    aspect: 1,
                    near: 0.1,
                    far: 1000,
                    position: {
                        x: 0,
                        y: 10,
                        z: -1.5
                    }
                },
                lights: {
                    ambient: {
                        color: 0xffffff,
                        intensity: 0.4
                    },
                    directional: {
                        color: 0xcceeff,
                        intensity: 0.9,
                        castShadow: true,
                        shadow: {
                            mapSize: {
                                width: 1024,
                                height: 1024
                            }
                        },
                        position: {
                            x: 5,
                            y: 5,
                            z: 5
                        }
                    }
                },
                tabletop: {

                },

            }
        }
    }

    onClientJoin(client_id,ws){
        this.clients[client_id] = {
            id: client_id,
            public_id: client_id, // todo public id vs. private id
            // otherwise players could impersonate other players
            ws,
            hand: [],
        }
        if(!this.room_id){
            this.newRoomGameRound(client_id);
        }
        console.warn('add player to Room');
        ws.send(JSON.stringify({
            message: 'WELCOME',
            your_client_id: client_id
        }))
        this.notifyAllClients({
            message:"NEW_CLIENT_CONNECTED",
            new_client_id:client_id
        });
    }

    onClientLeave(client_id){
        console.log('client disconnected',client_id)
        delete this.clients?.[client_id];
    }

    onClientMessage(client_id,message){
        message = ''+message;
        console.log('client says',client_id,message)
        let decoded = null;
        try{
            decoded = JSON.parse(message);
        }catch(e){
            console.error(e)
        }
        // todo verify they match
        console.log('todo:validate client request matches',{req_client_id:decoded.client_id,server_client_id:client_id})
        switch(decoded.type){
            // case 'NEW_ROOM':
            //     this.newRoomGameRound(client_id)

            //     break;


            case 'JOIN_ROOM':
                if(!this.rooms[decoded?.room_id]){
                    this.notifyClient(client_id,{
                        message:'ROOM_JOIN_ERROR',
                    });
                    return;
                }
                this.rooms[decoded?.room_id]?.players?.push(client_id);

                this.notifyClient(client_id,{
                    message:'ROOM_JOIN_SUCCESS',
                });
                break;

            case 'NEW_GAME':
                this.notifyClient(client_id,{
                    message:'GAME_CREATE_SUCCESS',
                });
                break;

            case 'START_GAME':
                this.notifyClient(client_id,{
                    //message:'GAME_START_SUCCESS',
                    message:'GAME_STATE_UPDATE',
                    state: {
                        //game_id: decoded.game_id,
                        game: {started: true},
                        round: {started: false},
                        scores: {},
                        flipped: []
                    }
                });
                break;

            case 'FLIP':
                //this.games[this.game_id].flipped.push(decoded.card_id);
                this.flipped.push(decoded.card_id);
                this.checkForMatch();


                break;
            //case 'RESET_FLIPPED':
            //    break;
        }
    }

    async checkForMatch(){
        if(this.flipped.length > 1){
            let cardA = this.cards[this.flipped[0]];
            let cardB = this.cards[this.flipped[1]];
            if(cardA.pair_id === cardB.pair_id){
                console.log('match found');
                this.flipped = [];
                this.match_checks.push({
                    player:this.player_turn,
                    pass: true,
                    pair_id:cardA.pair_id
                })

                cardA.zone = null;
                cardA.player_id = this.player_turn;

                cardB.zone = null;
                cardB.player_id = this.player_turn;

                // TODO: pluck out of available cards
                // TODO: move pair to player's hand
                this.clients[this.player_turn].hand = [...this.clients[this.player_turn].hand, ...this.flipped];
            }else{
                console.log('not a match');
                // todo delay
                await delay(1000);
                this.flipped = [];
                this.ignore_clicks = false;
                this.match_checks.push({
                    player:this.player_turn,
                    pass: false,
                })
                let client_ids = Object.keys(this.clients);
                // switch player turn
                this.player_turn = this.player_turn === client_ids[0] ? client_ids[1] : client_ids[0];
            }
        }
    }

    onClientError(client_id,error){
        console.error(client_id,'client_error',error)
    }

    // TOOD
    // notifyRoomClients()
    // notifyGameClients()

    notifyAllClients(message){
        for(let client_id in this.clients){
            this.notifyClient(client_id,message);
        }
    }

    notifyClient(client_id,message){
        // todo: error if no client matches id
        this.clients?.[client_id]?.ws?.send(JSON.stringify(message))

    }

    ping(){
        let client_hands = {};
        for(let a in this.clients){
            let client = this.clients[a];
            client_hands[a] = client.hand;
        }
        this.notifyAllClients({
            message:'PING',
            time: performance.now(),
            state: {
                client_ids: Object.keys(this.clients),
                client_hands,
                game_id: this?.game_id,
                game: this.games?.[this?.game_id],
                round_id: this?.round_id,
                round: this.rounds?.[this?.round_id],
                cards: this.cards,
                available_cards: this.available_cards,
                //flipped: this.games?.[this?.game_id]?.flipped,
                flipped: this.flipped,
                player_turn: this.player_turn
            }
        })
    }

    newRoomGameRound(client_id){
        let new_room_id = "room_"+performance.now();
        this.room_id = new_room_id;

        let new_game_id = "game_"+performance.now();
        this.game_id = new_game_id;

        let new_round_id = "round_"+performance.now();
        this.round_id = new_round_id;

        this.rooms[new_room_id] = {
            players: Object.keys(this.clients),
        }

        this.game_host = client_id;
        this.player_turn = client_id;

        this.games[new_game_id] = {
            started: true,
            //flipped: [],
        }

        this.rounds[new_round_id] = {
            started: true,
        }

        for(var i=0; i<(4*4); i++){
            this.cards.push({
                index: i,
                deck_order_index: i,
                face_up: false,
                pair_id: i % 2 === 0 ? i : i-1,
            });
            this.available_cards.push(i);
        }

        this.available_cards = this.shuffleOnce(this.available_cards);

        for(let i in this.cards){
            let card = this.cards[i];
            card.deck_order_index = this.available_cards.indexOf(i);
            card.zone = i;
        }

        // ping will broadcast
        // this.notifyClient(client_id,{
        //     message:'ROOM_CREATE_SUCCESS',
        //     room_id:new_room_id,
        //     game_id:new_game_id,
        //     round_id:new_round_id
        // })
    }

    shuffleDeck(){
        console.log('shuffleDeck');
    }

    shuffleOnce(array){
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // snapshot the array
            //this.available_cards_history.push(array.slice());

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;

            this.cards[array[m]].deck_order_index = m;
            this.cards[array[i]].deck_order_index = i;

            // animate the shuffled cards coming off the top
            // and sliding back into the deck
            // this.animateOrderChangeAsShuffle(
            //     array[i],
            //     array[m],
            //     i,
            //     m
            // );
            // artificially delay the shuffling
            // await delay(3);
        }


        return array;
    }
}


export default ServerGame