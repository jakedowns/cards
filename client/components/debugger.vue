<template>
    <div id="debug">
        <ul class="details">
            <li class="my_client_id">My Client ID:
                <span class="value">{{state?.my_client_id}}</span></li>

            <li class="room_id">Current Room ID:
                <span class="value">{{state?.room_id ?? 'server-lobby'}}</span></li>

            <li class="game_id">Current Game ID:
                <span class="value">{{state?.game_id ?? 'no-game'}}</span></li>

            <li class="game_started">Game Started:
                <span class="value">{{game?.started ? 'true' : 'false'}}</span></li>

            <li class="round_id">Current Round ID:
                <span class="value">{{state?.round_id ?? 'no-round'}}</span></li>

            <li class="round_started">Round Started:
                <span class="value">{{round?.started ? 'true' : 'false'}}</span></li>

            <li class="clients">Clients:
                <span class="value">{{JSON.stringify(state?.clients ?? [] )}}</span></li>

            <li>player turn id: {{state.player_turn}}</li>

            <!--
            <li v-if="!state?.room_id">
                <button class="new-room" @click.prevent="new_room">New Room</button>
            </li>

            <li v-if="state?.room_id && !state?.game_id"
                @click.prevent="new_game">
                <button class="new-game">New Game</button>
            </li> -->

            <li v-if="state?.room_id && state?.game_id && state?.game_started"
                @click.prevent="restart_game">
                <button class="new-game">Restart Game</button>
            </li>

            <!-- <li v-if="state?.room_id && state?.game_id && !state?.game?.started"
                @click.prevent="start_game">
                <button class="start-game">Start Game</button>
            </li> -->
        </ul>
        <div class="bg-blur"></div>
    </div>
</template>

<script>
export default {

    props:{
        state:{required:true, default: {}}
    },

    mounted(){
        console.log('debugger mounted');
    },

    watch: {
        state: {
            // todo: should i detect deck<->zone<->hand movement implicitly / reactively?
            // or do i need to say ON_MATCH_PASS, ON_MATCH_FAIL to trigger next steps?
            handler(new_state,old_state){
                if(new_state?.game?.started && !old_state?.game?.started){
                    t.startGame();
                }
                //console.log('flipped?',new_state.flipped,new_state.cards);

                // todo: loop over all cards
                // then animate flip based on flipped.indexOf(card.id) > -1
                //for(var i=0; i<new_state.flipped.length; i++){
                for(var i=0; i<new_state?.cards?.length; i++){
                    //t.flipCard(i);
                    //let card_id = new_state.flipped[i];
                    let card = t.cards[i];
                    let server_says_is_flipped = (new_state?.flipped ?? []).indexOf(i) > -1;
                    //Fconsole.log('server says',i,server_says_is_flipped,card.face_up);
                    if(server_says_is_flipped){
                        if(!card.face_up){
                            // other player flipped it
                            //t.flipCard(i);
                            t.game.flipCard(i,true);
                        }
                    }else{
                        if(card.face_up){
                            // card has been unflipped on server
                            t.game.flipCard(i,false);
                        }
                    }
                }

                // todo: if player hands have changed size, run this
                // this basically just handles animating matched cards off the table into the players hands
                // todo: need to animate other players cards into the OTHER players hand
                // todo: rename to update player hand cards (or something)
                t.addMatchToHand();


                //console.log('debugger state changed', new_state);
            },
            deep: true
        }
    },

    methods:{
        new_room() {
            // request new room
            window.t.server.send({
                type: 'NEW_ROOM',
            })
        },
        new_game() {
            // request new game
            window.t.server.send({
                type: 'NEW_GAME',
            })
        },
        new_round() {
            window.t.server.send({
                type: 'NEW_ROUND',
            })
        },
        start_game() {
            window.t.server.send({
                type: 'START_GAME',
                //game_id: this.state.game_id, // server should know based on client id
            })
        },
        restart_game(){
            window.t.server.send({
                type: 'RESTART_GAME',
                //game_id: this.state.game_id // server should know based on client id
            })
        }
    },

    computed:{
        game(){
            return this.state?.game;
            //return this.state.games?.[this.state.game_id];
        },
        round(){
            return this.state?.round;
            //return this.state.rounds?.[this.state.round_id];
        }
    }
}
</script>
<style>
#debug {
    background: transparent;
    color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: auto;
    width: 100%;
    height: 30px;
    z-index: 2;
}
.details {
    position: absolute;
}
.bg-blur {
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0,0,0,0.5);
    filter: blur(10px);
}
</style>