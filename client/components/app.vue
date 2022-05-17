<template>
    <div id="debug" >

        <div class="modal-wrapper" v-if="show_modal">
            <LoginModal v-if="show_login_modal" @authenticated="onLoginAuthenticated" />
            <NameModal v-if="show_name_modal" @nameUpdated="onNameUpdated"/>
            <PauseMenuModal v-if="show_pause_menu" :submitModal="submitModal"
            :worlds="worlds"
            :rooms="rooms"
            :games="games"
            :world_selection="world_selection"
            :room_selection="room_selection"
            :game_selection="game_selection"
            :getRoomsForWorld="getRoomsForWorld" />

            <div class="game-in-progress-modal modal" v-if="show_game_in_progress_modal">
                <div class="modal-content"><h2 class="mb-4">"Jake's Game" is already in progress</h2><button>Spectate</button><button>Request to Play</button></div>
            </div>

            <div class="player-request-modal modal" v-if="show_player_request_modal">
                <div class="modal-content"><h2 class="mb-4">"Brent" wants to join your game!</h2><button>Allow (Continue)</button><button>Allow (New)</button><button>Ignore</button></div>
            </div>

            <div class="spectator-joined-modal modal" v-if="show_spectator_joined_modal">
                <div class="modal-content"><h2 class="mb-4">"Brent" joined as a spectator</h2><button>Invite to play</button></div>
            </div>

            <div class="modal-underlay"></div>
        </div>

        <div class="debug-inner">
            <div>Online: {{state?.client_ids?.length}}</div>
            <div>Round {{state?.round_number}}</div>
            <div class="scores" v-for="id in state?.client_ids" :key="id">{{state?.player_names?.[id] ?? 'player'}}: <span class="hit">{{state?.player_scores?.[id]?.[0] ?? 0}}</span> / <span class="miss">{{state?.player_scores?.[id]?.[1] ?? 0}}</span> </div>

            <div v-if="!calling"
                @click.prevent="start_video_chat"
                style="pointer-events:all;">
                <button class="video-chat-call-start">Join Chat</button>
            </div>
            <div v-if="!show_end_call_button"
                @click.prevent="end_video_chat"
                style="pointer-events:all;">
                <button class="video-chat-call-end">Leave Chat</button>
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

                    <li v-if="im_game_host"
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

        <div class="hud">
            <div style="pointer-events:all;" class="game-modal-toggle-icon" @click.prevent="openPauseMenu">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 48 48"><rect x="0" y="0" width="48" height="48" fill="none" stroke="none" /><mask id="svgIDa"><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-width="4"><path fill="#fff" d="M28 28h16v16H28zM13 4l9 16H4l9-16Zm23 16a8 8 0 1 0 0-16a8 8 0 0 0 0 16Z"/><path stroke-linecap="round" d="m4 28l16 16m0-16L4 44"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#svgIDa)"/></svg>
            </div>
            <div class="av-controls">
                 <!-- TOGGLE YOUR OWN VIDEO -->
                <div style="pointer-events:all;" id="icon-video-enable" v-if="!video_enabled" @click.prevent="enableVideo()">
                    <svg width="55" height="38" viewBox="0 0 55 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M43.3333 5.41667C43.3333 2.42938 40.904 0 37.9167 0H5.41667C2.42938 0 0 2.42938 0 5.41667V32.5C0 35.4873 2.42938 37.9167 5.41667 37.9167H37.9167C40.904 37.9167 43.3333 35.4873 43.3333 32.5V23.4731L54.1667 32.5V5.41667L43.3333 14.4435V5.41667Z" fill="white"/>
                    </svg>
                </div>
                <div style="pointer-events:all;" id="icon-video-disable" v-if="video_enabled" @click.prevent="disableVideo()">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="2em" height="2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><rect x="0" y="0" width="16" height="16" fill="none" stroke="none" /><path fill="currentColor" fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925l-10-14l.814-.58l10 14l-.814.58z"/></svg>
                </div>
                <!-- <button @click="toggle_mic_mute">{{mic_muted?'Un':''}}Mute Mic</button> -->
                <!-- TODO: pick audio input -->
                <!-- TODO: pick audio input settings -->
                <!-- <button @click="toggle_vid_mute">{{video_muted?'Un':''}}Mute Video</button> -->
                <!-- TODO: pick video input -->
                <!-- TODO: video input settings -->
            </div>
            <div v-if="its_my_turn">Your Turn</div>
            <div v-else>Opponent's Turn</div>
        </div>
        <div class="debug-video">
            <audio id="sound_effects" src="./public/sounds/flip.mp3" />
            <!-- players webcam feed -->
            <video id="video" autoplay playsinline muted v-show="video_enabled"/>
            <!-- opponent video streams -->
            <div class="opponent_videos">
            <video class="opponent_video"
                autoplay
                :ref="`opponent_video_${client_id}`"
                playsinline
                onclick="toggle_opponent_mute()"
                v-for="client_id in (state?.client_ids ?? []).filter((id)=>{return id!==state.my_client_id})"
                :key="client_id"
                :data-client-id="client_id" />
            </div>
        </div>
    </div>
</template>

<script>
import LoginModal from './loginmodal.vue';
import NameModal from './namemodal.vue'
import PauseMenuModal from './PauseMenuModal.vue'
export default {

    components:{
        LoginModal,
        NameModal,
        PauseMenuModal
    },

    props:{
        state:{required:true, default: {}},
    },

    setup(){
        return {
            // key ourselves in the users{}
            user: {},
            user_session: {},
            worlds: {},
            rooms: {},
            games: {},
            users: {},

            selected_world_clients: [],
            selected_room_clients: [],
            selected_game_clients: [],

            directus_loaded: false,

            show_modal: true,
            show_login_modal: true,
            show_name_modal: false,
            show_pause_menu: false,
            show_player_request_modal: false,
            show_spectator_joined_modal: false,
            show_game_in_progress_modal: false,

            show: false,
            calling: false,
            show_end_call_button: false,
            messages: [],
            mic_muted: false,
            video_enabled: false,

            // modal data
            world_selection: '',
                new_world_name: '',
            room_selection: '',
                new_room_name: '',
            game_selection: '',
                new_game_name: '',
                new_game_mode: '',
                    new_game_mode_name: '',
        }
    },

    mounted(){
        t.root = this;
        // console.log('vue app mounted');
        document.addEventListener('keyup', e => {
            // Keys.d (lowercase "d")
            if (e.keyCode === 68) {
                this.show = !this.show;
            }
        });
        t.video = document.getElementById('video');
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
                // console.log('last dealt?',new_state?.last_dealt,old_state?.last_dealt);
                if(new_state?.shuffling && !old_state?.shuffling){
                    t.deck.tweenCardsToDeck();
                }
                if(new_state?.last_dealt !== old_state?.last_dealt){
                    t.deck.tweenCardsToZones();
                }

                if(new_state?.client_ids?.length === 2 && old_state?.client_ids?.length === 1){
                    // we just went from 1 peer to 2, start a call
                    // this.calling = true; // hide start call button
                    // t.call();
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

        openPauseMenu(){
            this.getWorlds();
            this.show_modal = true;
            this.show_pause_menu = true;
            t.client_ignore_clicks = true;
        },
        onNameUpdated(){
            this.show_name_modal = false;
            this.openPauseMenu()
        },
        async onLoginAuthenticated(){

            console.warn('TODO: if user has no name set, show name modal');

            this.user = await t.server.directus.users.me.read({fields:['first_name','id','fkid']})

            this.user_session = await t.server.directus.items('Sessions').readByQuery({
                limit: 1,

                filter: {
                    user: this.user.id
                }
            });

            console.log('this.user_session',this.user_session);

            // if the user does not have a session, created one
            if(!this.user_session){
                this.user_session = {}
                await t.server.directus.items('Sessions').createOne({
                    user: this.user.id,
                }).then(res => {
                    console.log('user session create',res);
                    // this.user_session = res;
                }).catch((e)=>{
                    console.error('error creating user session on server',e);
                });
            }

            this.show_login_modal = false;
            if(!this.user?.first_name?.length){
                this.show_name_modal = true;
            }else{
                this.openPauseMenu();
            }
        },
        closePauseMenu(){
            this.show_modal = false;
            this.show_pause_menu = false;
            t.client_ignore_clicks = false;
        },
        submitModal(){
            console.log('submit modal');
            this.show_modal = false;
            t.client_ignore_clicks = false;
            t.controls.enabled = true;
        },
        enableVideo(){
            this.video_enabled = true;
            this.$nextTick(()=>{
                window.t.setupVideoStream()
            })
        },
        disableVideo(){
            window.t.closeVideoStream();
            this.video_enabled = false;
        },
        toggle_mic_mute(){
            this.mic_muted = !this.mic_muted;
        },
        // toggle_vid_mute(){
        //     this.video_muted = !this.video_muted;
        // },
        start_video_chat(){
            this.calling = true;
            window.t.call()
        },
        end_video_chat(){
            window.t?.peer?.close();
            if(window.t.peer){
                window.t.peer = null;
            }
            window.t.setupOpponentPeer();
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
            this.closePauseMenu()
            window.t.server.send({
                type: 'RESTART_GAME',
                //game_id: this.state.game_id // server should know based on client id
            })
        },

        getWorlds(){
            axios.get('/api/worlds').then(res=>{
                this.worlds = res.data.data;
            }).catch(err=>{
                console.error(err);
            })
        },

        getRoomsForWorld(world_id){
            axios.get(`/api/world/${world_id}/rooms`).then((res)=>{
                this.rooms = res.data;
                this.room_selection = null;
                this.game_selection = null;
            });
        }
    },

    computed:{
        // show_modal(){
        //     return true;
        // },
        gameHostByGameId(){
            return(game_id)=>{
                return '';
            }
        },
        isHostOfSelectedGame(){
            return this.gameHostByGameId(this.game_selection) === this.state.my_client_id
        },
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
.game-modal-toggle-icon {
    cursor: pointer;
    pointer-events: all;
    position: fixed;
    top: 40px;
    right: 20px;
    width: 32px;
    svg {
        width: 100%;
        height: auto;
    }
}
#icon-video-enable, #icon-video-disable{
    position: absolute;
    bottom: 60px;
    right: 20px;
}
#icon-video-enable svg {
    width: 35px;
}
#icon-video-disable {
    right: 21px;
    bottom: 63px;
}
select {
    background: #000;
}
button {
    border: 1px solid #eee;
    padding: 5px 10px;
    margin: 3px;
    border-radius: 20px;
}
.debug-inner {
    pointer-events: all;
}
.modal {
    h2 {
        text-align: center;
    }
    hr {
        margin-top: 5px;
        margin-bottom: 10px;
    }
    pointer-events: all;
    top: 60px;
    position: absolute;
    width: calc(33vw - 40px);
    background-color: rgba(0,0,0,0.8);
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 0 10px rgb(0 0 0 / 90%);
    backdrop-filter: blur(10px);
    left: 50%;
    transform: translateX( calc( ( -33vw ) / 2) );
    box-sizing: border-box;
    // pointer-events: none;
    input, select, label {
        pointer-events: auto;
    }
    z-index: 2;
}
.modal-underlay {
    pointer-events: none;
    background-color: rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
}
canvas {
    z-index: 1;
}
#vue-layer {
    z-index: 2;
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: none;
}
.modal-content a {
    text-decoration: underline;
}
input[type=text],input[type=password]{
    border: 1px solid white;
    background: transparent;
    color: #fff;
    border-radius: 20px;
    padding: 5px 10px;
    margin: 3px;
    outline: none !important;
    transition: border 0.2s ease-out, margin 0.2s ease-out;
    &:hover,&:active,&:focus{
        margin: 0;
        border: 3px solid #fff;
    }
}
.modal-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
}
#debug {
    background: transparent;
    color: #fff;
    position: fixed;
    top: 0;
    left: 0;
    // right: 0;
    bottom: auto;

    width: auto;
    right: auto;

    // width: 30vw;
    height: 100vh;
    // pointer-events: none;

    .details {
        z-index: 2;
        position: relative;

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

    .scores .hit {
        color: green;
    }
    .scores .miss {
        color: red;
    }
}
.opponent_videos {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;

    position: fixed;
    right: 0;
    height: 100px;
    width: 100vw;
    bottom: 0;
}
.opponent_video {
    border: 1px solid yellow;
    position: relative;
    display: inline-block;
}
.modal-error {
    color: red;
    display: inline-block;
    margin: 10px 0;
}
</style>