<template>
<div class="top-hud">
    <div class="turn-indicator">
        <div class="my-turn" v-if="its_my_turn">Your Turn</div>
        <div class="not-my-turn" v-else>Opponent's Turn</div>
    </div>
</div>
</template>

<script>
export default {
    props:{
        its_my_turn:Boolean
    }
}
</script>