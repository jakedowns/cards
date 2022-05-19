<template>
    <div class="hud">
        <div class="hud-inner">
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
export default {
    props:{
        state:Object,
        client_id:String,
        its_my_turn:Boolean,
        video_enabled:Boolean,
        video_muted:Boolean,
        mic_muted:Boolean,
        enableVideo:Function,
        openPauseMenu:Function
    }
}
</script>