import {
    performance
} from 'perf_hooks';
class ServerGame{
    constructor(){
        this.clients = {};
        this.rooms = {};

        // heartbeat
        this.ping_interval = setInterval(()=>{
            this.ping();
        },1000);

        // create a default room for now
        this.rooms.default = {
            players: [], // client ids
            scene: {
                camera: {
                    type: 'PerspectiveCamera', // todo use consts
                    fov: 60,
                    aspect: 1,
                    near: 0.1,
                    far: 1000,
                    position: {
                        x: 0,
                        y: 10,
                        z: -1.5
                    }
                },
                lights: {
                    ambient: {
                        color: 0xffffff,
                        intensity: 0.4
                    },
                    directional: {
                        color: 0xcceeff,
                        intensity: 0.9,
                        castShadow: true,
                        shadow: {
                            mapSize: {
                                width: 1024,
                                height: 1024
                            }
                        },
                        position: {
                            x: 5,
                            y: 5,
                            z: 5
                        }
                    }
                },
                tabletop: {

                },

            }
        }
    }

    onClientJoin(client_id,ws){
        this.clients[client_id] = {
            id: client_id,
            public_id: client_id, // todo public id vs. private id
            // otherwise players could impersonate other players
            ws
        }
        console.warn('add player to Room');
        ws.send(JSON.stringify({
            message: 'WELCOME',
            your_client_id: client_id
        }))
        this.notifyAllClients({
            message:"NEW_CLIENT_CONNECTED",
            new_client_id:client_id
        });
    }

    onClientLeave(client_id){
        console.log('client disconnected',client_id)
        delete this.clients?.[client_id];
    }

    onClientMessage(client_id,message){
        message = ''+message;
        console.log('client says',client_id,message)
    }

    onClientError(client_id,error){
        console.error(client_id,'client_error',error)
    }

    notifyAllClients(message){
        for(let client_id in this.clients){
            this.clients?.[client_id]?.ws?.send(JSON.stringify(message));
        }
    }

    ping(){
        this.notifyAllClients({
            message:'PING',
            time: performance.now(),
            server_client_ids: Object.keys(this.clients)
        })
    }
}


export default ServerGame