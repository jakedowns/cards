// storage api for CardBox

import DEFAULT_STATE from '../2d-client/default.state.mjs';
import PlayerState from '../2d-client/player-states/4_26_2022_10_11_am_pst.mjs';

class ServerAPI {

    constructor(){

    }

    request(req, res){
        if(req.url.startsWith('/api/game/')){
            this.getGame(req,res);
            return;
        }
        switch(req.url){
            case '/api/state':
                this.getState(req, res);
                break;
        }
    }

    getState(req, res){
        this.state = this.getStateFromDisk() ?? this.freshState();
        this.jsonResponse(this.state,res);
    }

    jsonResponse(data,res){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }

    getGame(req, res){
        let game_id = req.url.split('/')[3];
        this.jsonResponse(this.state.games?.[game_id],res);
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