<template>
    <div id="debug" >
        <div>Online: {{state?.client_ids?.length}}</div>
        <div v-if="!calling"
            @click.prevent="start_video_chat">
            <button class="video-chat-call-start">Start Video Chat</button>
        </div>
        <div v-if="!show_end_call_button"
            @click.prevent="end_video_chat">
            <button class="video-chat-call-end">End Video Chat</button>
        </div>
        <br/>
        <button @click="show=!show">{{show?'Hide':'Show Debug Info'}}</button>
        <div class="inner" v-show="show">
            <ul class="details">
                <li class="my_client_id">My Client ID:
                    <span class="value">{{state?.my_client_id}}</span></li>

                <li class="room_id">Current Room ID:
                    <span class="value">{{state?.room_id ?? 'server-lobby'}}</span></li>

                <li class="game_id">Current Game ID:
                    <span class="value">{{state?.game_id ?? 'no-game'}}</span>
                    &nbsp;
                    <span class="value">{{game?.started ? 'started' : 'not-started'}}</span>
                </li>

                <li class="host_id">Current Host ID:
                    <span class="value">{{state?.game_host ?? 'no-host'}}</span>
                    &nbsp;
                    <span :style="{color:im_game_host ? 'green' : 'red'}">You're {{im_game_host ? '' : 'NOT'}} the game host!</span>
                </li>

                <li class="round_id">Current Round ID:
                    <span class="value">{{state?.round_id ?? 'no-round'}}</span>
                    &nbsp;
                    <span class="value">{{round?.started ? 'started' : 'not-started'}}</span></li>



                <li class="clients">Clients:
                    <span class="value">{{JSON.stringify(state.client_ids) }}</span></li>

                <li>player turn id: {{state.player_turn}}

                    <span :style="{color:its_my_turn ? 'green' : 'red'}">It's {{its_my_turn ? '' : 'NOT'}} Your Turn!</span>

                </li>

                <li>player type: {{state.player_type ?? 'connecting'}}</li>
                <li>player hands:
                    <ul>
                        <li v-for="player_id in state.client_ids" :key="player_id">
                            <span v-if="!state.player_hands?.[player_id]?.length">Empty</span>
                            {{JSON.stringify(state?.player_hands?.[player_id])}}
                        </li>
                    </ul>

                </li>

                <li>Flipped:
                    {{JSON.stringify(state.flipped)}}
                </li>

                <!--
                <li v-if="!state?.room_id">
                    <button class="new-room" @click.prevent="new_room">New Room</button>
                </li>

                <li v-if="state?.room_id && !state?.game_id"
                    @click.prevent="new_game">
                    <button class="new-game">New Game</button>
                </li> -->

                <li v-if="im_game_host && game_started"
                    @click.prevent="restart_game">
                    <button class="new-game">Restart Game</button>
                </li>



                <!-- <li v-if="state?.room_id && state?.game_id && !state?.game?.started"
                    @click.prevent="start_game">
                    <button class="start-game">Start Game</button>
                </li> -->

                <li>
                    <div class="messages">
                    <div class="message" v-for="(message,i) in messages" :key="i">
                        <div class="message-text">{{message.type}}</div>
                    </div>
                </div>
                </li>
            </ul>
            <div class="bg-blur"></div>
        </div>

    </div>
</template>

<script>
export default {

    props:{
        state:{required:true, default: {}}
    },

    setup(){
        return {
            show: false,
            calling: false,
            show_end_call_button: false,
            messages: []
        }
    },

    mounted(){
        // console.log('vue app mounted');
        document.addEventListener('keyup', e => {
            // Keys.d (lowercase "d")
            if (e.keyCode === 68) {
                this.show = !this.show;
            }
        });
    },

    watch: {
        state: {
            // todo: should i detect deck<->zone<->hand movement implicitly / reactively?
            // or do i need to say ON_MATCH_PASS, ON_MATCH_FAIL to trigger next steps?
            handler(new_state,old_state){

                // if we have an active webrtc connection, give user option to end it
                this.show_end_call_button = t?.peer?.connectionState === 'connected';

                if(new_state?.game?.started && !old_state?.game?.started){
                    t.startGame();
                }

                // if(new_state?.client_ids?.length === 2 && old_state?.client_ids?.length === 1){
                //     // we just went from 1 peer to 2, start a call
                //     this.calling = true; // hide start call button
                //     t.call();
                // }

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

                t.updatePlayerCursors();
                t.updatePlayerHeads();

                // todo: if player hands have changed size, run this
                // this basically just handles animating matched cards off the table into the players hands
                // todo: need to animate other players cards into the OTHER players hand
                if(JSON.stringify(new_state.player_hands)!==JSON.stringify(old_state.player_hands)){
                    t.updateCardsInHand();
                }


                //console.log('debugger state changed', new_state);
            },
            deep: true
        },
        // 'state.match_checks': {
        //     handler(new_state,old_state){
        //         if(new_state?.length !== old_state?.length){
        //             console.log('match_checks changed', new_state);
        //             if(new_state?.)
        //         }
        //         //t.updateCardsInHand();
        //     },
        //     deep: true
        // },
    },

    methods:{
        start_video_chat(){
            this.calling = true;
            window.t.call()
        },
        end_video_chat(){
            window.t?.peer?.close();
            this.show_end_call_button = false;
            this.calling = false;
        },
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
        },
        its_my_turn(){
            return this.state.player_turn === this.state.my_client_id;
        },
        im_game_host(){
            return this.state.game_host === this.state.my_client_id
        },
        game_started(){
            return this.game?.started;
        }
    }
}
</script>
<style lang="scss">
#debug {
    background: transparent;
    color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: auto;
    width: 30vw;
    height: 100vh;

    .details {
        z-index: 2;
        position: relative;
        font-family: cursive;
        font-size: 11px;
    }
    .bg-blur {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        filter: blur(10px);
        pointer-events: none;
    }
}
</style>