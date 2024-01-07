<template>
    <div class="world-room-game-modal modal">
        <div class="modal-content">
            <h2 class="mb-4">Game Switcher</h2>
            <h3>World</h3>
                <select :value="localWorldSelection" @change="onWorldSelectionChanged">
                <option :key="world.id" v-for="world in worlds" :value="world.id">{{ world.name }}</option>
            </select>
            <!--
            <select v-model="world_selection" @change="onWorldSelectionChanged" >
                <option :key="world.id" v-for="world in worlds" :value="world.id">{{world.name}}</option>
                <|!-- <option selected value="jakes-world-uuid">Jake's World</option> --|>
                <|!-- <option value="new-world">New World</option> --|>
            </select> -->
            <!-- <div v-if="world_selection === 'new-world'">
                <label>pick a name for your new world</label>
                <input type="text" placeholder="My New World Name" v-model="new_world_name">
            </div> -->

            <hr/>

            <div :style="{
                opacity: world_selection ? 1 : 0.5,
                 pointerEvents: world_selection ? 'all' : 'none'
            }">
                <h3>Room</h3>
                <select v-bind="room_selection" :disabled="!world_selection" @change="onRoomSelectionChanged">
                    <option :key="room.id" v-for="room in rooms" :value="room.id">{{room.name}}</option>
                    <!-- <option value="new-room">New Room</option> -->
                </select>
                <div v-if="room_selection === 'new-room'">
                    <label>pick a name for your new room</label>
                    <input type="text" placeholder="My New Room Name" v-model="new_room_name">
                </div>
            </div>

            <hr/>

            <div :style="{
                opacity: world_selection && room_selection ? 1 : 0.5,
                 pointerEvents: world_selection && room_selection ? 'all' : 'none'
                }">
                <h3>Table / Game</h3>
                <select v-bind="game_selection" :disabled="!room_selection" @change="onRoomSelectionChanged">
                    <option :key="game.id" v-for="game in games" :value="game.id">{{gameTypeName(game.game_type)}}</option>
                    <!-- <option value="new-game">New Game</option> -->
                </select>
                <div v-if="game_selection === 'new-game'">
                    <label>what would you like to call your new game?</label>
                    <input type="text" placeholder="My New Game Name" v-model="new_game_name">
                    <br/>
                    <select v-model="new_game_mode">
                        <!-- TODO loop game types -->
                        <option disabled selected value="">Select Game Mode</option>
                        <option value="memory">Memory Matching Game</option>
                        <option value="klondike">Klondike Solitaire</option>
                        <option value="new-game-mode">New Custom Game Mode...</option>
                    </select>
                    <div v-if="new_game_mode === 'new-game-mode'">
                        <label>what would you like to call your new game?</label>
                        <input type="text" placeholder="My New Game Mode Name" v-model="new_game_mode_name">
                    </div>
                </div>
            </div>

            <hr/>


            <button v-if="game_selection !== 'new-game' && isHostOfSelectedGame" @click.prevent="restart_game">Restart Game</button>
            <button @click.prevent="$emit('closeModal')">Cancel</button>

            <button
            :style="{
                opacity:
                world_selection &&
                room_selection &&
                game_selection ? 1 : 0.5,

                pointerEvents:
                    world_selection &&
                    room_selection &&
                    game_selection ? 'all' : 'none'
                }"
            @click.prevent="$emit('closeModal')" :disabled="!world_selection ||!room_selection || !game_selection">Continue</button>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        // submitModal:{
        //     type: Function,
        //     required: true
        // },
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
    data() {
        return {
            localWorldSelection: this.world_selection,
            localRoomSelection: this.room_selection,
            localGameSelection: this.game_selection,
        };
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
            this.localRoomSelection = $event.target.value;
            // console.log($event);
            this.$emit('roomSelectionChanged',$event.target.value);
        },
        // todo: throttle
        onWorldSelectionChanged(event) {
            // Update the local data property
            this.localWorldSelection = event.target.value;
            // Emit an event to inform the parent component
            this.$emit('update:worldSelection', this.localWorldSelection);
        },
        onGameSelectionChanged($event){
            this.localGameSelection = $event.target.value;
            // console.log("world selection changed",this.world_selection,$event.target.value);
            // // save world selection to user's session on the server
            // this.getRoomsForWorld(this.world_selection);
            this.$emit('gameSelectionChanged',$event.target.value);
        },
    }
}
</script>
