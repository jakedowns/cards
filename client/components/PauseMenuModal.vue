<template>
    <div class="world-room-game-modal modal">
        <div class="modal-content">
            <h2 class="mb-4">Pause Menu</h2>
            <h3>World</h3>
            <select v-model="world_selection" @change="onWorldSelectionChanged" >
                <option :key="world.id" v-for="world in worlds" :value="world.id">{{world.name}}</option>
                <!-- <option selected value="jakes-world-uuid">Jake's World</option> -->
                <option value="new-world">New World</option>
            </select>
            <div v-if="world_selection === 'new-world'">
                <label>pick a name for your new world</label>
                <input type="text" placeholder="My New World Name" v-model="new_world_name">
            </div>

            <hr/>

            <div :style="{
                opacity: world_selection ? 1 : 0.5,
                 pointerEvents: world_selection ? 'all' : 'none'
            }">
                <h3>Room</h3>
                <select v-model="room_selection" :disabled="!world_selection">
                    <option selected value="jakes-room">Jake's Room</option>
                    <option value="new-room">New Room</option>
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
                <select v-model="game_selection" :disabled="!room_selection">
                    <option selected value="jakes-game">Jake's Game</option>
                    <option value="new-game">New Game</option>
                </select>
                <div v-if="game_selection === 'new-game'">
                    <label>what would you like to call your new game?</label>
                    <input type="text" placeholder="My New Game Name" v-model="new_game_name">
                    <br/>
                    <select v-model="new_game_mode">
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
            <button @click.prevent="submitModal" :disabled="!world_selection ||!room_selection || !game_selection">Continue</button>
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
        getRoomsForWorld:{
            type: Function,
            required: true
        },
        worlds:{
            type: Object,
            required: true
        },
        rooms:{
            type: Object,
            required: true
        },
        games:{
            type: Object,
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
        }
    },
    setup(){
        return {
            world_selection: null,
            room_selection: null,
            // table_selection: null,
            game_selection: null,
        }
    },
    methods: {
        // todo: throttle
        onWorldSelectionChanged(){
            console.log("world selection changed",this.world_selection);
            // save world selection to user's session on the server
            this.getRoomsForWorld(this.world_selection);
        },
    }
}
</script>
