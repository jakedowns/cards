<template>
<div class="left-hud">
    <div class="scores-wrapper">
        <div>Online (Clients/Users): {{state?.client_ids?.length}}({{state?.user_ids?.length}})</div>
        <div>Round {{state?.round_number}}</div>
        <div class="scores" v-for="user_id in state?.user_ids" :key="user_id">{{state?.user_names?.[user_id] ?? 'player'}}: <span class="hit">{{state?.player_scores?.[user_id]?.[0] ?? 0}}</span> / <span class="miss">{{state?.player_scores?.[user_id]?.[1] ?? 0}}</span> </div>
    </div>
</div>
</template>

<script>
export default {
    props:{
        state:Object,
    }
}
</script>