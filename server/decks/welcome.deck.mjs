// Welcome Deck

export default {
    cards: {
        welcome: {
            front: {
                text: 'Welcome to CardOS',
            },
            back: {
                // image: ''
            },
            actions: [
                {
                    name: 'nextCard',
                }
            ]
        },
        welcome2: {
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
                }
            ],
            front: {
                text: ''
            }
        }
    },
    // TODO: deck default sort order: 'order name'
    // TODO: deck sort options: {rank,order,name,created,updated,viewed,forked}
    // key cards by uuid to allow for dupe names?
    card_order: [
        'welcome',
        'welcome2'
    ]
}