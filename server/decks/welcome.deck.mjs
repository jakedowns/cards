// Welcome Deck
const VERSION = '0.0.1';
export const STARTER_DECK_OPTIONS = [
    // {name:'welcome',selected:true},
    {name:'blank',selected:true},
    {name:'mind map'},
    {name:'mood board'},
    {name:'prototype'},
    {name:'storyboard'},
    {name:'flash cards'},
    {name:'playing cards'},
    {name:'tarot cards'},
    {name:'index cards'},
    {name:'todo list deck'},
    {name:'pokemon cards'},
    {name:'tetris cards'},
    {name:'uno cards'},
];

export default {
    cards: {
        welcome: {
            name: 'welcome',
            deck_order: 1,
            front: {
                text: 'Welcome to CardBox',
                text_lower: `v. ${VERSION}`,
                // text_lower: 'what\'s your name?', // new player
            },

            back: {
                // image: ''
            },
            actions: [
                {
                    name: 'nextCard',
                    // name: 'goToCard',
                    // card: 'welcome2',
                    // label: 'next',
                }
            ]
        },
        welcome2: {
            deck_order: 2,
            inputs: [
                {
                    label: 'what\'s your name?',
                    type: 'text',
                    name: 'player name',
                    placeholder: 'new player name...',
                    required: true
                }
            ],
            actions: [
                {
                    name: 'nextCard',
                    // name: 'goToCard',
                    // card: 'welcome3',
                    // label: 'next',
                }
            ],
            front: {
                text: ''
            }
        },
        welcome3: {
            deck_order: 3,
            front: {
                text: 'hello, {{player.name}}. <br/> want a quick intro?',
            },
            actions: [
                {
                    name: 'goToCard',
                    card: 'setup1',
                    label: 'no'
                },
                {
                    name: 'goToCard',
                    card: 'info1',
                    label: 'yes'
                }
            ]
        },
        setup1: {
            front: {
                text: 'Pick a theme',
            },
            inputs: [
                {
                    label: 'theme',
                    type: 'select',
                    name: 'theme',
                    required: true,
                    options: [
                        {name:'default',value:'default'},
                        {name:'dark',value:'dark'},
                        {name:'light',value:'light'},
                        {name:'blue',value:'blue'},
                    ]
                }
            ],
            actions: [
                {
                    name: 'goToCard',
                    card: 'setup2',
                    label: 'next'
                }
            ]
        },
        setup2: {
            front: {
                text: 'Let\'s create your first deck',
            },
            inputs: [
                {
                    label: 'deck',
                    type: 'select',
                    name: 'deck',
                    options: STARTER_DECK_OPTIONS,
                    required: true
                }
            ],
            actions: [
                {
                    label: 'Create Deck',
                    name: 'createDeckAndFocus',
                    deck: '{{deck}}'
                }
            ]
        },
        info1: {
            front: {
                text: 'CardBox is an experimental ecosystem for collaborative systems design with a primary goal of making programming collaborative, approachable, and fun! <br/>'
            },
            actions: [
                {
                    name: 'goToCard',
                    card: 'info2',
                    label: 'more info'
                },
                {
                    name: 'goToCard',
                    card: 'setup2',
                    label: 'pick a starter deck'
                }
            ]
        },
        info2: {
            front: {
                text: 'More info about CardBox',
                text_lower: `v. ${VERSION}`
            },
            actions: [
                {
                    name: 'goToCard',
                    card: 'info_inspiration',
                    label: 'inspiration'
                },
                {
                    name: 'goToCard',
                    card: 'info_contributors',
                    label: 'contributors'
                },
                {
                    name: 'goToCard',
                    card: 'info_philosophy',
                    label: 'philosophy'
                },
                {
                    name: 'goToCard',
                    card: 'info_progress',
                    label: 'progress'
                },
                {
                    name: 'goToCard',
                    card: 'info_roadmap',
                    label: 'roadmap'
                },
                {
                    name: 'goToCard',
                    card: 'info_team',
                    label: 'team'
                },
                {
                    name: 'goToCard',
                    card: 'info_contact',
                    label: 'contact'
                },
                {
                    name: 'goToCard',
                    card: 'info1',
                    label: 'back'
                }
            ]
        }
    },
    // TODO: deck default sort order: 'order name'
    // TODO: deck sort options: {rank,order,name,created,updated,viewed,forked}
    // key cards by uuid to allow for dupe names?
    // TODO: generate "card_order" or "deck_order" from deck_order prop on each card
    // so we don't have to manually maintain this array
    card_order: [
        'welcome',
        'welcome2',
        'welcome3',
        'setup1',
        'setup2',
        'info1',
        'info2',
    ]
}