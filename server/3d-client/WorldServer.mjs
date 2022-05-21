import {
    performance
} from 'perf_hooks';
import { decode } from 'punycode';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
class WorldServer{
    constructor(){

        this.users = {};

        // todo: just nest under users?
        this.user_names = {};

        this.user_sessions = {};

        this.client_user_ids = {}; // local <-> directus

        this.user_client_ids = {}; // directus <-> local

        this.chat_messages = [];

        // this is a node-WS thing only
        // for most of the code, focus on user_id instead of client_id
        this.clients = {};

        // worlds are created by clients
        this.worlds = {};

        // rooms are assigned to worlds
        this.rooms = {};

        // games are assigned to rooms
        this.games = {
            default:{
                started:false,
            }
        };

        // heartbeat
        this.ping_interval = setInterval(this.ping.bind(this),256);

        // orphan client cleanup
        setInterval(()=>{
            // every 10 seconds, clean up any clients that haven't sent a WS message in the past... 60 seconds?
            for(let i in this.clients){
                if(Date.now() - this.clients[i].last_seen > 60*1000){
                    this.onClientLeave(i);
                }
            }
        },10*1000)
    }

    getDefaultRoomState(){
        // create a default room for now
        const DEFAULT_ROOM = {
            user_ids: [],
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
        return DEFAULT_ROOM;
    }

    // TODO: externalize class
    getDefaultMatchingGameState(){
        const DEFAULT_GAME = {
            available_cards: [],
            cards: [],
            flipped: [],
            game_host: null,
            game_type: 1, // food matching 2===solitaire
            hovered: [],
            ignore_clicks: false,
            last_dealt: null, // trigger "dealing" tween
            match_checks: [],
            player_cursors: {},
            player_cursors: {},
            player_hands: {},
            player_heads: {},
            player_names: {},
            player_scores: {},
            player_turn: null,
            room_id: null,
            round_number: 1,
            rounds: {},
            shuffling: false,
            user_ids: [], // array of ids
            world_id: null,
            zones: [],
        }
        return DEFAULT_GAME;
    }

    attachAPI_andBoot(API){
        this.api = API;
        this.api.bootForWorldServer(this);
    }

    onClientJoin(client_id,ws){
        this.clients[client_id] = {
            id: client_id,
            public_id: client_id, // todo public id vs. private id
            // otherwise players could impersonate other players
            ws,
            last_seen: Date.now(),
            // hand: [],
        }

        // updating this to use server-side state
        // if(!this.room_id){
        //     this.newRoomGameRound(client_id);
        // }

        this.notifyClient(client_id,{
            type: 'WELCOME',
            your_client_id: client_id,
        })
        // this.notifyAllClients({
        //     type:"NEW_CLIENT_CONNECTED",
        //     new_client_id:client_id,
        //     player_or_spectator
        // });
    }

    onClientLeave(client_id){
        console.log('client disconnected',client_id)

        console.warn('re-implement host switching when room host leaves?')
        console.warn('todo: tag room.player pivot as disconnected')
        // what if player is still in another tab/device?
        // maybe just do things based on last_seen
        // TODO: update player.last_seen when player sends any message

        // drop from client_id list
        delete this.clients?.[client_id];
        // delete this.player_hands?.[client_id];
        // delete this.player_heads?.[client_id];
        // delete this.player_scores?.[client_id];
        // delete this.user_names?.[client_id];

        // todo: get room(s) for player and loop
        // const room = this.rooms[this.room_id];

        // remove from room
        // let room_player_index = room.players.indexOf(client_id);
        // if(room_player_index>-1){
        //     room.players.splice(room_player_index,1);
        // }
        // console.log('clients remaining',Object.keys(this.clients).length);
        // console.log('room.players remaining',room.players.length);
        // // if player was host, change host to next remaining player in room
        // if(room.game_host === client_id){
        //     if(room.players.length){
        //         // assign new host
        //         room.game_host = room.players[0];
        //         // make it this players turn
        //         if(room.players.indexOf(room.player_turn) === -1){
        //             room.player_turn = room.players[0];
        //         }
        //     }else{
        //         room.game_host = null;
        //     }
        // }

        // if(!room.game_host && !room.players.length){
        //     // no players left, remove rounds,game,room
        //     delete this.games[this.game_id];
        //     this.game_id = null;

        //     delete this.rounds[this.round_id];
        //     this.round_id = null;

        //     delete this.rooms[this.room_id];
        //     this.room_id = null;

        //     console.log('last player left, closing game TODO: clean up on timeout to allow last player time to reconnect');
        // }
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
        if(['HIGHLIGHT','SET_PLAYER_CURSOR','SET_PLAYER_HEAD'].indexOf(decoded.type) === -1){
            console.log('client says',decoded);
        }
        this.clients[client_id].last_seen = Date.now();
        switch(decoded.type){

            // todo:
            // case 'NEW_ROOM':
            //     this.newRoomGameRound(client_id)
            //     break;

            case 'CONNECT_AS_USER':
                // TODO: verify that user is authenticated as this user id
                // otherwise, users could spoof being someone else.
                this.CONNECT_AS_USER(client_id,decoded);
                break;

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


            // TODO
            // case 'JOIN_ROOM':
            //     if(!this.rooms[decoded?.room_id]){
            //         this.notifyClient(client_id,{
            //             type:'ROOM_JOIN_ERROR',
            //         });
            //         return;
            //     }
            //     this.rooms[decoded?.room_id]?.players?.push(client_id);

            //     this.notifyClient(client_id,{
            //         type:'ROOM_JOIN_SUCCESS',
            //     });
            //     break;

            // TODO
            // case 'NEW_GAME':
            //     this.notifyClient(client_id,{
            //         type:'GAME_CREATE_SUCCESS',
            //     });
            //     break;

            /** pattern emergining: set_player_mesh_position // record_mesh_position */
            case 'SET_PLAYER_CURSOR':
                // this.player_cursors[client_id] = decoded.data;
                this.gameById(decoded.game_id).player_cursors[decoded.user_id] = decoded.data;
                break;

            case 'SET_PLAYER_HEAD':
                let game = this.gameById(decoded.game_id)
                if(!game){
                    console.warn('game not found',decoded.game_id);
                    return;
                }
                if(!game?.player_heads?.[decoded.user_id]){
                    game.player_heads[decoded.user_id] = {};
                }
                game.player_heads[decoded.user_id] = decoded.data;
                // this.player_heads[client_id] = decoded.data;
                break;

            case 'RESTART_GAME':
                if(
                    this.game_host === this?.client_user_ids?.[client_id]
                ){
                    this.restartGame(client_id,decoded.game_id);
                }
                break;

            // case 'START_GAME':
            //     this.notifyClient(client_id,{
            //         //type:'GAME_START_SUCCESS',
            //         type:'GAME_STATE_UPDATE',
            //         state: {
            //             //game_id: decoded.game_id,
            //             game: {started: true},
            //             round: {started: false},
            //             scores: {},
            //             flipped: []
            //         }
            //     });
            //     break;

            case 'FLIP':
                //this.games[this.game_id].flipped.push(decoded.card_id);
                this.flipped.push(decoded.card_id);
                this.checkForMatch(decoded.game_id);


                break;

            case 'HIGHLIGHT':
                // this.hovered.push(decoded.card_id);
                this.hovered = [decoded.card_id];
                break;

            //case 'RESET_FLIPPED':
            //    break;

            case 'CHAT_MESSAGE':
                this.notifyAllClients({
                    type:'CHAT_MESSAGE',
                    message: decoded.message,
                    client_id: decoded.client_id,
                    user_id: decoded.user_id,
                    timestamp: Date.now()
                });
                break;

            case 'RETURN_CARDS_TO_DECK':
                for(var i = 0; i<this.cards.length; i++){
                    this.cards[i].zone = 'deck';
                }
                break;

            case 'SET_USER_SESSION':
                this.SET_USER_SESSION(client_id,decoded);
                break;
        }

        let actionsToSave = [
            'SET_USER_SESSION',
            'RESTART_GAME',
            'FLIP'
        ]
        // when one of these actions has been called,
        // update the remote state on directus
        // note: we don't save things like chat messages or player positions for now
        // just the game state
        if(actionsToSave.indexOf(decoded.type)>-1){
            if(!decoded.game_id){
                if(decoded.session.game_selection){
                    decoded.game_id = decoded.session.game_selection;
                }else if(decoded.game_selection){
                    decoded.game_id = decoded.game_selection;
                }
            }
            this.saveServerState(decoded.game_id);
        }
    }

    gameById(game_id){
        return this.games[game_id];
    }

    CONNECT_AS_USER(client_id,data){
        // console.log('CONNECT_AS_USER',client_id,data.user_id)
        this.client_user_ids[client_id] = data.user_id;
        this.user_client_ids[data.user_id] = client_id;
        this.user_names[data.user_id] = data.name;
    }

    SET_USER_SESSION(client_id,data){
        // console.log('SET_USER_SESSION',client_id,data)
        this.user_sessions[data.user_id] = data.session;

        if(data.session.game_selection){
            // add player to room
            // const room = this.rooms[data.session.room_selection];
            // room.players.push(data.user_id)
            const game = this.games?.[data.session?.game_selection]

            if(!game){
                console.error('error w/ SET_USER_SESSION game not found');
                // todo: get different default depending on the gametype
                this.games[data.session.game_selection] = this.getDefaultMatchingGameState()
                // return;
            }
            game.user_ids.push(data.user_id);
            game.user_ids = game.user_ids.filter(onlyUnique);
            game.player_cursors[data.user_id] = {x:0,y:0,z:0};
            game.player_hands[data.user_id] = [];
            game.player_heads[data.user_id] = [];
            // todo: by round
            game.player_scores[data.user_id] = [0,0]; // matches, misses

            // if the "current player" is missing,
            // make the newest player the current player
            if(game.user_ids.indexOf(game.player_turn) === -1){
                game.player_turn = data.user_id;
            }
        }

    }

    async checkForMatch(game){
        console.log('check for match',this.flipped.length);
        if(this.flipped.length > 1){
            this.ignore_clicks = true;
            const cardA_ID = this.flipped[0]
            const cardB_ID = this.flipped[1]
            let cardA = this.cards[cardA_ID];
            let cardB = this.cards[cardB_ID];
            console.log('match?',cardA.pair_id,cardB.pair_id);
            if(cardA.pair_id === cardB.pair_id){
                console.log('match found');
                // todo: do away with match_checks?
                this.match_checks.push({
                    player:this.player_turn,
                    pass: true,
                    pair_id:cardA.pair_id
                })

                this.player_scores[this.player_turn][0]++;

                await delay(1000); // wait a beat

                // TODO: pluck out of available cards

                // move pair to player's hand
                this.player_hands[this.player_turn] = [
                    ...this.player_hands[this.player_turn],
                    ...this.flipped
                ];

                // remove from "available" array
                this.available_cards.splice(this.available_cards.indexOf(cardA_ID),1);
                this.available_cards.splice(this.available_cards.indexOf(cardB_ID),1);

                console.log('player hands?',this.player_hands);
                console.log('available cards remaining?', this.available_cards.length);

                // un-flag
                this.flipped = [];

                const USER_ID = this.client_user_ids[this.player_turn];

                // remove from "zone"
                // TODO: update zone.card = null
                cardA.zone = 'hand_'+USER_ID;
                cardA.player_id = USER_ID;

                cardB.zone = 'hand_'+USER_ID;
                cardB.player_id = USER_ID;

                if(this.available_cards<=2){
                    // auto-flip last 2
                    this.flipped = [this.available_cards[0],this.available_cards[1]];
                    await delay(1000); // wait a beat


                    await delay(1000); // wait a beat
                    this.available_cards[0].zone = 'hand_'+USER_ID;
                    this.available_cards[0].player_id = USER_ID;
                    this.available_cards[1].zone = 'hand_'+USER_ID;
                    this.available_cards[1].player_id = USER_ID;
                    // round over, start next round
                    this.newRound();
                    // let new_round_id = "round_"+performance.now();
                    // this.rounds[new_round_id] = {
                    //     started: true
                    // }
                    // this.round_id = new_round_id;
                    this.round_number = Object.keys(this.rounds).length;
                }else{
                    // if there's still cards in the 'deck' zone,
                    // deal 2 cards to the zones we just emptied (flipped)
                }

            }else{
                console.log('not a match');
                this.player_scores[this.player_turn][1]++;
                // todo delay
                await delay(1000);
                this.flipped = []; // unflip on client
                this.ignore_clicks = false;
                this.match_checks.push({
                    player:this.player_turn,
                    pass: false,
                })
                let user_ids = Object.keys(this.users);
                // switch player turn
                if(user_ids.length){
                    // multiplayer mode
                    let current_player_index = user_ids.indexOf(this.player_turn);
                    let next_player_index = current_player_index+1;
                    if(next_player_index >= user_ids.length){
                        next_player_index = 0;
                    }
                    this.player_turn = user_ids[next_player_index];
                }
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
    notifyGameClients(game_id,message){
        let game = this.games?.[game_id];
        // console.log('players?',game.user_ids);
        for(let i in game.user_ids){
            // console.log('i',game.user_ids,this.user_client_ids)
            let client_id = this.user_client_ids?.[game.user_ids[i]];
            // console.log('     @@@@     CLIENT ID?',client_id);
            if(client_id){
                this.notifyClient(client_id,message)
            }
            // console.log('game user_ids',game.user_ids,this.user_client_ids)
        }
    }

    notifyAllClients(message){
        for(let client_id in this.clients){
            this.notifyClient(client_id,message);
        }
    }

    notifyClient(client_id,message){
        if(['PING'].indexOf(message.type)===-1){
            console.log('sending client message',client_id,message)
        }
        // console.log('client?',this.clients);
        if(!this.clients?.[client_id]){
            console.error('client not found',client_id);
            return;
        }
        // todo: error if no client matches id
        this.clients?.[client_id]?.ws?.send(JSON.stringify(message))

    }

    ping(){
        if(!this.api.booted){
            return;
        }

        /*
        // let player_hands = {};
        // for(let a in this.clients){
        //     let client = this.clients[a];
        //     player_hands[a] = client.hand;
        // }
        const room = this.rooms[this.room_id];

        // TODO: make this time delayed, or require user input
        // "looks like other player has left.
        // [Wait] [Invite Another Player] [Continue Alone] [New Game] [End Game/Leave Room]"
        if(room?.players?.indexOf(this.player_turn) === -1){
            this.player_turn = room.players[0];
        }
        // same note as above, let the user know they're the only player
        if(room?.players?.indexOf(this?.game_host) === -1){
            this.game_host = room.players[0];
        }
        // TODO: if player's ws connection is closed, prune them from the room
        // TODO: do this on a delay based on client.last_seen, client.max_timeout_before_dropped
        // that way if someone loses their connection, they can rejoin within a specified time period
        */

        // TODO: investigate sending deltas on a per-client basis (let client send last known good hashes)
        // we compare last known hashes to the current hashes, and send deltas (or full state if corrupt / fresh);

        // TODO: loop thru games and send states to clients
        for(var game_id in this.games){
            let game = this.games[game_id];

            console.log('GAME',game);

            if(!game){
                continue;
            }

            this.notifyGameClients(game_id,{
                type:'PING',
                time: performance.now(),
                state: {
                    // is the deck currently being shuffled? tells client to animate the deck in a shuffle loop
                    shuffling: game?.shuffling,
                    // todo: do away with this in favor of automatic zone-switch tweens
                    // this basically tells the client the last time the server dealt cards, and if the client hasn't played a "deal" animation since it last saw the server deal cards, it should animate the cards
                    last_dealt: game?.last_dealt,
                    // the current room id that the client is currently playing in
                    // todo: server support multiple clients in different rooms
                    // room_id: this.room_id,
                    // the list of client ids of other clients in the room
                    // todo: scope to room

                    user_ids: game?.user_ids,

                    // still need this for WebRTC for now (todo change to use player ids?)
                    // TODO: limit to clients playing the current game
                    client_ids: Object.keys(this.clients),

                    // our map to cross reference client ids to player ids
                    client_user_ids: this.client_user_ids,

                    // pvp-matching: player<->matched_cards mapping
                    player_hands: game?.player_hands,

                    // broadcasts the position of each client's camera
                    player_heads: game?.player_heads,

                    // keep track of current player scores (total, and per-round)
                    player_scores: game?.player_scores,

                    // names of current players
                    user_names: game?.user_names,

                    // player_id of the current player hosting the room (extra options available if host)
                    game_host: game?.game_host,

                    // only necessary once we allow clients to play multiple games simultaneously (mult-tab,multi-device)
                    game_id: game?.game_id,

                    // i like having a flat store instead of state.game.prop, state.game_prop
                    // this only holds {started:boolean}
                    // todo: drop this
                    // game: this.games?.[this?.game_id],

                    // the current round id
                    // i don't think the client needs this...
                    // round_id: this?.round_id,

                    // round.started (only prop):
                    // round: this.rounds?.[this?.round_id],

                    // allow client to display current round number and detect round transitions
                    round_number: game?.round_number,

                    // cards[i].face_up is not used (we ref state.flipped[] instead)
                    // this object holds card shuffled order info & card-zone assignment
                    // (and pairing but the client doest really need to know that since server validates matches)

                    // will be needed once you can edit decks client-side #FUTURE
                    cards: game?.cards,

                    // the remaining cards in the deck, in their SHUFFLED order
                    available_cards: game?.available_cards,

                    // the ids of the max2 cards flipped over by current player+round+turn
                    flipped: game?.flipped,

                    // PlayerID: who's turn is it
                    player_turn: game?.player_turn,

                    // the ids of the cards being hovered over by the current player (i think i blocked hovering when it's not your turn)
                    hovered: game?.hovered,

                    // the current position of players mouse cursor / pointer / "hands"
                    player_cursors: game?.player_cursors,

                    // whether or not the server is currently ignoring clicks (to prevent actions while animating / processing)
                    ignore_clicks: game?.ignore_clicks
                }
            })
        }
    }

    saveServerState(game_id){

        /* const GAME_STATE = {
            shuffling: this?.shuffling,
            last_dealt: this?.last_dealt,

            // moving away from sharing client ids to the client. it should only be the server that needs to know client id
            // all other code should work based on directus user ids
            // client_ids: Object.keys(this.clients),

            // or object.values this.client_user_ids
            user_ids: Object.keys(this?.users),
            // client_user_ids: this.client_user_ids,

            player_hands: this?.player_hands,
            player_scores: this?.player_scores,
            user_names: this?.user_names,
            game_host: this?.game_host,
            round_number: this.round_number,
            cards: this.cards,
            available_cards: this.available_cards,
            flipped: this.flipped,
            player_turn: this.player_turn,
            ignore_clicks: this.ignore_clicks,

            // ignore for now
            // player_heads: this?.player_heads,
            // hovered: this.hovered,
            // player_cursors: this.player_cursors,
        } */
        const GAME_STATE = this.games?.[game_id];
        if(!GAME_STATE){
            console.error('error fetching game state',game_id);
            return;
        }
        // TODO: deep-merge with existing state
        // TODO: move game state to a different db...
        this.api.saveServerState({
            worlds:{
                // jake's world
                2: {
                    rooms: {
                        // jake's room
                        "bbce1345-0718-4faf-812d-e8c9040e1341":{
                            games:{
                                // jake's food memory game
                                "f9222054-ea60-436f-9199-75b97781ec53":GAME_STATE
                            }
                        }
                    }
                }
            },
        });
    }

    // set remote state
    setStateFromServer(state_worlds){
        let worlds_flat = {};
        let rooms_flat = {};
        let games_flat = {};
        for(let world_id in state_worlds){
            let world = state_worlds[world_id]
            worlds_flat[world_id] = world
            for(let room_id in world.rooms){
                let room = world.rooms[room_id]
                rooms_flat[room_id] = room
                for(let game_id in room.games){
                    // todo: switch on game type
                    const DEFAULT = this.getDefaultMatchingGameState();
                    let game = {...DEFAULT,...room.games[game_id]};
                    if(!game.game_host){
                        game.game_host = '0ad69be5-fa96-4511-bebe-eb81d72db381'
                    }
                    games_flat[game_id] = game
                }
                delete rooms_flat[room_id].games
            }
            delete worlds_flat[world_id].rooms;
        }

        // console.log({
        //     worlds_flat,
        //     rooms_flat,
        //     games_flat
        // })
        this.worlds = worlds_flat;
        this.rooms = rooms_flat;
        this.games = games_flat;
    }

    getGameReference(game_id){

    }

    restartGame(requesting_user,game_id){
        // todo validate user has ability to restart this game

    }

    newRoomGameRound(client_id){
        let new_room_id = "room_"+performance.now();
        this.room_id = new_room_id;

        let new_game_id = "game_"+performance.now();
        this.game_id = new_game_id;

        // do we reference room.players? or just state.players?
        this.rooms[new_room_id] = {
            // players: [], //Object.keys(this.clients),
        }

        // this.game_host = client_id;
        this.player_turn = client_id;

        // this.games[new_game_id] = {
        //     started: true,
        //     //flipped: [],
        // }

        this.rounds = [];
        this.flipped = [];

        this.newRound();

        // ping will broadcast
        // this.notifyClient(client_id,{
        //     type:'ROOM_CREATE_SUCCESS',
        //     room_id:new_room_id,
        //     game_id:new_game_id,
        //     round_id:new_round_id
        // })
    }

    async newRound(game_id){
        let game = this.games?.[game_id];
        if(!game){
            console.error('error fetching game',game_id);
            return;
        }

        // TODO: cap max rounds

        // TODO: insert into directus and get id
        let new_round = {
            sort: game.round_number + 1
        };
        game.round_number = new_round.sort;
        let result = this.api
        let new_round_id = "round_"+performance.now();
        this.round_id = new_round_id;

        this.rounds[new_round_id] = {
            started: true,
        }

        // clear players hands
        for(let i in this.player_hands){
            this.player_hands[i] = [];
        }
        // clear player scores
        for(let i in this.player_scores){
            this.player_scores[i] = [];
        }

        // regenerate available cards array
        this.available_cards = [];
        this.cards = [];
        for(var i=0; i<(4*4); i++){
            this.cards.push({
                index: i,
                deck_order_index: i,
                face_up: false,
                pair_id: i % 2 === 0 ? i : i-1,
                zone: 'deck'
            });
            this.available_cards.push(i);
        }

        this.shuffling = true; //start client shuffle animation
        await delay(2000);
        this.available_cards = this.shuffleOnce(this.available_cards);
        this.shuffling = false; // end client shuffle animation

        // deal the cards by assigning them to zones
        for(let i in this.available_cards){
            let card_id = this.available_cards[i];
            let card = this.cards[card_id];
            //card.deck_order_index = i; //this.available_cards.indexOf(card_id);
            // max zones
            if(i<16){
                card.zone = parseInt(i);
            }
        }
        // TODO: support "backfilling" when the deck has more cards than there are zones to deal to (after each match)
        this.last_dealt = Date.now();
        // console.log('last_dealt',this.last_dealt)
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


export default WorldServer