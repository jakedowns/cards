// storage api for CardBox

import DEFAULT_STATE from './default.state.mjs';
import PlayerState from './player-states/4_26_2022_10_11_am_pst.mjs';

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
        // TODO: load from mysql
        return {...DEFAULT_STATE, ...{player:PlayerState}};
        return null;
    }

    putState(){
        //  TODO: save to mysql
    }

    freshState(){
        return DEFAULT_STATE;
    }
}

export default ServerAPI;