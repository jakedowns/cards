import WELCOME_DECK from './decks/welcome.deck.mjs';
import DEFAULT_THEME from './themes/default.theme.mjs';


// card/deck/pack/etc has no author? assume: system
export default {
    player: {
        name: '',
        active_theme: 'default',

        // select welcome deck by default
        focused_deck: 'welcome',
        // select first card in the deck (boot routine could do this...)
        focused_card: 'welcome',

        // by default "welcome" deck will be cloned into hand
        active_hand: null,
        hands: {},

        // favorite_decks
        // favorite_packs
        // favorite_cards
        // favorite_themes
        // favorite_actions

        // my_decks
        // my_packs
        // my_cards
        // my_themes
        // my_actions
    },
    themes: {
        default: DEFAULT_THEME
    },
    actions: {
        nextCard: {
            name: 'nextCard',
            label: 'next'
        },
    },
    decks: {
        welcome: WELCOME_DECK
    }
}