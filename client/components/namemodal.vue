<template>
    <div class="name-modal modal">
        <div class="modal-content">
            <div v-if="submitting">loading...</div>
            <form @submit.prevent="onSubmit" v-if="!submitting">
                <h2 class="mb-4">What's your name?</h2>
                <span v-if="error" class="modal-error">{{error}}</span>
                <input type="text" v-model="first_name" required placeholder="Name (public)" />
                <button @click.prevent="onSubmit" type="submit">Submit</button>
            </form>
        </div>
    </div>
</template>

<script>
import {ref} from 'vue'
export default {
    emits: ['nameUpdated'],
    setup(){
        return {
            submitting: ref(false),
            first_name: ref(null),
            error: ref(null)
        }
    },
    methods:{
        async onSubmit(){
            this.submitting = true;
            console.warn('onsubmit',this,this.first_name);
            //let response = await t.server.directus.users.me.update({ first_name: this.first_name }, { fields: ['last_access'] }).then((res)=>{
                t.root.user.first_name = this.first_name;
                this.$emit('nameUpdated');
                this.submitting = false;
            //}).catch((err)=>{
            //    this.error = err.message;
            //}).finally(()=>{
                // always
                //this.submitting = false;
            //});
        }
    }
}
</script>