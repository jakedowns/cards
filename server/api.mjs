// storage api for CardOS

class API {

    constructor(){

    }

    init(){
        this.state = getState() ?? freshState();
    }

    getState(){

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