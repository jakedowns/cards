// storage api for CardBox

// import qs from 'querystring';

import DEFAULT_STATE from '../2d-client/default.state.mjs';
import PlayerState from '../2d-client/player-states/4_26_2022_10_11_am_pst.mjs';

// TODO: mysql or directus?
import StartDirectus from '../../client/directus.mjs'

class ServerAPI {

    constructor(){
        this.StartDirectus = StartDirectus;
        this.StartDirectus().then(directus=>{
            this.directus = directus;
        })
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
            case '/api/user/register':
                this.inviteUser(req, res);
                break;
            case '/api/user/reset-pw':
                this.requestPWReset(req,res);
                break;
        }
    }

    async loginUser(req, res){
    }

    getBody(req){
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (data) => {
                body += data;
                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6){
                    request.connection.destroy();
                }
            });
            req.on('end', () => {
                let data = null;
                try{
                    data = JSON.parse(body);
                }catch(e){
                    data = e
                }
                resolve(data??body);
            });
        });
    }

    async inviteUser(request, res){
        // console.log(req);
        const data = await this.getBody(request)
        // console.log(test);
        // console.log(JSON.parse(post));
        // use post['blah'], etc.
        if(!data?.email?.length){
            this.jsonError(401,'no email provided',res);
            return;
        }
        const ROLE_ID = "d680f14d-0c72-4f9c-a737-ffc86c517e6b";
        let invite_response = await this?.directus?.users?.invites?.send(data?.email,ROLE_ID)?.then(_invite_response=>{
            console.log(_invite_response);
            this.jsonResponse({success:true},res);
        })?.catch(err=>{
            console.log(err);
            this.jsonError(500,err,res);
        });
    }

    async requestPWReset(req,res){
        const data = await this.getBody(req)
        await this.directus.auth.password.request(data?.email)
            .then((_res) => {
                console.log(_res)
                this.jsonResponse({success:true},res);
			})
			.catch((err) => {
				this.jsonError(500,err,res);
			});
    }

    getState(req, res){
        this.state = this.getStateFromDisk() ?? this.freshState();
        this.jsonResponse(this.state,res);
    }

    jsonError(code,message,res){
        res.statusCode = code;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({error:message}));
    }

    jsonResponse(data,res){
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    }

    async getGame(req, res){
        let game_id = req.url.split('/')[3];
        const privateData = await directus.items('Games').readByQuery({ filterBy:{id:game_id} })
        // todo save to caching layer
        this.jsonResponse(privateData,res);
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