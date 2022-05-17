<template>
    <div class="login-modal modal">
        <div class="modal-content">
            <h2 class="mb-4">Hi, who are you?</h2>

            <form @submit.prevent="formSubmit">
                <p v-if="!submitting && (register || show_forgot_password)">
                    <a href="#" @click.prevent="toggleRegister(false)">Login</a>
                </p>

                <span v-if="error" class="modal-error">{{error}}</span>


                <span v-if="!register && !submitting && !show_forgot_password"> No Account? <a href="#" @click.prevent="toggleRegister(true)">Register</a></span>
                <br/>

                <span v-if="submitting">loading...</span>
                <!-- <input style="display:none;" type="checkbox" v-model="register" /> -->

                <input type="text" ref="email_field" v-model="email" name="email" v-if="!submitting && !show_check_email" placeholder="email" required />

                <br/>

                <!-- <input type="text" v-show="register" v-model="name" placeholder="name (public)" /> -->

                <span v-if="show_check_email">Please check your email to finish registration.</span>

                <input type="password" name="password" v-if="!show_forgot_password && !register && !submitting && !show_check_email" v-model="password" required placeholder="password" />

                <br/>

                <span v-if="!submitting">

                    <button @click.prevent="onClickLogin" v-if="!register && !show_forgot_password">Login</button>

                    <div v-if="show_forgot_password && !show_check_email">
                        <label>Request Password Reset Link</label>
                        <button @click.prevent="onClickRequestPWReset">Submit</button>
                    </div>

                    <button @click.prevent="onClickRegister" v-if="register">Register</button>

                    <a href="#" @click.prevent="show_forgot_password = true" v-if="!submitting && !show_forgot_password && !register">forgot password?</a>

                    <hr/>

                    <!-- <button @click.prevent="onClickGuest">Continue as Guest</button> -->
                </span>
            </form>
        </div>
    </div>
</template>
<script setup>
import { reactive,ref } from 'vue'
let submitting = ref(false);
let authenticated = ref(false);
let show_forgot_password = ref(false);
let error = ref('');
let name = ref('');
let email = ref('');
let password = ref('');
let register = ref(false)
let show_check_email = ref(false)
let state = reactive({
    show_forgot_password,
    submitting,
    authenticated,
    error,
    name,
    email,
    password,
    register,
    show_check_email
})
function toggleRegister(value){
    state.register = value;
    if(value){
        state.show_forgot_password = false
    }
}
</script>
<script>
// import TextField from './TextField.vue'

export default {
    components:{
        // TextField
    },
    async mounted(){
        await this.checkIsAuthenticated()
        this.focusInput();
        // this.setRegister(true);
        // alert('hi');
        // window.checkThis = this;
    },

    methods:{
        async checkIsAuthenticated(){
            // But, we need to authenticate if data is private
            this.authenticated = false;

            // Try to authenticate with token if exists
            await t.server.directus.auth
                .refresh()
                .then(() => {
                    this.authenticated = true;
                    this.$emit('authenticated');
                })
                .catch((error) => {
                    console.warn('not authenticated',error);
                });
        },
        focusInput(){
            this.$nextTick(()=>{
                this.$refs?.email_field?.focus();
            })
        },
        // setRegister(value){
        //     console.log(this);
        //     // this.register = value
        // },
        onFormSubmit(){
            if(this.show_forgot_password){
                this.onClickRequestPWReset();
            }else if(this.register){
                this.onClickRegister()
            }else{
                this.onClickLogin();
            }
        },
        async onClickLogin(){
            this.submitting = true;
            this.error = null;
            console.log('logging in');
            await t.server.directus.auth.login({
                email:this.email,
                password:this.password
            })
            .then(() => {
                // this.submitting = false;
				this.authenticated = true;
                this.$emit('authenticated');
			})
			.catch((err) => {
                this.submitting = false;
                console.error(err)
				this.error = 'Invalid email or password';
			});
        },
        onClickRegister(){
            this.submitting = true;
            this.error = null;
            axios.post('/api/user/register',{
                email:this.email,
            }).then(res=>{
                console.log(res);
                this.show_check_email = true
                this.submitting = false
            }).catch(err=>{
                console.log(err);
                this.error = err;
                this.submitting = false
            })
        },
        async onClickRequestPWReset(){
            this.submitting = true;
            this.error = null;
            axios.post('/api/user/reset-pw',{
                email:this.email,
            }).then(res=>{
                console.log(res);
                this.submitting = false
                this.show_check_email = true
            }).catch(err=>{
                console.log(err);
                this.error = err;
                this.submitting = false
            })
        },
        onClickGuest(){
            // todo: create a guest user and a guest session...
        }
    }
}
</script>