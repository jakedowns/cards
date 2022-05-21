<template>
    <div class="debug">
        <div class="debug-toggle svg-button" @click="show_debug = !show_debug">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512"><rect x="0" y="0" width="512" height="512" fill="none" stroke="none" /><path fill="currentColor" d="M495.9 166.6c3.3 8.6.5 18.3-6.3 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4c0 8.6-.6 17.1-1.7 25.4l43.3 39.4c6.8 6.3 9.6 16 6.3 24.6c-4.4 11.9-9.7 23.4-15.7 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.3c-6 7.1-15.7 9.6-24.5 6.8l-55.7-17.8c-13.4 10.3-29.1 18.9-44 25.5l-12.5 57.1c-2 9-9 15.4-18.2 17.8c-13.8 2.3-28 3.5-43.4 3.5c-13.6 0-27.8-1.2-41.6-3.5c-9.2-2.4-16.2-8.8-18.2-17.8l-12.5-57.1c-15.8-6.6-30.6-15.2-44-25.5l-55.66 17.8c-8.84 2.8-18.59.3-24.51-6.8c-8.11-9.9-15.51-20.3-22.11-31.3l-4.68-8.1c-6.07-10.9-11.35-22.4-15.78-34.3c-3.24-8.6-.51-18.3 6.35-24.6l43.26-39.4C64.57 273.1 64 264.6 64 256c0-8.6.57-17.1 1.67-25.4l-43.26-39.4c-6.86-6.3-9.59-15.9-6.35-24.6c4.43-11.9 9.72-23.4 15.78-34.3l4.67-8.1c6.61-11 14.01-21.4 22.12-31.25c5.92-7.15 15.67-9.63 24.51-6.81l55.66 17.76c13.4-10.34 28.2-18.94 44-25.47l12.5-57.1c2-9.08 9-16.29 18.2-17.82C227.3 1.201 241.5 0 256 0s28.7 1.201 42.5 3.51c9.2 1.53 16.2 8.74 18.2 17.82l12.5 57.1c14.9 6.53 30.6 15.13 44 25.47l55.7-17.76c8.8-2.82 18.5-.34 24.5 6.81c8.1 9.85 15.5 20.25 22.1 31.25l4.7 8.1c6 10.9 11.3 22.4 15.7 34.3zM256 336c44.2 0 80-35.8 80-80.9c0-43.3-35.8-80-80-80s-80 36.7-80 80c0 45.1 35.8 80.9 80 80.9z"/></svg>
        </div>
        <div class="debug-inner" v-if="show_debug">


            <!-- have to enable video or mic first before this option becomes available -->
            <!-- <div v-if="
                !calling
                && !show_end_call_button
                && (video_enabled || !mic_muted)
            "
                @click.prevent="startVideoChat"
                style="pointer-events:all;">
                <button class="video-chat-call-start">Join Chat</button>
            </div> -->
            <div v-if="show_end_call_button"
                @click.prevent="end_video_chat"
                style="pointer-events:all;">
                <button class="video-chat-call-end">Leave Chat</button>
            </div>

            <button @click="toggleWireframe" style="pointer-events:all;">Wireframe</button>

            <div
                @click.prevent="resetCamera"
                style="pointer-events:all;">
                <button class="">Reset Camera</button>
            </div>
            <div
                @click.prevent="toggleCameraLock"
                style="pointer-events:all;">
                <button class="">{{camera_locked ? 'Unlock' : 'Lock'}} Camera</button>
            </div>

            <br/>
            <button @click="$emit('toggleShowDebugInfo')">{{show_debug_info?'Hide':'Show Debug Info'}}</button>
            <div class="inner" v-show="show_debug_info">
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
                            <li v-for="user_id in state.user_ids" :key="user_id">
                                <span v-if="!state.player_hands?.[user_id]?.length">Empty</span>
                                {{JSON.stringify(state?.player_hands?.[user_id])}}
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
                        @click.prevent="restartGame">
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
    </div>
</template>

<script>
import {ref} from 'vue';
export default {
    props:{
        calling:Boolean,
        camera_locked:Boolean,
        game:Object,
        im_game_host:Boolean,
        its_my_turn:Boolean,
        messages:Array,
        mic_muted:Boolean,
        resetCamera:Function,
        restartGame:Function,
        round:Object,
        show_debug_info:Boolean,
        show_end_call_button:Boolean,
        startVideoChat:Function,
        state:Object,
        toggleCameraLock:Function,
        video_enabled:Boolean,
        video_muted:Boolean,
    },
    setup(){
        return {
            show_debug: ref(false),
            wireframe: ref(false),
        }
    },
    methods: {
        toggleWireframe(){
            this.wireframe = !this.wireframe;
            t.tableMesh.children[0].material.wireframe = this.wireframe;
        }
    }
}
</script>
