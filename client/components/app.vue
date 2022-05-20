<template>
    <div id="debug" >

        <div class="modal-wrapper" v-if="show_modal">
            <LoginModal

                v-if="show_login_modal"
                @notAuthenticated="onLoginNotAuthenticated"
                :authenticated="authenticated"
                :show_loading="show_login_loading"
                @authenticated="onLoginAuthenticated" />

            <NameModal v-if="show_name_modal" @nameUpdated="onNameUpdated"/>

            <PauseMenuModal

                v-if="show_pause_menu"
                :submitModal="submitModal"
                :worlds="worlds"
                :rooms="rooms"
                :games="games"
                :game_types="game_types"
                :gameTypeName="gameTypeName"
                :world_selection="world_selection"
                :room_selection="room_selection"
                :game_selection="game_selection"
                @roomSelectionChanged="getGamesForRoom"
                @worldSelectionChanged="getRoomsForWorld"
                @gameSelectionChanged="onGameSelectionChanged"
                :isHostOfSelectedGame="isHostOfSelectedGame"

            />

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

        <DebugOverlay
            :calling="calling"
            :state="state"
            :game="game"
            :round="round"
            :im_game_host="im_game_host"
            :its_my_turn="its_my_turn"
            :messages="messages"
            :show_end_call_button="show_end_call_button"
            :show_debug_info="show_debug_info"
            @toggleShowDebugInfo="toggleShowDebugInfo"

            :mic_muted="mic_muted"
            :video_enabled="video_enabled"
            :video_muted="video_muted"

            :startVideoChat="startVideoChat"

            :camera_locked="camera_locked"
            :resetCamera="resetCamera"
            :toggleCameraLock="toggleCameraLock"
            :restartGame="restartGame"

        />

        <AVHud

            ref="AVHud"

            :state="state"
            :its_my_turn="its_my_turn"
            :video_enabled="video_enabled"
            :video_muted="video_muted"
            :mic_muted="mic_muted"
            :audio_muted="audio_muted"

            :enableVideo="enableVideo"
            :disableVideo="disableVideo"
            :openPauseMenu="openPauseMenu"
            :toggleMute="toggleMute"

        />
    </div>
</template>

<script>
import LoginModal from './loginmodal.vue';
import NameModal from './namemodal.vue'
import PauseMenuModal from './PauseMenuModal.vue'
import DebugOverlay from './DebugOverlay.vue'
import AVHud from './AVHud.vue'


export default {

    components:{
        LoginModal,
        NameModal,
        PauseMenuModal,
        DebugOverlay,
        AVHud
    },

    props:{
        state:{required:true, default: {}},
    },

    setup(){
        return {
            authenticated: false,
            show_login_loading: true,
            // key ourselves in the users{}
            user: {},
            user_session: null,

            // todo: key by id
            worlds: [],
            rooms: [],
            games: [],
            game_types: [],
            users: [],

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

            show_debug_info: false,
            calling: false,
            show_end_call_button: false,
            camera_locked: false,
            messages: [],
            mic_muted: true,
            video_enabled: false,
            video_muted: false,
            audio_muted: true, // mute by default

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
                this.show_end_call_button = false;
                // at least one active peer?
                Object.values(t?.peers?.remote_peers??{})?.forEach((conn)=>{
                    if(conn.connectionState === 'connected'){
                        this.show_end_call_button = true;
                    }
                })

                // if(new_state?.client_ids?.length > old_state?.client_ids?.length){
                //     t.setupRTCPeerConnections();
                // }

                if(new_state?.game?.started && !old_state?.game?.started){
                    t.startGame();
                }

                // TODO constantly tween towards Zones, remove the need to explictly detect zone changes and manually trigger tweens
                // console.log('last dealt?',new_state?.last_dealt,old_state?.last_dealt);
                if(new_state?.shuffling && !old_state?.shuffling){
                    t.deck.tweenCardsToDeck();
                }
                else if(new_state?.last_dealt !== old_state?.last_dealt){
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
        resetCamera(){
            t.cameraman.goToView('overhead');
        },
        toggleCameraLock(){
            this.camera_locked = !this.camera_locked;
            t.controls.enabled = !this.camera_locked;
        },
        toggleShowDebugInfo(){
            this.show_debug_info = !this.show_debug_info;
        },
        openPauseMenu(){
            this.getWorlds();
            this.show_modal = true;
            this.show_pause_menu = true;
            t.client_ignore_clicks = true;
            t.controls.enabled = true;
        },
        closeModal(){
            this.show_modal = false;
            t.client_ignore_clicks = false;
        },
        onNameUpdated(){
            this.show_name_modal = false;
            this.openPauseMenu()
        },
        async onLoginNotAuthenticated(){
            this.show_login_loading = false;
        },
        async onLoginAuthenticated(){

            console.warn('TODO: if user has no name set, show name modal');

            this.user = await t.server.directus.users.me.read({
                fields:['first_name','id','fkid']
            }).catch(e=>{
                console.error('error getting user',e);
            });

            if(!this.user){
                this.show_login_loading = false;
                return;
            }

            console.log('this user?', this.user);

            const result = await t.server.directus.items('Sessions').readByQuery({
                limit: 1,

                filter: {
                    user: this.user.id
                }
            });

            this.user_session = null; // reset
            if(result?.data?.length){
                this.user_session = result.data[0];
            }

            console.log('servers user_session:',this.user_session);

            // if the user does not have a session, created one
            if(!this.user_session){
                this.user_session = {
                    current_world: 2, // todo: use uuid // jakes world by default
                    current_room: 'bbce1345-0718-4faf-812d-e8c9040e1341', // jakes room by default
                    current_game: 'f9222054-ea60-436f-9199-75b97781ec53' // food memory by default
                }
                await t.server.directus.items('Sessions').createOne({
                    user: {id:this.user.id},
                    current_world: this.user_session.current_world,
                    current_room: this.user_session.current_room,
                    current_game: this.user_session.current_game,
                }).then(res => {
                    console.log('user session created',res);
                    // this.user_session = res;
                }).catch((e)=>{
                    console.error('error creating user session on server',e);
                });
            }

            this.world_selection = this.user_session?.current_world?.toString()
            this.room_selection = this.user_session?.current_room
            this.game_selection = this.user_session?.current_game

            // TODO: make game->room->world a single query
            if(this.game_selection){
                this.getGamesForRoom(this.room_selection)
                this.getRoomsForWorld(this.world_selection);
            }else if(this.room_selection){
                this.getRoomsForWorld(this.world_selection);
            }

            this.show_login_modal = false;
            if(!this.user?.first_name?.length){
                // give us a name!
                this.show_name_modal = true;
            }else{
                if(!this.game_selection){
                    // need to pick a game
                    this.openPauseMenu();
                }else{
                    this.closePauseMenu()
                }
            }
        },
        toggleMute(){
            this.audio_muted = !this.audio_muted;

        },
        closePauseMenu(){
            this.show_modal = false;
            this.show_pause_menu = false;
            t.client_ignore_clicks = false;
            t.controls.enabled = true;
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
        startVideoChat(){
            this.calling = true;
            // this.video_enabled = true;
            window.t.setupVideoStream();
            window.t.call()
        },
        end_video_chat(){
            // window.t?.peer?.close();
            // if(window.t.peer){
            //     window.t.peer = null;
            // }
            window.t.peers.closeAll();
            /*
            window.t.webrtc_peer_connections.forEach((conn)=>{
                conn.close();
            })
            window.t.webrtc_peer_connections = {};
            window.t.peers.setupRTCPeerConnections();
            */
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
        restartGame(){
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
        async updateSessionOnServer(){
            // axios.post('/api/session').then(res=>{
            //     console.log('session updated',res);
            // }).catch(err=>{
            //     console.error(err);
            // })
            if(!this.user_session?.id){
                console.error('user has no session. create one?');
                return;
            }
            await t.server.directus.items('Sessions').updateOne(this.user_session?.id,{
                    // user: {id:this.user.id},
                    current_world: this.user_session.current_world,
                    current_room: this.user_session.current_room,
                    current_game: this.user_session.current_game,
                }).then(res => {
                    console.log('user session updated',res);
                    // this.user_session = res;
                }).catch((e)=>{
                    console.error('error updating user session on server',e);
                });
        },
        onGameSelectionChanged(game_id){
            this.game_selection = game_id;
            this.updateSessionOnServer();
        },
        // getGameRoomWorldData(){

        // },
        // worldSelectionChanged =>
        getRoomsForWorld(world_id){
            this.world_selection = world_id.toString();
            this.updateSessionOnServer();
            // console.log('getRoomsForWorld',arguments)
            axios.get(`/api/world/${world_id}/rooms`).then((res)=>{
                this.rooms = res.data.data;
                // this.room_selection = null;
                // this.game_selection = null;
            }).catch((err)=>{
                console.error(err);
            })
        },
        // roomSelectionChanged =>
        getGamesForRoom(room_id){
            // console.log('getGamesForRoom',$event.target.value);
            this.room_selection = room_id;
            this.updateSessionOnServer();
            axios.get(`/api/rooms/${this.room_selection}/games`).then((res)=>{
                this.games = res.data.games;
                this.game_types = res.data.game_types;
                // this.game_selection = null;
            }).catch((err)=>{
                console.error(err);
            })
        }
    },

    computed:{
        gameTypeName(){
            return(game_type_id)=>{
                return this.game_types.filter(
                    (type)=>{
                        return type.id === game_type_id
                    }
                )?.[0]?.Name
            }
        },
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
.mute-video {
    position: absolute;
    width: 40px;
    bottom: 103px;
    left: 30px;
    pointer-events: all;

    svg {
        cursor: pointer;
        width: 100%;
        height: auto;
    }
}
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
    bottom: 103px;
    right: 20px;
}
#icon-video-enable svg {
    width: 35px;
    cursor: pointer;
}
#icon-video-disable {
    right: 21px;
    bottom: 103px;
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
    width: 320px;
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
    background: black;
    pointer-events: all;
}
.modal-error {
    color: red;
    display: inline-block;
    margin: 10px 0;
}
</style>