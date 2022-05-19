<template>
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
</template>

<script>
export default {
    props:{
        state:Object,
        game:Object,
        round:Object,
        im_game_host:Boolean,
        its_my_turn:Boolean,
        messages:Array,
        show_end_call_button:Boolean,
        show_debug_info:Boolean,
        calling:Boolean,
        camera_locked:Boolean,
        resetCamera:Function,
        toggleCameraLock:Function,
    }
}
</script>
