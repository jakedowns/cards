// storage api for CardOS

class ServerAPI {

    constructor(){

    }

    request(req, res){
        switch(req.url){
            case '/api/state':
                this.getState(req, res);
                break;
        }
    }

    getState(req, res){
        this.state = this.getStateFromDisk() ?? this.freshState();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.state));
    }

    getStateFromDisk(){
        const DEFAULT_THEME_COLORS = {
            bg: '#332B8A',
            card: 'rgba(124, 96, 204, 0.8)',
            text: '#ffffff'
        }
        // no author? assume: system
        return {
            player: {
                name: '',
                // select welcome deck by default
                focused_deck: 'welcome',
                active_theme: 'default'
            },
            themes: {
                default: {
                    colors: DEFAULT_THEME_COLORS,
                    tableTopStyle: {
                        backgroundColor: DEFAULT_THEME_COLORS.bg,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1498462335304-e7263fe3925a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80")',
                        backgroundSize: 'cover'

                    },
                    cards: {
                        globalStyle: {
                            boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            fontSize: '1.5em',
                            borderRadius: '0.5rem',
                            backgroundColor: DEFAULT_THEME_COLORS.card,

                            color: DEFAULT_THEME_COLORS.text
                        },
                        frontStyle: {
                            // doesn't play nice with 3d transforms :G
                            // backdropFilter: 'blur(5px)',
                        },
                        backStyle: {
                            backgroundImage: 'url("https://images.unsplash.com/photo-1650647441377-715a124f6a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80")',
                        }
                    }
                }
            },
            actions: {
                nextCard: 'nextCard',
            },
            decks: {
                welcome: {
                    cards: {
                        welcome: {
                            flipped: true, // start face down
                            front: {
                                text: 'Welcome to CardOS',
                                actions: [
                                    {
                                        action: 'nextCard',
                                    }
                                ]
                            },
                            back: {
                                // image: ''
                            }
                        },
                        welcome2: {
                            type: 'input',
                            input_type: 'text',
                            required: true,
                            // todo: min string length?
                            font: {
                                text: 'What should I call you?',
                                actions: [
                                    {
                                        action: 'nextCard',
                                    }
                                ]
                            }
                        }
                    },
                    card_order: [
                        'welcome'
                    ]
                }
            }
        }
    }

    putState(){

    }

    freshState(){
        return {
            decks: {

            }
        }
    }
}

export default ServerAPI;