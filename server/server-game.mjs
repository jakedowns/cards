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

        // TODO: nest these under games[]
        this.cards = [];
        this.zones = [];
        this.available_cards = [];
        this.flipped = [];
        this.hovered = [];
        this.player_turn = null;
        this.match_checks = [];
        this.player_cursors = {};
        this.ignore_clicks = false;
        this.player_hands = {};
        this.player_heads = {};

        // heartbeat
        this.ping_interval = setInterval(this.ping.bind(this),256);

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
        // add player to room
        const room = this.rooms[this.room_id];
        room.players.push(client_id);
        this.player_cursors[client_id] = {x:0,y:0,z:0};
        this.player_hands[client_id] = [];
        this.player_heads[client_id] = [];
        const player_or_spectator = room.players.length <= 2 ? 'player' : 'spectator';
        console.log('players?',room.players.length)
        if(room.players.indexOf(room.player_turn) === -1){
            room.player_turn = room.players[0];
        }
        this.notifyClient(client_id,{
            type: 'WELCOME',
            your_client_id: client_id,
            player_or_spectator,
        })
        // this.notifyAllClients({
        //     type:"NEW_CLIENT_CONNECTED",
        //     new_client_id:client_id,
        //     player_or_spectator
        // });
    }

    onClientLeave(client_id){
        console.log('client disconnected',client_id)
        delete this.clients?.[client_id];
        delete this.player_hands?.[client_id];
        delete this.player_heads?.[client_id];

        // todo: get room(s) for player and loop
        const room = this.rooms[this.room_id];

        // remove from room
        let room_player_index = room.players.indexOf(client_id);
        if(room_player_index>-1){
            room.players.splice(room_player_index,1);
        }
        console.log('clients remaining',Object.keys(this.clients).length);
        console.log('room.players remaining',room.players.length);
        // if player was host, change host to next remaining player in room
        if(room.game_host === client_id){
            if(room.players.length){
                // assign new host
                room.game_host = room.players[0];
                // make it this players turn
                if(room.players.indexOf(room.player_turn) === -1){
                    room.player_turn = room.players[0];
                }
            }else{
                // no players left, remove rounds,game,room
                delete this.games[this.game_id];
                this.game_id = null;

                delete this.rounds[this.round_id];
                this.round_id = null;

                delete this.rooms[this.room_id];
                this.room_id = null;
            }
        }
        // if all players have left, set host to null; so that the next player to join can become host
        // if last player in a room, end game, delete room
    }

    onClientMessage(client_id,message){
        message = ''+message;

        // console.log('client says',client_id,message)
        let decoded = null;
        try{
            decoded = JSON.parse(message);
        }catch(e){
            console.error(e)
        }
        if(!decoded){
            console.error('error decoding client message',message);
            return;
        }
        if(decoded.client_id !== client_id){
            console.error('client message client_id mismatch',decoded.client_id,client_id)
            return false;
        }
        if(['HIGHLIGHT','SET_PLAYER_CURSOR'].indexOf(decoded.type) === -1){
            console.log('client says',decoded);
        }
        switch(decoded.type){
            // case 'NEW_ROOM':
            //     this.newRoomGameRound(client_id)
            //     break;

            case 'iceCandidate':
                this.notifyClient(decoded.to,{...decoded,type:'remotePeerIceCandidate'});
                break;

            case 'mediaOffer':
                // console.log('mediaOffer from client',client_id,decoded)
                this.notifyClient(decoded.to,decoded)
                break;



            case 'mediaAnswer':
                this.notifyClient(decoded.to,decoded);
                break;



            case 'JOIN_ROOM':
                if(!this.rooms[decoded?.room_id]){
                    this.notifyClient(client_id,{
                        type:'ROOM_JOIN_ERROR',
                    });
                    return;
                }
                this.rooms[decoded?.room_id]?.players?.push(client_id);

                this.notifyClient(client_id,{
                    type:'ROOM_JOIN_SUCCESS',
                });
                break;

            case 'NEW_GAME':
                this.notifyClient(client_id,{
                    type:'GAME_CREATE_SUCCESS',
                });
                break;

            /** pattern emergining: set_player_mesh_position // record_mesh_position */
            case 'SET_PLAYER_CURSOR':
                this.player_cursors[client_id] = decoded.data;
                break;

            case 'SET_PLAYER_HEAD':
                this.player_heads[client_id] = decoded.data;
                break;

            case 'RESTART_GAME':
                if(this.game_host === client_id
                    // already validated above
                    //&& decoded.client_id === client_id
                ){
                    this.newRoomGameRound(client_id);
                }
                break;

            case 'START_GAME':
                this.notifyClient(client_id,{
                    //type:'GAME_START_SUCCESS',
                    type:'GAME_STATE_UPDATE',
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

            case 'HIGHLIGHT':
                // this.hovered.push(decoded.card_id);
                this.hovered = [decoded.card_id];
                break;

            //case 'RESET_FLIPPED':
            //    break;
        }
    }

    async checkForMatch(){
        console.log('check for match',this.flipped.length);
        if(this.flipped.length > 1){
            this.ignore_clicks = true;
            let cardA = this.cards[this.flipped[0]];
            let cardB = this.cards[this.flipped[1]];
            console.log('match?',cardA.pair_id,cardB.pair_id);
            if(cardA.pair_id === cardB.pair_id){
                console.log('match found');
                // todo: do away with match_checks?
                this.match_checks.push({
                    player:this.player_turn,
                    pass: true,
                    pair_id:cardA.pair_id
                })

                await delay(1000); // wait a beat

                // TODO: pluck out of available cards

                // move pair to player's hand
                this.player_hands[this.player_turn] = [
                    ...this.player_hands[this.player_turn],
                    ...this.flipped
                ];

                console.log('player hands?',this.player_hands);

                // un-flag
                this.flipped = [];

                // remove from "zone"
                // TODO: update zone.card = null
                cardA.zone = null;
                cardA.player_id = this.player_turn;

                cardB.zone = null;
                cardB.player_id = this.player_turn;


            }else{
                console.log('not a match');
                // todo delay
                await delay(1000);
                this.flipped = []; // unflip on client
                this.ignore_clicks = false;
                this.match_checks.push({
                    player:this.player_turn,
                    pass: false,
                })
                let client_ids = Object.keys(this.clients);
                // switch player turn
                this.player_turn = this.player_turn === client_ids[0] ? client_ids[1] : client_ids[0];
            }
            await delay(300);
            this.ignore_clicks = false;
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
        if(message.message !== 'PING'){
            console.log('sending client message',client_id,message)
        }
        // todo: error if no client matches id
        this.clients?.[client_id]?.ws?.send(JSON.stringify(message))

    }

    ping(){
        // let player_hands = {};
        // for(let a in this.clients){
        //     let client = this.clients[a];
        //     player_hands[a] = client.hand;
        // }
        const room = this.rooms[this.room_id];
        if(room?.players?.indexOf(this.player_turn) === -1){
            this.player_turn = room.players[0];
        }
        if(room?.players?.indexOf(this?.game_host) === -1){
            this.game_host = room.players[0];
        }
        // TODO: if player's ws connection is closed, prune them from the room
        this.notifyAllClients({
            type:'PING',
            time: performance.now(),
            state: {
                room_id: this.room_id,
                client_ids: Object.keys(this.clients),
                player_hands: this?.player_hands,
                player_heads: this?.player_heads,
                game_host: this?.game_host,
                game_id: this?.game_id,
                game: this.games?.[this?.game_id],
                round_id: this?.round_id,
                round: this.rounds?.[this?.round_id],
                cards: this.cards,
                available_cards: this.available_cards,
                //flipped: this.games?.[this?.game_id]?.flipped,
                flipped: this.flipped,
                player_turn: this.player_turn,
                hovered: this.hovered,
                // just let server dictate when a card is in a players hand
                // if the client detects a change in length in the hand, it should re-parent the card from zonegroup to handd
                // match_checks: this.match_checks, // todo: subset
                player_cursors: this.player_cursors,
                ignore_clicks: this.ignore_clicks
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
            players: [], //Object.keys(this.clients),
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
        //     type:'ROOM_CREATE_SUCCESS',
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