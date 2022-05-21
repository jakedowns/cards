<template>
    <div class="world-room-game-modal modal">
        <div class="modal-content">
            <h2 class="mb-4">Pause Menu</h2>

            <!-- game settings -->
            <button>Update Game Settings</button>
            <button>Restart Game</button>

            <hr/>
            <button @click="$emit('openWorldSelectModal')">Switch World/Room/Game</button>
            <button @click="$emit('closeModal')">Close</button>

            <hr/>
            <button @click="$emit('logout')">Logout</button>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        submitModal:{
            type: Function,
            required: true
        },
        // getRoomsForWorld:{
        //     type: Function,
        //     required: true
        // },
        // getGamesForRoom:{
        //     type: Function,
        //     required: true
        // },
        worlds:{
            type: Array,
            required: true
        },
        rooms:{
            type: Array,
            required: true
        },
        games:{
            type: Array,
            required: true
        },
        game_types:{
            type: Array,
            required: true
        },
        gameTypeName:{
            type: Function,
            required: true
        },
        world_selection:{
            type: String,
            required: false
        },
        room_selection:{
            type: String,
            required: false
        },
        game_selection:{
            type: String,
            required: false
        },
        isHostOfSelectedGame:{
            type: Boolean,
            required: true
        },
    },
    // setup(){
        // return {
        //     world_selection: null,
        //     room_selection: null,
        //     // table_selection: null,
        //     game_selection: null,
        // }
    // },
    methods: {
        onRoomSelectionChanged($event){
            // console.log($event);
            this.$emit('roomSelectionChanged',$event.target.value);
        },
        // todo: throttle
        onWorldSelectionChanged($event){
            // console.log("world selection changed",this.world_selection,$event.target.value);
            // // save world selection to user's session on the server
            // this.getRoomsForWorld(this.world_selection);
            this.$emit('worldSelectionChanged',$event.target.value);
        },
        onGameSelectionChanged($event){
            // console.log("world selection changed",this.world_selection,$event.target.value);
            // // save world selection to user's session on the server
            // this.getRoomsForWorld(this.world_selection);
            this.$emit('gameSelectionChanged',$event.target.value);
        },
    }
}
</script>
