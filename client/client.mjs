// import Vue from 'vue';
import ClientAPI from './client-api.mjs';

class Client {
    constructor(){
        this.api = new ClientAPI(this);
        this.api.init();

        let _client = this;

        this.app = Vue.createApp({
            data(){
                return {
                    state: {
                        loading:true
                    },
                    message: 'Hello Girl'
                }
            },
            methods: {
                setCard(card_name, property, value){
                    this.state.decks[this.state.player.focused_deck].cards[card_name][property] = value;
                },
                action(name){
                    console.log('ACTION!',name);
                }
            },
            computed: {
                currentTheme(){
                    return this.state.themes[this.state.player.active_theme] ?? 'default';
                },

                tableTopStyle(){
                    return this.currentTheme.tableTopStyle
                },

                cardStyle(){
                    return this.currentTheme.cards.globalStyle
                },

                cardFrontStyle(){
                    return {
                        ...this.currentTheme.cards?.frontStyle,
                        ...{
                            borderRadius: this.currentTheme.cards.globalStyle.borderRadius
                        }
                    }
                },

                cardBackStyle(){
                    return {
                        ...this.currentTheme.cards.backStyle,
                        ...{
                            borderRadius: this.currentTheme.cards.globalStyle.borderRadius
                        }
                    }
                }
            }
        }).mount('#app')
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    window.c = new Client();
})