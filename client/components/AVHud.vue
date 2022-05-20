<template>
    <div class="hud">
        <div class="hud-inner">
            <div style="pointer-events:all;" class="game-modal-toggle-icon" @click.prevent="openPauseMenu">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 48 48"><rect x="0" y="0" width="48" height="48" fill="none" stroke="none" /><mask id="svgIDa"><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-width="4"><path fill="#fff" d="M28 28h16v16H28zM13 4l9 16H4l9-16Zm23 16a8 8 0 1 0 0-16a8 8 0 0 0 0 16Z"/><path stroke-linecap="round" d="m4 28l16 16m0-16L4 44"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#svgIDa)"/></svg>
            </div>
            <div class="mute-video" @click.prevent="toggleMute">
                <div class="mute" v-if="audio_muted">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512"><rect x="0" y="0" width="512" height="512" fill="none" stroke="none" /><path fill="currentColor" d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM461.64 256l45.64-45.64c6.3-6.3 6.3-16.52 0-22.82l-22.82-22.82c-6.3-6.3-16.52-6.3-22.82 0L416 210.36l-45.64-45.64c-6.3-6.3-16.52-6.3-22.82 0l-22.82 22.82c-6.3 6.3-6.3 16.52 0 22.82L370.36 256l-45.63 45.63c-6.3 6.3-6.3 16.52 0 22.82l22.82 22.82c6.3 6.3 16.52 6.3 22.82 0L416 301.64l45.64 45.64c6.3 6.3 16.52 6.3 22.82 0l22.82-22.82c6.3-6.3 6.3-16.52 0-22.82L461.64 256z"/></svg>
                </div>
                <div class="volume-up" v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1.13em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 576 512"><rect x="0" y="0" width="576" height="512" fill="none" stroke="none" /><path fill="currentColor" d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zm233.32-51.08c-11.17-7.33-26.18-4.24-33.51 6.95c-7.34 11.17-4.22 26.18 6.95 33.51c66.27 43.49 105.82 116.6 105.82 195.58c0 78.98-39.55 152.09-105.82 195.58c-11.17 7.32-14.29 22.34-6.95 33.5c7.04 10.71 21.93 14.56 33.51 6.95C528.27 439.58 576 351.33 576 256S528.27 72.43 448.35 19.97zM480 256c0-63.53-32.06-121.94-85.77-156.24c-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36c6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.54 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45c-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81c-11.61 6.41-15.84 21-9.45 32.61c6.43 11.66 21.05 15.8 32.61 9.45c28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z"/></svg>
                </div>
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
                :class="{'muted':client_mute_states[client_id]}"
                autoplay
                :ref="`opponent_video_${client_id}`"
                playsinline
                @click="toggleOpponentMute(client_id)"
                v-for="client_id in (state?.client_ids ?? []).filter((id)=>{return id!==state.my_client_id})"
                :key="client_id"
                :muted="client_mute_states?.[client_id] ?? false"
                :data-client-id="client_id" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        state:Object,
        client_id:String,
        its_my_turn:Boolean,
        video_enabled:Boolean,
        video_muted:Boolean,
        mic_muted:Boolean,
        enableVideo:Function,
        disableVideo:Function,
        openPauseMenu:Function,
        toggleMute:Function,
        audio_muted:Boolean
    },
    setup(){
        return {
            client_mute_states:{}
        }
    },
    watch:{
        client_ids(next,prev){
            next.forEach(client_id=>{
                if(!this.client_mute_states?.[client_id]){
                    this.client_mute_states[client_id] = false
                }
            })
        }
    },
    methods:{
        toggleOpponentMute(client_id){
            // this.$refs[`opponent_video_${client_id}`].muted = !this.$refs[`opponent_video_${client_id}`].muted
            this.client_mute_states[client_id] = !this.client_mute_states[client_id]
        }
    }
}
</script>