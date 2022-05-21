import PeerConnections from './PeerConnections.mjs';

// This example uses THREE.CatmullRomCurve3 to create a path for a custom Keyframe Track position animation.
// AnimationClip creation function on line 136

if (typeof module !== 'undefined' && module?.hot) {
  module?.hot?.accept('./client3d.mjs', function () {
    // Do something with the updated library module...
    console.log('on hot update 1')
  });
}

// or
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./client3d.mjs', function () {
    // Do something with the updated library modue…
    console.log('on hot update 2')
  });
}

import {createApp} from 'vue'
import App from './components/app.vue';
// Uncomment line 173 to see the curve helper
console.clear();
// Global Variables
var canvas, scene, renderer, camera;
var controls, raycaster, mouse, txtLoader, clock, delta = 0;
// track mouse down coord
// so that in click handler,
// we can ignore flipping the card
// if the user was dragging the camera
var mouseDownCoord = {x:0,y:0}
var mouseClickCoord = {x:0,y:0}
// var ground;

async function delay(t){
    return new Promise(resolve => setTimeout(resolve, t));
}

THREE.VertexColorShader = {

  uniforms: {
  },
  vertexShader: [
      "varying vec3 vColor;",
      "void main() {",
      "vColor = color;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
  ].join("\n"),
  fragmentShader: [
      "varying vec3 vColor;",
      "void main( void ) {",
      "gl_FragColor = vec4( vColor.rgb, 1. );",
      "}"
  ].join("\n")
};

const colorDark = new THREE.Color( 0xb0b0b0 );
const colorLight = new THREE.Color( 0xffffff );
const animationDuration = 0.5; // seconds
const reset_delay = 1000;

const HOST = HOSTNAME;
const WEB_PORT = HTTP_PORT;
const PORT = WS_PORT;
const WSHOSTNAME = WS_HOSTNAME;
console.log('hostname?port?',[
    `${WSHOSTNAME}`,
    // `${HOST}`,
    `${PORT}`
])

import { Directus } from '@directus/sdk';
class SocketConnection{
    constructor(){
        //this.connectWS();
    }
    connectWS(){
      this.client_id = null;
      window.t.app.my_client_id = null;
      try{
          this.ws = new WebSocket(`wss://${WSHOSTNAME}:${WEB_PORT}`);

          this.ws.addEventListener("open", () =>{
              console.log("We are connected");
              //this.ws.send("How are you?");
          });
          this.ws.addEventListener('error', event => {
              console.error('error',event);
          })
          this.ws.addEventListener('close', event => {
            console.log('ws connection closed. server restarted?')
            // reconnect...
            setTimeout(()=>{
              this.connectWS();
            },1000);
          })
          this.ws.addEventListener('message',  this.onServerMessage);
      }catch(e){
          console.error(e);
      }
    }
    onServerMessage(event){
      //console.log(event);
      let decoded = null;
      try{
          decoded = JSON.parse(event.data);
      }catch(e){
          console.error(e,event.data)
      }
      if(
        decoded?.type !== 'PING'
        && decoded?.type !== 'remotePeerIceCandidate'
        && decoded?.type !== 'mediaAnswer'
        && decoded?.type !== 'iceCandidate'
      ){
          console.log('socket message:',decoded);
          t.app.$refs.app.messages.push(decoded);
      }
      // todo: switch on type not message
      switch(decoded?.type){

          case 'CHAT_MESSAGE':
            t.root.chat_messages.push(decoded);
            break;

          case 'mediaOffer':
            t.peers.onMediaOffer(decoded);
            break;

          case 'mediaAnswer':
            t.peers.onMediaAnswer(decoded);
            break;

          case 'remotePeerIceCandidate':
            t.peers.onRemotePeerIceCandidate(decoded);
            break;

          case 'PING':
              // document.querySelector('.clients .value').textContent = JSON.stringify(decoded.server_client_ids);
              //todo: remove manual linkage:
              //window.t.app.state.client_ids = decoded.client_ids;
              window.t.app.state.hovered_prev = (window?.t?.app?.state?.hovered ?? []).slice();
              window.t.app.state = {
                ...window.t.app.state,
                ...decoded?.state
              }
              break;

          case 'NEW_CLIENT_CONNECTED':
              // could write to t.state, but
              // ping will update us every second of who's connected
              // could show a nice alert that someone joined, tho
              // but that could also be a reaction to a watcher on state.client_ids
              // so, maybe we don't need this event yet
              break;

          case 'CLIENT_LEFT':
              // same as above, client observation can happen via ping's client list
              // todo: pause game? ask if room host wants to end the round, or end the game, or end the room
              break;

          case 'WELCOME':
              // delete old player if we had a previous connection that got reset
              // TODO: player accounts, IP addresses, cookies or something to persist client_ids longer
              if(t.players?.[this.client_id]){
                t.players[this.client_id].destroy()
                delete t.players[this.client_id];
              }
              this.client_id = decoded.your_client_id;
              window.t.app.my_client_id = this.client_id;
              // window.t.app.state.player_type = decoded.player_or_spectator;
              // console.log(
              //   'server says my id is',
              //   this.client_id,
              //   decoded.your_client_id
              // );

              // document.querySelector('.my_client_id .value').textContent = JSON.stringify(this.client_id);

              // request video stream
              // setupVideoStream();
              break;

          // case 'GAME_STATE_UPDATE':
          //     window.t.app.state = {
          //         ...window.t.app.state,
          //         ...decoded?.state
          //     }
          //     break;

          // case 'ROOM_CREATE_SUCCESS':
          //     console.log('room created',decoded);
          //     window.t.app.state.room_id = decoded.room_id;
          //     window.t.app.state.game_id = decoded.game_id;
          //     window.t.app.state.round_id = decoded.round_id;
          //     break;

          case 'ROOM_JOIN_SUCCESS':
              window.t.app.state.room_id = decoded.room_id;
              break;

          case 'ROOM_EXIT_SUCCESS':
              window.t.app.state.room_id = null;
              break;
      }
    }
    send(data){
      data.client_id = t.app.my_client_id;
      if(
        data.type !== 'SET_PLAYER_CURSOR'
        && data.type !== 'SET_PLAYER_HEAD'
        && data.type !== 'HIGHLIGHT'
      ){
        console.log('sending',data,this.client_id,t.app.my_client_id);
      }
      if(!this.ws.readyState === 1){
        console.warn('ws not ready');
        return;
      }
      this.ws.send(JSON.stringify(data));
    }
}

class Player {
    constructor(user_id){
        this.user_id = user_id;
        // todo support multiple hands
        // this.matches = [];
        // this.cards = []; // server tells us what cards the player is holding (t.app.state.player_hands)
        this.pointer = new PlayerPointer(user_id);
        this.head = new PlayerHead(user_id);

        this.hand = new THREE.Group();
        this.hand.name = 'hand_'+user_id;
        t.scene.add(this.hand);

        let handZone = {
          group: this.hand,
          name: 'hand_'+user_id,
        }
        Object.defineProperty(handZone,'origin',{
          get:function(){
            return this.group.position;
          }
        })

        this.hand.position.x = 0;
        this.hand.position.y = 5;
        this.hand.position.z = -9;

        this.hand.rotation.z = THREE.MathUtils.degToRad(180);

        t.game.layout.named_zones['hand_'+user_id] = handZone;
    }
    destroy(){
        this.pointer.destroy();
        this.head.destroy();
    }
}

class SoundsManager{
  constructor(){
    this.muted = false;

    this.sound_map = {
      'flip': './public/sounds/flip.mp3',
    }

  }
  async play(sound_name){
    if(t.root.audio_muted){
      return;
    }
    this.element = document.getElementById('sound_effects')
    console.trace('play sound',this.muted,sound_name,this.sound_map)
    if(!this.muted && this.sound_map?.[sound_name]){
      // this.element.setAttribute('src',this.sound_map[sound_name]);
      this.element.currentTime = 0; // seek to beginning
      await this.element.play();
    }
  }
}

class Cameraman {
    constructor(player_id){
      this.views = {
        'overhead': {
          pos: [0.5073927993672119, 22.50219689922749, -5.4534143171434 ],
          rot: [-1.9037729632057634, -0.0009611380083970662, -3.1388136341032102]
        }
      }
    }
    goToView(view_name){
      t.camera.position.set(...this.views[view_name].pos);
      t.camera.rotation.x = this.views[view_name].rot[0];
      t.camera.rotation.y = this.views[view_name].rot[1];
      t.camera.rotation.z = this.views[view_name].rot[2];
    }
}

// Playfield?
class Tabletop{
    // enable/disable the debug inspector
    toggleDebugInspector(){
      this.debug_inspect_objects = !this.debug_inspect_objects;
    }
    constructor(){
        // t.cameraman
        this.cameraman = new Cameraman();
        // this.cameraman.goToView('overhead');

        this.debug_inspect_objects = false;
        this.debug_inspector_selected_object = null;

        this.client_ignore_clicks = true;
        // table tops have uuids which can be shared / spectated / joined
        this.id = "id"+performance.now();

        // t.server =
        this.server = new SocketConnection();
        // t.sounds =
        this.sounds = new SoundsManager();

        this.peers = new PeerConnections();

        // this.webrtc_peer_connections = {};
        // this.webrtc_peer_streams = {};
        // this.webrtc_peer_video_settings = {};

        this.players = {}; // this is where we keep track of player-related stuff that the server DOESNT stream to us (references to meshes, etc);

        this.deckgroup = new THREE.Group();
        // Object.defineProperty(this.deckgroup.userData,'cardOrigin',{
        //   get:function(){
        //     // cards should be offset by their index within the deck

        //   }
        // });
        this.deckgroup.name = "DeckGroup";
        this.deckgroup.position.x = 5;
        this.deckgroup.position.y = 5;
        this.deckgroup.position.z = -5;
        scene.add(this.deckgroup);

        // playfield cards (intersection group)
        this.zonegroup = new THREE.Group();
        this.zonegroup.name = 'ZoneGroup';
        this.zonegroup.position.y = -0.8
        scene.add(this.zonegroup);
    }

    getMyPlayer(){
      return this.players[t.app.my_client_id];
    }

    getCameraSet(){
      let pos = t.camera.position;
      let rot = t.camera.rotation;
      console.log(`t.camera.position.set(${pos.x},${pos.y},${pos.z});\nt.camera.rotation.x=${rot.x};\nt.camera.rotation.y=${rot.y};\nt.camera.rotation.z=${rot.z};`);
    }

    get opponentIDs(){
      return t.app.state.client_ids.filter(id => id !== t.app.my_client_id);
    }

    setupGame(){
        // Lights
        initLights()

        // Table Top (groundplane)
        initRoomMeshes();

        this.game = new Game_PVPMemory();
    }

    startGame(){
        this.game.startRound();
    }

    // call -> setupRTCPeerConnections -> offerStreamToPeer -> setupRTCPeerConnection

    // todo: do this each time a new client joins?
    // setupRTCPeerConnections(){
    //   for(var i = 0; i<t.app.state.client_ids.length; i++){
    //     let client_id = t.app.state.client_ids[i];
    //     if(client_id !== t.app.my_client_id){
    //       if(!t.webrtc_peer_connections[client_id]){
    //         t.offerStreamToPeer(client_id);
    //       }
    //     }
    //   }
    // }



    closeVideoStream(){
      // t?.stream?.getTracks()?.forEach(function(track){
      //   track?.stop();
      // })
      t?.stream?.getVideoTracks()?.forEach(function(track){
        track.stop();
      })
    }

    closeAudioStream(){
      t?.stream?.getAudioTracks()?.forEach(function(track){
        track.stop();
      })
    }

    // loop through ALL peers and send them the stream
    // TODO: max peers
    async call(){
      await t.peers.setupRTCPeerConnections();
    }

    setupVideoStream(){
      t.root.video_enabled = true;
      return new Promise((resolve,reject)=>{
        if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
          // todo add camera flip (self)
          // add video mute (self/other)
          // add audio mute (self/other)
          const constraints = {
            audio: true,
            video: {
              exposureMode: {ideal:'continuous'},
              exposureCompensation: {ideal:0},
              width: {ideal:1280},
              height: {ideal:720},
              facingMode: 'user'
            }
          };

          navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {

            // NOTE: t.stream === the current client's outbound stream
            // apply the stream to the video element used in the texture
            t.stream = stream;

            t.video.srcObject = stream;
            t.video.play();

            t.players[t.app.my_client_id].head.assignVideoToHead(t.video);

            resolve();

          } ).catch( function ( error ) {

            console.error( 'Unable to access the camera/webcam.', error );

            reject();

          } );

        } else {

          console.error( 'MediaDevices interface not available.' );

          reject();

        }
      });
    }

    /* this gets called with every tick from the server */
    // maybe we throttle it
    updatePlayerInstances(){
      // make sure we have a instance of a Player class
      // to represent this player
      for(let i in t.app.state.user_ids){
        let user_id = t.app.state.user_ids[i];
        if(!t.players?.[user_id]){
          t.players[user_id] = new Player(user_id);
        }
      }
      // destroy player if they left
      for(let user_id in t.players){
        if(t.app?.state?.user_id?.indexOf(user_id) === -1){
          t.players[user_id].destroy();
          delete t.players[user_id];
        }
      }
    }

    /*
    // animate the cards within the hand to maintain spacing
    // also handles animating cards from playfield to hand after a match is validated by the server
    updateCardsInHand(){
      //camera.attach(t.cards[i_card_a].mesh)
      //camera.attach(t.cards[i_card_b].mesh)

    //   cards[i_card_a].position.set(0,-.5,-1)
    //   cards[i_card_a].scale.set(.1,.1,.1)
    //   cards[i_card_a].rotation.set(1,Math.PI,Math.PI,'XYZ')

    //   cards[i_card_b].scale.set(.1,.1,.1)
    //   cards[i_card_b].position.set(-.1,-.5,-1)
    //   cards[i_card_b].rotation.set(1,Math.PI,Math.PI,'XYZ')
      //const current_player = t.game.current_player;
      for(let i in t.app.state.client_ids){
        let player_id = t.app.state.client_ids[i];
        console.log('updating hands',player_id);
        // let player = t.players[player_id];
        const hand = t.app.state?.player_hands?.[player_id] ?? [];
        let matches_count = hand.length/2;
        // console.log('matches_count?',matches_count);
        for(let a = 0; a<hand?.length ?? 0; a++){
          let i_card = hand[a];
          let card = t.cards[i_card];
          camera.attach(card.mesh); // todo: only run this once (if parent isnt already camera)


          let updateTo = player_id === t.app.my_client_id
            ? this.getUpdateToPlayersHand(player_id,a)
            : this.getUpdateToOpponentsHand(player_id,a);
          console.log(updateTo);
          // TODO: cancel any existing tween
          // TODO: prevent tweens from piling up
          if(!card.tweenedToHand){
            card.tweenedToHand = true;
            card.current_tween = card.tweenTo(updateTo,{duration:300})
          }
        }
      }

      // TODO: animate cards that are in OTHER players hand...
    }
    */

    updatePlayerCursors(){
      // TODO: change this to be a continuous tweening function like
      // cardsToZones
      for(let i in t.app.state.player_cursors){
        let player_cursor_position = t.app.state.player_cursors[i];
        // console.log(i===t.app.,player_cursor_position);
        if(i !== t.app.my_client_id){
          // console.log('update opponent cursor');
          // only update other players, let mousemove drive local players cursor so it doesn't fight with server-streaming values
          t?.players?.[i]?.pointer?.tweenTo({
            pos_x: player_cursor_position.x,
            pos_y: player_cursor_position.y,
            pos_z: player_cursor_position.z,
          },{duration:'distance'});
        }
      }
    }

    // TODO: change this to be a continuous tweening function like
    // cardsToZones
    updatePlayerHeads(){
      for(let player_id in t.app?.state?.player_heads){
        // let player_id = t.app.state.client_ids[i];
        if(player_id !== t.app.my_client_id){
          // only render opponent heads
          let player_head_position = t.app.state.player_heads[player_id];
          const destination = {
            pos_x: player_head_position.x * -1.0,
            pos_y: Math.max(player_head_position.y - 6.0, 2.0),
            pos_z: player_head_position.z * -1.0,
          };
          // var vector = new THREE.Vector3(0, 0, -1);
          // vector.applyEuler(camera.rotation, camera.rotation.order);
          // destination.rot_x = vector.x;
          // destination.rot_y = vector.y;
          // destination.rot_z = vector.z;

          const head = t?.players?.[player_id]?.head;
          if(!head?.player_is_me){
            head?.mesh.lookAt(camera.position);
          }
          // console.log('updating player head',
          // player_head_position,
          // destination)
          // IF IS OPPONENT flip x,z
          // IF IS SPECTATOR leave x,z alone
          head?.tweenTo(
            destination,
            {
              // duration:'distance'
              duration:300
            }
          );
        }
      }
    }

    // getUpdateToPlayersHand(player_id,a){
    //   const hand = t.app.state?.player_hands?.[player_id] ?? [];
    //   let matches_count = hand.length/2;
    //   let even = a % 2 == 0;
    //   let lerp_max = .07 * matches_count
    //   let updateTo = {}
    //   updateTo.pos_x = lerp(
    //     0, // 0 basis
    //     lerp_max, // lerp max width
    //     (1/matches_count)*(even?a+1:a+2)) // % of lerp
    //     -(even?.1:.105) // slight offset for "paired" card
    //     -(a*.01) // padding between cards
    //     -(lerp_max) // center
    //     +(.05)
    //   updateTo.pos_y = -0.5 + (0.001 * a);
    //   updateTo.pos_z = -1.0 + (0.001 * a);

    //   updateTo.rot_x = 0.5;//1;
    //   updateTo.rot_y = Math.PI;
    //   updateTo.rot_z = Math.PI;

    //   updateTo.scale_x = .09 * .65
    //   updateTo.scale_y = .09
    //   updateTo.scale_z = .09 //
    //   return updateTo;
    // }

    // getUpdateToOpponentsHand(player_id,a){
    //   // let player = t.players[player_id];
    //   const hand = t.app.state?.player_hands?.[player_id] ?? [];
    //   let matches_count = hand.length/2;
    //   let even = a % 2 == 0;
    //   let lerp_max = .07 * matches_count
    //   let updateTo = {}
    //   updateTo.pos_x = lerp(
    //     0, // 0 basis
    //     lerp_max, // lerp max width
    //     (1/matches_count)*(even?a+1:a+2)) // % of lerp
    //     +(even?.1:.105) // slight offset for "paired" card
    //     +(a*.01) // padding between cards
    //     +(lerp_max) // center
    //     -(.05)
    //   updateTo.pos_y = 0.5 + (0.001 * a);
    //   updateTo.pos_z = 1.0 + (0.001 * a);

    //   updateTo.rot_x = 0.5;//1;
    //   updateTo.rot_y = Math.PI;
    //   updateTo.rot_z = -Math.PI;

    //   updateTo.scale_x = .09 * .65
    //   updateTo.scale_y = .09
    //   updateTo.scale_z = .09 //
    //   return updateTo;
    // }

    get deck(){
        return this.game.decks.default;
    }
    get cards(){
        return this.deck.cards;
    }

    // debugging thing for host only
    returnCardsToDeck(){
      t.server.send({
        type:'RETURN_CARDS_TO_DECK',
      })
    }




}

class TweenableMesh{

  constructor(player_id){
    this.player_id = player_id;
    this.tweening = false;
    this.setupTexturesAndMaterials();
    this.setupMesh();
    scene.add(this.mesh);
  }

  async tweenTo(destination,{duration=1000}){
    // console.log('tweenTo',destination);
    this.destination = destination;

    // todo: accept option to stop,finish,queue tweens
    if(this.tweening){
      // console.log('already tweening. should we cancel or finish or block?');
        return false;
    }else{
      // console.log('tweening cursor...');
    }

    let _mesh = this.mesh;
    if(!_mesh){
      console.error('mesh not found',this);
      return;
    }

    this.tweening = true;

    // TODO: add ability to include/exclude properties from tween to save overhead

    // let tweenMid = null;
    // if(options && options.arcTo){
    //     // optional midpoint
    //     tweenMid = getMeshTween(_mesh,options.arcTo,300/2);
    // }

    // magintude
    let magnitude = this?.mesh?.position?.distanceTo(
      new THREE.Vector3(
        destination?.pos_x ?? this?.mesh?.position?.x,
        destination?.pos_y ?? this?.mesh?.position?.y,
        destination?.pos_z ?? this?.mesh?.position?.z
      )
    );
    if(duration === 'distance'){
      // console.log('magnitude',magnitude);
      duration = lerp(50,1000,(magnitude/6));
      // console.log('duration',duration)
    }

    if(magnitude<0.1){
      this.tweening = false;
      return;
    }

    let tweenEnd = getMeshTween(_mesh,destination,{
        duration,
        // easing:TWEEN.Easing.Linear.None, //Quadratic.Out,
        easing:TWEEN.Easing.Quadratic.InOut, //Quadratic.Out,
        // todo accept easing option
    });

    // this.tween = tweenMid ? tweenMid.chain(tweenEnd).start() : tweenEnd.start();
    this.tween = tweenEnd.start();

    await delay(duration);

    // run the tween
    this.tweening = false;
  }

  setupTexturesAndMaterials(){
    // override this...
  }

  destroy(){
    scene.remove(this.mesh);
    this.mesh = null;
    clearInterval(this.updateInterval);
  }
}
class PlayerHead extends TweenableMesh {
  constructor(player_id){
    super(player_id);
    // this.updateInterval = setInterval(()=>{
    //   this.mesh.material.color.setHex(
    //     this.player_id === t.app.state?.game_host ? 0x00ff00 : 0xffff00
    //   )
    // },1000);
  }
  get player_is_me(){
    return this.player_id === t.app.state?.my_client_id;
  }
  setupTexturesAndMaterials(){
    // if(this.player_is_me){
      // console.warn('todo: need to set up opponent webcam texture as well as spectator webpack textures')
    // }
  }
  assignVideoToHead(video){
    // video settings
    let settings = video.srcObject.getVideoTracks()[0].getSettings()
    let ar = settings.width / settings.height;
    this.mesh.scale.set(ar, 1, 1)
    this.video_texture = new THREE.VideoTexture(video); // webcam stream
    this.video_texture.format = THREE.RGBAFormat;
    this.video_material = new THREE.MeshBasicMaterial({
      // color: 0x800080,
      // color: this.player_id === t.app.state?.game_host ? 0x00ff00 : null, // yellow 0xffff00
      // wireframe: true,
      // transparent: this.player_is_me ? true : false,
      opacity: this.player_is_me ? 0.0 : 1.0,
      transparent: this.player_is_me ? true : false,
      map: this.video_texture,
      side: THREE.DoubleSide,
    })
    this.mesh.material = this.video_material;
  }
  setupMesh(){
    this.mesh = new THREE.Mesh(
      // new THREE.SphereGeometry(4.0,8,8),
      new THREE.PlaneGeometry( 16, 16 ),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        // color: this.player_id === t.app.state?.game_host ? 0x00ff00 : null, // yellow 0xffff00
        // wireframe: true,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: this.player_is_me ? 0.0 : 1.0,
        transparent: this.player_is_me ? true : false
        // map: this.video_texture,
      })
    )
    this.mesh.lookAt(camera.position);
    // this.mesh.scale.setScalar(.5)
    this.mesh.position.setScalar(0);
    this.mesh.name = 'player_head_'+this.player_id;
    if(this.player_is_me){
      // this.mesh.position.set(camera.position);
      // let pos = new Vector3();
      // camera.getWorldPosition(pos);
      headUpdateFN(camera.position);

      this.mesh.position.y = 17;
      this.mesh.position.x = 0;
      this.mesh.position.z = -15;

      this.mesh.rotation.x = 0;
      this.mesh.rotation.y = THREE.MathUtils.degToRad(180)
      this.mesh.rotation.z = THREE.MathUtils.degToRad(0)
    }else{
      // this.mesh.position.set(camera.position);
      // this.mesh.position.x = camera.position.x * -1;
      // this.mesh.position.y = camera.position.y;
      // this.mesh.position.z = camera.position.z * -1;
    }
    // this.mesh.rotation.z = Math.PI/2;
  }
}

class PlayerPointer{
  constructor(player_id){
    this.player_id = player_id;
    this.setupTexturesAndMaterials();
    this.setupMesh();
    console.warn('new player pointer');
    scene.add(this.mesh);

    this.updateInterval = setInterval(()=>{
      this.mesh.rotation.y -= .01;
      // todo: call this only on host change
      this.mesh.material.color.setHex(
        this.player_id === t.app.state?.player_turn ? 0x0000ff : 0xff0000
      )
    },16)
  }
  async tweenTo(destination,{duration=1000}){
    this.destination = destination;
    if(this.tweening){
      // console.log('already tweening. should we cancel or finish or block?');
        return false;
    }else{
      // console.log('tweening cursor...');
    }

    let _mesh = this.mesh;
    if(!_mesh){
      // console.error('mesh not found',this);
      return;
    }

    this.tweening = true;

    // TODO: add ability to include/exclude properties from tween to save overhead


    // let tweenMid = null;
    // if(options && options.arcTo){
    //     // optional midpoint
    //     tweenMid = getMeshTween(_mesh,options.arcTo,300/2);
    // }

    // magintude
    let magnitude = this?.mesh?.position?.distanceTo(
      new THREE.Vector3(
        destination?.pos_x ?? this?.mesh?.position?.x,
        destination?.pos_y ?? this?.mesh?.position?.y,
        destination?.pos_z ?? this?.mesh?.position?.z
      )
    );
    if(duration === 'distance'){
      // console.log('magnitude',magnitude);
      duration = lerp(50,1000,(magnitude/6));
      // console.log('duration',duration)
    }

    if(magnitude<0.1){
      this.tweening = false;
      return;
    }

    let tweenEnd = getMeshTween(_mesh,destination,{
        duration,
        // easing:TWEEN.Easing.Linear.None, //Quadratic.Out,
        easing:TWEEN.Easing.Quadratic.InOut, //Quadratic.Out,
        // todo accept easing option
    });

    // this.tween = tweenMid ? tweenMid.chain(tweenEnd).start() : tweenEnd.start();
    this.tween = tweenEnd.start();

    await delay(duration);

    // run the tween
    this.tweening = false;
  }
  setupTexturesAndMaterials(){

  }
  setupMesh(){
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(.5,4,4),
      new THREE.MeshBasicMaterial({
        color: this.player_id === t.app.state?.game_host ? 0x0000ff : 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      })
    )
    this.mesh.name = "pointer";
    // this.mesh.rotation.z = Math.PI/2;
  }

  destroy(){
    scene.remove(this.mesh);
    this.mesh = null;
    clearInterval(this.updateInterval);
  }
}

class Card {
    constructor(index,type){
        this.index = index;
        // http://'+HOST+':'+PORT+'
        this.front_image = './public/images/decks/fruits/'+type+'.JPG';
        this.deck_order_index = index; // what order is this card in the deck's available cards array? (saves repeat indexOf calls)
        this.setupTexturesAndMaterials();
        this.setupMesh();
        this.destination = {};

        // Animation
        this.face_up = false;
        this.mesh.faceUp = false;
        this.mesh.userData.card_id = index;
        // this.mesh.mixer = new THREE.AnimationMixer( this.mesh );
        // var flipUpsideClip = createFlipUpsideClip(this.mesh,'faceup');
        // var flipDownsideClip = createFlipUpsideClip(this.mesh,'facedown');
        // this.mesh.actions.flipUpside.loop = THREE.LoopOnce;
        // this.mesh.actions.flipDownside.loop = THREE.LoopOnce;
        // this.mesh.actions.flipUpside.clampWhenFinished = true;
        // this.mesh.actions.flipDownside.clampWhenFinished = true;

        //this.meshs.push(this.mesh);
        //scene.add( this.mesh );
        t.deckgroup.attach(this.mesh);

        // console.log({
        //   index,
        //   image:this.front_image,
        //   // pair_id:this.pair_id
        // });

    }

    setupMesh(){
        this.mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry( 2.5 , 0.02 , 3.5 ),
            [
                this.darkMaterial, // left
                this.darkMaterial, // right
                this.faceDownMaterial, // facedown
                this.faceUpMaterial, // faceup
                this.darkMaterial, // top
                this.darkMaterial, // bottom
            ]
        );

        // this.mesh.scale.x = 0.65;
        // let offset = {x:3,y:3}
        // this.mesh.position.set(
        //     (2*irow)-offset.x,
        //     0,
        //     (2*icol)-offset.y+(icol*0.5)
        // )
        this.mesh.position.y = this.index * 0.025; // offset by card thickness
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    setupTexturesAndMaterials(){
        // The Card
        // 'https://images-na.ssl-images-amazon.com/images/I/61YXNhfzlzL._SL1012_.jpg'
        this.faceUpTexture = txtLoader.load(this.front_image);
        // back image
        // this.faceDownTexture = txtLoader.load('https://vignette3.wikia.nocookie.net/yugioh/images/9/94/Back-Anime-2.png/revision/latest?cb=20110624090942');
        // this.faceDownTexture = txtLoader.load('./public/images/default-back.jpg');
        this.faceDownTexture = txtLoader.load('./public/images/decks/fruits/BACK.jpg');
        // faceUpTexture.flipY = false;
        this.darkMaterial = new THREE.MeshBasicMaterial({
          color: 0x111111,
          side: THREE.FrontSide
        });
        this.faceUpMaterial = new THREE.MeshBasicMaterial({
            color: colorDark,
            map: this.faceUpTexture,
            // shininess: 40,
            side: THREE.FrontSide
        });
        this.faceDownMaterial = new THREE.MeshBasicMaterial({
            color: colorDark,
            map: this.faceDownTexture,
            // shininess: 40,
            side: THREE.FrontSide
        });
    }

    // used to move a card from a deck to a zone or a player hand
    // note you can use options{arc:true,arcTo:{}} to move the card in an arc (basically just adds an intermediate keyframe point to the curve)
    async tweenTo(destination,options){
        // console.log('card move to point',destination,options);
        // this generates a tween between the current position and the destination
        this.destination = destination;
        let priority = options?.priority ?? 3; // 1-4 default: 3
        if(this.tweening){
          // console.log('already tweening. should we cancel or finish, block, or queue?',priority);
          if(priority === 4){
            // tween is low priority, we can ignore it
            return;
          }
        }
        this.current_tween_priority = priority;
        let _mesh = this.mesh;
        let tweenMid = null;
        let duration = options?.arcTo ? 300/2 : 300;
        // TODO: bring back curve-based / mixer based animation
        // if(options && options.arcTo){
        //     // optional midpoint
        //     tweenMid = getMeshTween(_mesh,options.arcTo,300/2);
        // }
        // TODO: add ability to include/exclude properties from tween to save overhead
        let tweenEnd = getMeshTween(
          _mesh,
          destination,
          {
            duration,
            // todo accept easing option
          });
        if(priority === 3){
          // priority_level_3 === chain onto the current tween
          if(this.tweening && this.tween && !this.tween.stopped){
            // can we chain on a running track?
            // if not, push into a queue we call when original tween ends...
            this.tween.onComplete(()=>{
              this.tween = tweenEnd;
              this.tweening = true;
              this.tween.onComplete(()=>{
                // console.log(this.tween);
                this.tweening = false;
              })
              this.tween.start();
            });
            // await delay(duration);
            // TODO: put this in a callback
            // this.tweening = false;
            return;
          }
        }

        if(priority === 2){
          // jump the tween to the last frame, then do the next tween
        }

        // ELSE assume priority 1
        // interupt the current tween
        this?.tween?.stop();
        this.tween = tweenMid ? tweenMid.chain(tweenEnd) : tweenEnd;
        this.tweening = true;
        this.tween.onComplete(()=>{
          // console.log(this.tween);
          this.tweening = false;
        })
        this.tween.start();

        // await delay(duration);

        // run the tween
        // this.tweening = false;
    }

    setDestination(destination){
      this.destination = destination;
    }
}
class Deck{
    constructor(options){
        this.cards = [];
        // list of card indexes that are still "in the deck"
        //not held by a layout zone or a player hand
        this.available_cards = [];

        // since we're animating the shuffles,
        // we keep track of each change to the array
        // would also allow us to add a undo/redo + replay feature
        // but for now it's just for checking the previous order versus the current order
        this.available_cards_history = [];

        this.card_types = [
          'APPLE',
          'ORANGE',
          'LEMON',
          'PEAR',
          'BLUEBERRY',
          'GRAPES',
          'RASPBERRY',
          'STRAWBERRY',
        ];

        for(var i=0; i<options?.card_count ?? 52; i++){
          const new_card = new Card(i,this.card_types[i%2===0?i/2:(i-1)/2])
            this.cards.push(new_card);
            t.deckgroup.add(new_card.mesh);
            this.available_cards.push(i);
        }
    }
    // NOTE: server drives shuffling now...
    // todo allow shuffling indefinitely until player clicks to stop
    // async shuffle(iterations=3){
    //     if(this.shuffling){
    //         return;
    //     }
    //     this.shuffling = true;
    //     for(var i=0; i<iterations; i++){
    //         let final_available_cards = await this.shuffleOnce(this.available_cards);
    //         this.available_cards = final_available_cards;
    //     }
    //     this.shuffling = false;
    // }
    // server drives shuffle now
    // async shuffleOnce(array){
    //     var m = array.length, t, i;

    //     // While there remain elements to shuffle…
    //     while (m) {

    //         // snapshot the array
    //         this.available_cards_history.push(array.slice());

    //         // Pick a remaining element…
    //         i = Math.floor(Math.random() * m--);

    //         // And swap it with the current element.
    //         t = array[m];
    //         array[m] = array[i];
    //         array[i] = t;

    //         this.cards[array[m]].deck_order_index = m;
    //         this.cards[array[i]].deck_order_index = i;

    //         // animate the shuffled cards coming off the top
    //         // and sliding back into the deck
    //         this.animateOrderChangeAsShuffle(
    //             array[i],
    //             array[m],
    //             i,
    //             m
    //         );
    //         // artificially delay the shuffling
    //         await delay(3);
    //     }


    //     return array;
    // }
    // animateOrderChangeAsShuffle(iCardA,iCardB,indexA,indexB){
    //     //console.log('animating swap of A and B',iCardA,iCardB,indexA,indexB);

    //     const cardA = this.cards[iCardA];
    //     cardA.tweenTo({
    //         pos_x:0,//cardA.mesh.position.x,
    //         pos_y:indexB * 0.025, // offset by card thickness + minor gap
    //     },{
    //         duration: 150,
    //         arcTo:{
    //             pos_x:'-2.6', // camera left, screen right
    //             // y:'+1',
    //         }
    //     });
    //     const cardB = this.cards[iCardB];
    //     cardB.tweenTo({
    //         pos_x:0,//cardB.mesh.position.x,
    //         pos_y:indexA * 0.025, // offset by card thickness + minor gap
    //     },{
    //         duration: 150,
    //         arcTo:{
    //             pos_x:'+2.6', // camera right, screen left
    //             // y:'+1',
    //         }
    //     });

    //     // by default card order updates do nothing to their position
    //     // if this was reactive, every modification to this.available_cards (aka the card order of the remaining cards in the deck) would trigger a property update
    //     // then we would watch those properties and either update z-depth instantly
    //     // or with a transition tween
    //     // in this case, we'd want a SPECIAL tween, not just a linear tween of cards phasing thru each other
    //     // to give it more physicality we want to animate the cards moving off the top of the deck and then back in
    // }
    // async dealToLayout(layout){
    //     // for each zone in passed layout
    //     // if there is no card in the zone
    //     // pick the top card from the deck
    //     // and place it in the zone

    //     // TODO: support multiple cards per zone (think klondike solitaire)
    //     console.log('dealToLayout',this);
    //     // for(let izone in layout.zones){
    //     //     let zone = layout.zones[izone];
    //     //     if(!zone.card){
    //     //         let card_index = this.available_cards.pop();
    //     //         zone.card = card_index;
    //     //         this.cards[card_index].zone = izone;
    //     //         // ...
    //     //     }
    //     // }
    //     // todo: if game is already in progress, skip DEAL animation...
    //     for(let iA in t.app.state.available_cards){
    //       let iCard = t.app.state.available_cards[iA];
    //       let card = t.app.state.cards[iA];
    //       if(card.zone){
    //         let zone = layout.zones[card.zone];
    //         zone.card = iCard;
    //         // remove card from deckgroup, attach it back to zonegroup (playfield group for mousemove intersections)
    //         t.zonegroup.attach(t.cards[iCard].mesh);
    //         t.cards[iCard].tweenTo(
    //             {
    //                 pos_x: zone.origin.x,
    //                 // todo offset by num cards already in the zone
    //                 pos_y: zone.origin.y,
    //                 pos_z: zone.origin.z
    //             },
    //             {
    //                 duration: 1000,
    //             }
    //         );
    //         //console.warn('todo, settle ypos of cards in deck as cards are removed')
    //         //console.warn('todo deal from other end of array?')
    //         await delay(150); // slight delay in dealing
    //       }
    //     }
    // }
    // async tweenCardsToDeck(){
    //   for(let i in t.cards){
    //     let card = t.cards[i];
    //     if(card.mesh){
    //       t.deckgroup.attach(card.mesh);
    //       card?.tweenTo({
    //         pos_x: t.deckgroup.position.x,
    //         pos_y: t.deckgroup.position.y + (i*0.025),
    //         pos_z: t.deckgroup.position.z
    //       },{
    //         duration: 1000,
    //       });
    //     }else{
    //       // console.error('failed to tween card to deck',i)
    //     }
    //   }
    // }

    // changing this to loop thru cards, rather than zones
    // todo: how to handle delaying the animation of the cards moving from the deck to the playfield during "dealing?"
    async tweenCardsToZones(){
      for(let i in t.app.state.cards){
        let server_card = t.app.state.cards[i];
        let card = t.cards[i];
        if(card?.mesh){
          let zone = getCardZone(server_card);
          // console.log('zone?',server_card.zone);
          // console.log(card.parent);
          if(zone){
            // console.log(zone.group.name,card.mesh.parent?.name)
            if(card.mesh?.parent?.name !== zone.group.name){
              console.log(card.mesh?.parent?.name,zone.group.name);
              card.zone_last_changed = performance.now();
              card.prev_zone_name = card.mesh?.parent?.name;
              card.current_zone_name = zone.group.name;

              // when should we attach vs. add here?
              zone.group.attach(card.mesh);

              // why is this timeout needed
              setTimeout(()=>{
                // why is the card scale being affected?
                card.mesh.scale.setScalar(1);
              },10)

              // what is our offset at switch time?
              var v = new THREE.Vector3();
              v.copy(card.mesh.position);
              card.mesh.localToWorld(v);
              zone.group.worldToLocal(v);
              // console.log(v);
            }
            // debugger;

            // zone.group.attach(card.mesh);

            // wonder how we can do this locally
            // like... we attach, then it'll be offset from teh group
            // then, we just always tween to a zero position,
            // to assume the parent groups world position
            // our destination:
            // let DEST_POS = {x: 0,y:0,z:0}
            let DEST_POS = {...zone.origin};
            if(zone.getCardOffset){
              let offset = zone.getCardOffset(card);
              DEST_POS.x += offset.x;
              DEST_POS.y += offset.y;
              DEST_POS.z += offset.z;
            }

            let distX = DEST_POS.x - card.mesh.position.x;
            let distY = DEST_POS.y - card.mesh.position.y;
            let distZ = DEST_POS.z - card.mesh.position.z;

            // delay when going from deck to table ("dealing")
            let delay =
              card.prev_zone_name === 'DeckGroup'
              && zone.group.name === 'ZoneGroup'
              ? card.index * 100
              : 0;
            let delta = performance.now() - card.zone_last_changed;

            if(Math.abs(distX)>0.01){
              let speed = Math.max(0.01,Math.abs(distX)/2);
              if(delay && delta>delay){
                let _speed = speed > Math.abs(distX) ? Math.abs(distX) : speed;
                card.mesh.position.x += distX > 0 ? _speed : -_speed;
              }
            }
            if(Math.abs(distY)>0.01){
              let speed = Math.max(0.01,Math.abs(distY)/2);
              if(delay && delta>delay){
                let _speed = speed > Math.abs(distY) ? Math.abs(distY) : speed;
                card.mesh.position.y += distY > 0 ? _speed : -_speed;
              }
            }
            if(Math.abs(distZ)>0.01){
              let speed = Math.max(0.01,Math.abs(distZ)/2);
              if(delay && delta>delay){
                let _speed = speed > Math.abs(distZ) ? Math.abs(distZ) : speed;
                card.mesh.position.z += distZ > 0 ? _speed : -_speed;
              }
            }
          }
          // card.tweenTo({
          //   pos_x: zone.origin.x,
          //   pos_y: zone.origin.y,
          //   pos_z: zone.origin.z
          // },{
          //   duration: 1000,
          // });
        }
      }
    }
    //   for(let i in t.game.layout.zones){
    //     let zone = t.game.layout.zones[i];
    //     let card = null;
    //     //cardforzone
    //     for(let j in t.app.state.cards){
    //       let c = t.app.state.cards[j];
    //       if(c.zone == i){
    //         card = t.cards[j]; // our LOCAL card (not the server-managed representation)
    //         card.zone = i;
    //         break;
    //       }
    //     }
    //     // remove card from deckgroup, attach it back to zonegroup (playfield group for mousemove intersections)
    //     if(card?.mesh && zone.group){
    //       zone.group.attach(card.mesh);
    //     }
    //     // console.log('tween card to zone',card);
    //     card?.tweenTo({
    //       pos_x: zone.origin.x,
    //       pos_y: zone.origin.y,
    //       pos_z: zone.origin.z
    //     },{
    //       duration: 1000,
    //     });
    //     await delay(150);
    //   }
    // }
}
class Move{
    constructor(payload){
        this.payload = payload;
        // this.player
        // this.card
        // this.from
        // this.to
        // this.action_score
    }
}
class Round{
    constructor(){
        this.moves = [];
        //this.players = [];
        // for(let i=0; i<t.players.length; i++){
        //     // initialize player for round
        //     this.players.push({
        //         score: 0,
        //         cards: [],
        //         matches: []
        //     })
        // }
        // console.warn('round players');
        // this.player_moves
        // this.player_scores
        // this.player_cards
        // this.player_matches
        // this.player_hands
    }
    async start(){
        console.log('round start','deck',window.t.deck);

        // center the deck

        // animate the camera
        getMeshTween(camera,{
            // pos_y: '+5'
            pos_x: 0.9592052270385086,
            pos_y: 20.10683366362212,
            pos_z: -21.162843075112743,

            rot_x: -2.3105348483091284,
            rot_y: 0.01905053709490307,
            rot_z: 3.120722166273759
        },{
            duration: 1000,
            onTick:()=>{
              updatePlayerHead();
            }
        }).start();

        await delay(1000);

        // shuffle the deck at the start of each round
        // server does this now
        // TODO: we still need to do a dummy animation
        //await window.t.deck.shuffle();

        //await delay(1000);

        // move the deck out of the way
        getMeshTween(t.deckgroup,{
            pos_x: '-8',
        },{
            duration: 1000,
            easing: TWEEN.Easing.Quadratic.Out
        }).start();

        await delay(1000);

        // NOTE: server drives dealing of cards now
        // just by setting card.zone
        // then the client watches for zone changes and tweens
        // deal the cards
        // for symmetry could allow calling t.game.layout.dealFromDeck(deck)
        // await window.t.deck.dealToLayout(
        //     window.t.game.layout
        // )
    }
    recordMove(move){
        this.moves.push(move);
        // todo this.players[move.player].score += move.action_score;
    }
    onRoundEnd(cb){
        this.on_round_end_callback = cb;
    }
    get current_player(){
        return t?.players?.[t.app.state?.player_turn]
    }
}
class Layout{
    constructor(options){
        this.zones = []; // our grid of zones (main playfield)

        // our special named zones
        this.named_zones = {};

        // todo: subclass Grid Layout
        this.options = options;
        // distance between cards
        this.spacing = {
            x: 3,
            y: 3
        }
        for(var r=0; r<options.rows; r++){
            for(var c=0; c<options.cols; c++){
                // todo: define x,y,z origin coords of zone
                this.zones.push({
                    row: r,
                    col: c,
                    card: null,
                    group: t.zonegroup,

                    origin:{
                        x: (3.5*r)-this.spacing.x+(r*0.5)- 1,
                        y: 9.8,
                        z: (3.5*c)-this.spacing.y+(c*0.5) - 2
                    }
                });
            }
        }
        // add a deckgroup zone
        let deckZone = {
          name: 'deck',
          group: t.deckgroup,
          getCardOffset(card){
            let cards = t.app.state.available_cards;
            let deck_position = cards.indexOf(card.index);
            const CARD_THICKNESS = 0.025;
            // console.log('getCardOffset deck_position',deck_position);
            return {
              x: 0,
              // offset vertically based on card thickness
              y: //( cards.length * CARD_THICKNESS ) -
                 ( deck_position * CARD_THICKNESS ),
              z: 0
            }
          }
        };
        Object.defineProperty(deckZone,'origin',{
          get:function(){
            return this.group.position;
          }
        })
        this.named_zones.deck = deckZone;
        // this.zones.push(deckZone)
    }

    convertClientHandsToUserHands(){
      // convert hand client id to user id
      t.players[t.app.my_client_id].user_id = t.root.user.id;
      t.players[t.app.my_client_id].hand.name = 'hand_' + t.root.user.id;
      let handZone = t.game.layout.named_zones['hand_'+t.app.my_client_id]
      handZone.name = 'hand_' + t.root.user.id;
      t.game.layout.named_zones['hand_'+t.root.user.id] = handZone;
      t.game.layout.named_zones['hand_'+t.app.my_client_id] = null;
    }
}
class Game_PVPMemory{
    constructor(){
        // do we need games to be able to have players?
        // or is it ok if T holds players/spectators
        // and Rounds hold players
        // but not Game instances
        this.round = 0;
        this.decks = {};
        let card_count = 4*4;
        this.decks.default = new Deck({card_count});
        this.rounds = [];
        this.player_scores = [];

        // server holds this now
        // this.flipped = [];

        this.reset_timer = null;
        this.reset_delay = 1000;
        this.layout = new Layout({
            rows: 4,
            cols: 4
        })
        // moved to tabletop?
        // maybe this should remain-per game?
        // it's like the table should be able to say no clicking
        // but the game should also be able to say no clicking (server-fed t.game.state.ignore_clicks)
        // and the client should be able to disable clicks (when modal is open)
        // this.ignore_clicks = false;
    }
    startRound(){
        let round = new Round();
        round.onRoundEnd(()=>{
            // update player scores? (they should be reactive during game...)
        })
        this.rounds.push(round);
        this.current_round.start();
    }
    flipCard(card_id,face_up){
      let __card = t.cards[card_id];
      let _card = __card.mesh;
      // _card.faceUp = face_up;//deprecate in favor of next line
      // __card.face_up = face_up;
      console.log('flipping',card_id,face_up,__card.face_up)
      // animate
      // TODO .tweenedToFlipUp // tweenedToFlipDown <bool>
      if(face_up && !__card.tweenedToFaceUp && !__card.face_up){
        __card.face_up = true;
        __card.tweenedToFaceUp = true;
        __card.tweenedToFaceDown = false;
        __card.tweening = true;
        // todo if already tweening cancel it
        t.sounds.play('flip'); // todo: put this in the tween
        __card.current_tween = getFlipTween(__card,'faceup');
        __card.current_tween.start();
      }else if(!face_up && !__card.tweenedToFaceDown && __card.face_up){
        __card.face_up = false;
        __card.tweenedToFaceUp = false;
        __card.tweenedToFaceDown = true;
        __card.tweening = true;
        // todo if already tweening cancel it
        t.sounds.play('flip'); // todo: put this in the tween
        __card.current_tween = getFlipTween(__card,'facedown')
        __card.current_tween.start();
      }
    }
    get current_round(){
      // console.log('current round?',this.rounds,this.round);
        return this?.rounds?.[this?.round];
    }
    get current_player(){
      // console.log('current round?',this.current_round);
        return this?.current_round?.current_player;
    }
    // todo move this server side
    async checkForMatches(){
        // we've flipped 2+ cards,
        t.game.ignore_clicks = true; // server is checking for matches
        // temp: 50/50
        //let match = Math.random() >= 0.5;
        // TODO: flippedCardsMatch()
        // check for matches
        // if(match){
        //     // move cards to players hand
        //     await delay(animationDuration*1000);
        //     moveFlippedToPlayersHand();
        //     await delay(1000);
        //     // deal more cards
        //     // console.warn('todo: if out of cards, reset')
        //     //t.deck.dealToLayout(t.game.layout);

        // }else{
        //     // set a timer, and then flip them back
        //     // reset cards
        //     resetCards();
        // }
    }
}

init();

function init(){

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.soft = true;

  canvas = renderer.domElement;
  document.body.appendChild(canvas);

  camera = new THREE.PerspectiveCamera(75, 1, 0.01, 5000);
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, canvas);

  window.addEventListener( 'mousemove', onMouseMove, false );
  window.addEventListener( 'click', onMouseClick, false );
  window.addEventListener( 'mousedown', onMouseDown, false);
  window.addEventListener( 'touchstart', onTouchStart, false);
  window.addEventListener( 'touchend', onTouchEnd, false)
  window.addEventListener( 'touchmove', onTouchMove, false);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  txtLoader = new THREE.TextureLoader();
  clock = new THREE.Clock();

  // init our game instance as window.t
  window.t = new Tabletop();
  t.scene = scene;
  t.camera = camera;

  t.axesHelper = new THREE.AxesHelper( 5 );
  t.camera.add(t.axesHelper)


  t.camera.position.set(0.16986347385576694,25.65695945633288,-10.061902520372364);
  t.camera.rotation.x=-2.108777799386355;
  t.camera.rotation.y=0.003962076364974097;
  t.camera.rotation.z=3.134952666963505;

  t.controls = controls;
  t.controls.enabled = false;
  t.controls.maxPolarAngle = Math.PI/3.2
  t.controls.target.x = 0;
  t.controls.target.y = 0;
  t.controls.target.z = 0;

  t.opponent_video = document.querySelector('.opponent_video');

  function checkReady(callback){
    console.log('check ready',document.readyState)
    if(document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive"){
      callback();
    }else{
      let my_callback = ()=>{
        console.log('DOM ready');
        window.removeEventListener('DOMContentLoaded',my_callback);
        callback();
      }
      window.addEventListener('DOMContentLoaded', my_callback);
    }
  }
  checkReady(()=>{
    t.server.directus = new Directus("https://u2ijwrng.directus.app",{
      auth:{
        mode:'json',
        // autoRefresh: true,
      }
    })
    // alert('mounting vue');
    t.app = createApp({
      components:{App},
      template:'<div><app :state="state" ref="app"></app></div>',
      data(){
          return {
              state: {
                  loading:true,
                  messages: [],
                  player_hands:{},
                  player_heads:{},
              },
          }
      },
      mounted(){
        t.root.directus_loaded = true
      }
    }).mount('#vue-layer');
    // set it up
    t.server.connectWS();


    t.setupGame();
    // start the first round
    // !!! wait for server to kick this off...
    //t.startGame();
  });

  // kick off render loop
  render();
}

// TODO: host ability to invite a spectator to become a player
// TODO: host ability to kick a player into spectator status

// todo: filter thru clients, return other player(s) who aren't you
// skip spectators
function getOpponentID(){
  const ids = t.app.state.client_ids.slice();
  if(ids.length<2){
    console.error('no one to call');
  }else if(ids.length > 2){
    console.error('need to figure out multipeer connections');
  }else{
    let my_index = ids.indexOf(t.app.my_client_id);
    ids.splice(my_index,1);
    console.warn('attempting media offer to peer:',ids[0],ids);
  }
  return ids[0];
}

function render(){

  if( resize( renderer ) ) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  delta = clock.getDelta();

  // for(let i = 0; i < cards.length; i ++){
  //   cards[i].mixer.update( delta );
  // }
  TWEEN.update(); // update all tweens :)

  t.deck.tweenCardsToZones();

  // update "hovered" status of cards
  // todo only run this loop if t.app.state.hovered has changed since last tick
  if(t?.app?.state?.hovered){
    // TODO: this check is probably wasteful, find a better way
    // like .last_hovered_at dirty flag
    if(JSON.stringify(t.app.state.hovered) !== JSON.stringify(t.app.state.hovered_prev)){
      // console.log('hovered array changed',t.app.state.hovered,t.app.state.hovered_prev);
      for(let cardi in t.app.state.cards){
        cardi = parseInt(cardi);
        let card = t.cards[cardi]
        // console.log(cardi,t.app.state.hovered.indexOf(cardi),card.hovered)
        if(t.app.state.hovered.indexOf(cardi) > -1){
          if(!card.hovered){
            // console.log('setting material to color light')
            card.hovered = true;
            card.mesh.material[2].color.set( colorLight );
            card.mesh.material[3].color.set( colorLight );

            // instead of calling card.tweento here,
            // we should just update destination values on the object
            // and on every tick, it should tween to the new values
            // card.tweenTo({
            //   pos_y: 1,
            // })
          }
        }else{
          card.hovered = false;
          card.mesh.material[2].color.set( colorDark );
          card.mesh.material[3].color.set( colorDark );
          // console.log('setting material to color dark')
          // card.tweenTo({
          //   pos_y: 0,
          // })
        }
      }
    }
  }

  renderer.render( scene, camera );
  requestAnimationFrame( render );
}

function initLights(){
  var ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 )

  t.ambientLight = ambientLight

  var dirLight = new THREE.DirectionalLight( 0xcceeff, 0.5 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.visible = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.position.y = 5;
  dirLight.position.x = 5;
  dirLight.position.z = 5;

  t.dirLight = dirLight;

  var d = 100;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.Far = 100;
  dirLight.shadowDarkness = 0.75;

  scene.add( dirLight , ambientLight );
}

function getCardZone(server_card){
  if(server_card?.zone === undefined){
    server_card = t.app.state.cards[server_card.index];
  }
  let zone = !isNaN(parseInt(server_card.zone))
    ? t.game.layout.zones?.[parseInt(server_card.zone)]
    : t.game.layout.named_zones?.[server_card.zone];
    if(!zone){
      // console.error('Error locating zone',server_card.zone,Object.keys(t.game.layout.named_zones),parseInt(server_card.zone));
      // debugger;
    }
  return zone;
}

function getFlipTween(card, direction){
  // console.log('card?',card)
  const initPos = getCardZone(card)?.origin;
  var zAxis = new THREE.Vector3( 0, 0, 1 );
  var qInitial = new THREE.Quaternion().setFromAxisAngle( zAxis, direction === 'facedown' ? Math.PI : 0 );
  var qFinal = new THREE.Quaternion().setFromAxisAngle( zAxis, direction === 'faceup' ? Math.PI : 0 );
  let pos = {
    x: initPos.x,
    y: initPos.y,
    z: initPos.z,

    rx: qInitial.x,
    ry: qInitial.y,
    rz: qInitial.z,
    rw: qInitial.w
  };
  function posUpdate(){
    card.mesh.position.set(pos.x,pos.y,pos.z)
    card.mesh.quaternion.set(pos.rx,pos.ry,pos.rz,pos.rw)
  }
  const flipTweenStart = new TWEEN.Tween(pos)
  .to({
    x: initPos.x,
    y: initPos.y + 1,
    z: initPos.z,

    rx: qFinal.x,
    ry: qFinal.y,
    rz: qFinal.z,
    rw: qFinal.w
  }, (animationDuration * 1000) / 2)
  .easing(TWEEN.Easing.Quadratic.Out)
  // Use an easing function to make the animation smooth.
  .onUpdate(posUpdate)
  //.start() // Start the tween immediately.

  const flipTweenKF2 = new TWEEN.Tween(pos)
    .to({
      x: initPos.x,
      y: initPos.y,
      z: initPos.z,

      rx: qFinal.x,
      ry: qFinal.y,
      rz: qFinal.z,
      rw: qFinal.w
    }, (animationDuration * 1000) / 2)
  .easing(TWEEN.Easing.Quadratic.In)
  .onUpdate(posUpdate)

  return flipTweenStart.chain(flipTweenKF2)
}

function getMeshTween(mesh,updateTo,options){
  // const initPos = {
  //   x: ,
  //   y: mesh.position.y,
  //   z: mesh.position.z
  // };
  // const initScale = {
  //   x: mesh.scale.x,
  //   y: mesh.scale.y,
  //   z: mesh.scale.z,
  // }
  if(!mesh || !mesh.position){
    console.warn('huh?',mesh);
    return;
  }

  let tweenProps = {
    pos_x: mesh.position.x,
    pos_y: mesh.position.y,
    pos_z: mesh.position.z,

    rot_x: mesh.rotation.x,
    rot_y: mesh.rotation.y,
    rot_z: mesh.rotation.z,
    rot_w: mesh.rotation.w,

    scale_x: mesh.scale.x,
    scale_y: mesh.scale.y,
    scale_z: mesh.scale.z,

  };//
  //
  function propsUpdate(){
    mesh.position.set(
      tweenProps.pos_x,
      tweenProps.pos_y,
      tweenProps.pos_z
    )
    mesh.rotation.x = tweenProps.rot_x;
    mesh.rotation.y = tweenProps.rot_y;
    mesh.rotation.z = tweenProps.rot_z;

    mesh.scale.set(
      tweenProps.scale_x,
      tweenProps.scale_y,
      tweenProps.scale_z,
    )
    if(options.onTick){
      options.onTick();
    }
  }
  const tween = new TWEEN.Tween(tweenProps)
  .to(updateTo, options?.duration ?? 500)
  .easing(options?.easing ?? TWEEN.Easing.Quadratic.Out)
  // Use an easing function to make the animation smooth.
  .onUpdate(propsUpdate)

  return tween;
}

function initRoomMeshes(){

  const loader = new THREE.FBXLoader();
				loader.load( './public/fbx/card-table.fbx', function ( object ) {
          object.name="card-table"
					// mixer = new THREE.AnimationMixer( object );

					// const action = mixer.clipAction( object.animations[ 0 ] );
					// action.play();

          // var shader = THREE.VertexColorShader;
          // var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
          var parameters = {
            //this activates the 'colors' attribute (uses vertex colors stored in the created geometry)
            vertexColors: true, //THREE.VertexColors,
            // fragmentShader: shader.fragmentShader,
            // vertexShader: shader.vertexShader,
            side: THREE.FrontSide,
            // uniforms: uniforms
          };
          object.scale.set(0.1,0.1,0.1);

          t.tableMesh = object;

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;
              child.material = new THREE.MeshStandardMaterial(parameters);
						}

					} );




          object.position.set(0,0,0);

          console.log('fbx object?',object);

					scene.add( object );

				} );

  t.wallMaterial = new THREE.MeshStandardMaterial({
    color: '#244275',
    metalness: 0,
    roughness: 1,
    side: THREE.FrontSide,// THREE.DoubleSide,
  })

  t.northWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 100, 50 ),
    t.wallMaterial
  )
  t.northWall.name="northWall"
  t.northWall.position.set(0, 25, 50);
  t.northWall.rotation.y = THREE.MathUtils.degToRad(180);
  t.northWall.castShadow = true;
  t.northWall.receiveShadow = true;
  scene.add(t.northWall);

  t.westWall =t.northWall.clone();
  t.westWall.name = "westWall"
  scene.add(t.westWall)
  t.westWall.material = new THREE.MeshBasicMaterial({
    color: '#662475',
    metalness: 0,
    roughness: 1,
    side: THREE.FrontSide,// THREE.DoubleSide,
  })
  t.westWall.rotation.y = THREE.MathUtils.degToRad(90);
  t.westWall.position.x = -50;
  t.westWall.position.z = 0;

  t.eastWall = t.westWall.clone();
  t.eastWall.name = "eastWall"
  scene.add(t.eastWall);
  t.eastWall.material = new THREE.MeshBasicMaterial({
    color: '#247575',
    metalness: 0,
    roughness: 1,
    side: THREE.FrontSide,// THREE.DoubleSide,
  })
  t.eastWall.rotation.y = THREE.MathUtils.degToRad(-90);
  t.eastWall.position.x = 50;
  t.eastWall.position.z = 0;

  t.southWall = t.westWall.clone();
  t.southWall.name = "southWall"
  scene.add(t.southWall);
  t.southWall.material = new THREE.MeshBasicMaterial({
    color: '#242775',
    metalness: 0,
    roughness: 1,
    side: THREE.FrontSide,// THREE.DoubleSide,
  })
  t.southWall.rotation.y = 0;
  t.southWall.position.x = 0;
  t.southWall.position.z = -50;

  t.floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 100, 100 ),
    new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 1,
      // side: THREE.DoubleSide,
      color: '#362475'
    })
  )
  t.floor.castShadow = true;
  t.floor.receiveShadow = true;
  t.floor.position.set(0, 0, 0);
  scene.add(t.floor);
  t.floor.rotation.x = THREE.MathUtils.degToRad(-90);

  // t.floorMesh = new THREE.Mesh(
  //   new THREE.PlaneBufferGeometry(50, 50),
  //   new THREE.MeshStandardMaterial({
  //     //map: txtLoader.load( "https://threejs.org/examples/textures/hardwood2_diffuse.jpg" ),
  //     metalness: 0,
  //     roughness: 1,
  //     side: THREE.DoubleSide,
  //     color: '#000000'
  //   })
  // );
  // t.floorMesh.geometry.rotateX(-Math.PI * 0.5);
  // t.floorMesh.position.set(0, -0.001, 0);
  // t.floorMesh.receiveShadow = true;
  // scene.add(t.floorMesh);
}

// function createFlipUpsideClip( card, side ){ // 'faceup' or 'facedown'
//   // Create a keyframe track (i.e. a timed sequence of keyframes) for each animated property
//   // Note: the keyframe track type should correspond to the type of the property being animated
//   // Rotation
//   var zAxis = new THREE.Vector3( 0, 0, 1 );

//   if( side === 'faceup' ){
//     var qInitial = new THREE.Quaternion().setFromAxisAngle( zAxis, 0 );
//     var qFinal = new THREE.Quaternion().setFromAxisAngle( zAxis, Math.PI );
//   } else if( side === 'facedown' ){
//     var qInitial = new THREE.Quaternion().setFromAxisAngle( zAxis, Math.PI );
//     var qFinal = new THREE.Quaternion().setFromAxisAngle( zAxis, 0 );
//   }

//   var quaternionKF = new THREE.QuaternionKeyframeTrack(
//     '.quaternion',
//     [ 0, animationDuration ],
//     [
//       qInitial.x,
//       qInitial.y,
//       qInitial.z,
//       qInitial.w,
//       qFinal.x,
//       qFinal.y,
//       qFinal.z,
//       qFinal.w
//     ]
//   );

//   function pointFromInitialOffset(x,y,z){
//     return new THREE.Vector3(
//       card.position.x + x,
//       card.position.y + y,
//       card.position.z + z
//     )
//   }

//   // Position
//   var pointsArr = [
//     pointFromInitialOffset( 0, 0, 0 ),
//     pointFromInitialOffset( 0, 0.8, 0 ),
//     pointFromInitialOffset( 0, 1.5, 0 ),
//     pointFromInitialOffset( 0, 1.2, 0 ),
//     pointFromInitialOffset( 0, 0, 0 )
//   ];
//   if( side === 'facedown' ){
//     pointsArr.forEach( function( vec3 , i ){
//       //vec3.x = -vec3.x;
//     });
//   }
//   var CRC = new THREE.CatmullRomCurve3( pointsArr, false, 'catmullrom', 1 );
//   var CRCPoints = CRC.getPoints( 60 );

//   //var helper = pointsHelper( CRCPoints );
//   //scene.add( helper ); // Optional helper for position curve

//   var posArrFlat = [];
//   for( var i = 0; i < CRCPoints.length; i++ ){
//     posArrFlat.push( CRCPoints[i].x, CRCPoints[i].y, CRCPoints[i].z );
//   }

//   var timesArr = [];
//   var len = posArrFlat.length - 3;
//   for( var j = 0; j < posArrFlat.length/3; j++ ){
//     var x = ((animationDuration / len) * j * 3) + 0; // + delay
//     timesArr.push( x );
//   }

//   var positionKF = new THREE.VectorKeyframeTrack(
//     '.position',
//     timesArr,
//     posArrFlat,
//     THREE.InterpolateSmooth
//   );

//   var flipUpsideClip = new THREE.AnimationClip(
//     'Flip' ,
//     animationDuration ,
//     [ positionKF, quaternionKF ]
//   );

//   return flipUpsideClip;
// }

function onTouchMove (evt){
  onMouseMove();
}

// mouse over hover effect
// TODO: use SHADER to blend
// TODO: animate color transition
async function onMouseMove( evt ){
  if(t.root.show_modal){
    return;
  }
  updateClientCursor();
  updatePlayerHead();
  // t.players[getOpponentID()].head.mesh.lookAt(t.camera)
  // prevent looking under the table
  // NOTE: did this with maxPolarAngle instead on controls
  // if(camera.position.y <= 2){
  //   camera.position.y = 2;
  // }
  // TODO: allow user to hover over matches in their hand,
  // but NOT the playfield cards, if it's not currently their turn
  // todo: move up to app-level
  // console.log('is it my turn?',t?.app?.$refs?.app?.its_my_turn)

  // for some reason returning early here makes it so !player_turn (opponent) can't move cursor

  // if(!t?.app?.$refs?.app?.its_my_turn){
  //   return;
  // }
  // let cards = t.cards;
  // let keep_testing = true;
  // for(let i = 0; i<cards.length; i++){
  //   let card = cards[i].mesh;
  //   if( keep_testing && raycast( card ) == true ){
  //       keep_testing = false;
  //       if(!cards[i].hovered){
  //         cards[i].hovered = true
  //         t.app.state.hovered = [i];
  //         t.server.send({
  //           type: 'HIGHLIGHT',
  //           card_id: i, //cards[i].id,
  //         })
  //       }
  //     // card.material[2].color.set( colorLight );
  //     // card.material[3].color.set( colorLight );
  //   } else {
  //     cards[i].hovered = false
  //     // card.material[2].color.set( colorDark );
  //     // card.material[3].color.set( colorDark );
  //   }
  // }

  // TODO: don't send server highlight when debug_inspect_objects is true

  if(t.debug_inspect_objects){
    onHoverDebugObject(intersectsGroup(t.scene.children));
  }

  const intersects = intersectsGroup(t.zonegroup.children)
  // setupRaycast();
  // let intersects = raycaster.intersectObjects( t.zonegroup.children );
  // get the first card
  if(intersects.length){
    //console.log('looking for card to hover',);
    const card_id = intersects[0]?.object?.userData?.card_id;
    //console.log('card id?',card_id);
    if(card_id !== null){
      let card = t.cards[card_id]
      if(!card.hovered){
        card.mouseOver = true;
        card.hovered = true
        if(t.app.state.hovered && t.app.state.hovered?.[0]){
          let i = t.app.state.hovered?.[0];
          t.cards[i].mouseOver = false;
          t.cards[i].hovered = false;
        }
        t.app.state.hovered = [card_id]
        t.server.send({
          type: 'HIGHLIGHT',
          card_id: card_id,
        })
      }
    }
  }else{
    if(t.app.state.hovered && t.app.state.hovered?.[0]){
      let i = t.app.state.hovered?.[0];
      t.cards[i].mouseOver = false;
      t.cards[i].hovered = false;
    }
    t.server.send({
      type: 'HIGHLIGHT',
      card_id: null,
    })
    t.app.state.hovered = [];
  }
  //else{
    // console.log('not hovering any cards in zonegroup');
  //}
}
function onHoverDebugObject(intersects){
  console.log('todo: highlight hovered object');
}
// TODO: loop through intersects array and skip if object is .cursor
function onClickDebugObject(intersects){
  console.log(intersects);
  let closest_object_not_pointer = null;
  intersects.forEach((intersection)=>{
    if(intersection.object.name === 'pointer' || intersection.object.name.indexOf('player_head') > -1){
      return;
    }
    if(!closest_object_not_pointer){
      closest_object_not_pointer = intersection.object;
    }
  })
  t.debug_inspector_selected_object = closest_object_not_pointer;
  console.log('t.debug_inspector_selected_object set to:',t.debug_inspector_selected_object)
}
function throttle(callback,limit){
  var wait = false;                  // Initially, we're not waiting
    return function () {               // We return a throttled function
        if (!wait) {                   // If we're not waiting
            callback.call(callback,...arguments);           // Execute users function
            wait = true;               // Prevent future invocations
            setTimeout(function () {   // After a period of time
                wait = false;          // And allow future invocations
            }, limit);
        }
    }
}

function getThrottledUpdateServer(type,delay){
  return throttle((data)=>{
    updateServer(type,data);
  },delay);
}

// const updateServerThrottled = throttle((type,data)=>{
//   console.log('updateServerThrottled',{type,data});
//   // debugger;
//   updateServer(type,data);
// }, 128);

function updateServer(type,data){
  // console.log('updateServer',{type,data})
  t.server.send({
    type,
    data,
    user_id: t.root.user.id,
    game_id: t.root.game_selection
  })
}

const cusorUpdateFN = getThrottledUpdateServer('SET_PLAYER_CURSOR',128);
const headUpdateFN = getThrottledUpdateServer('SET_PLAYER_HEAD',128);

function updateClientCursor(){
  // hit test to position pointer
  // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	// mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  // Toggle rotation bool for meshes that we clicked
  const pointer = t.players?.[t.app.my_client_id]?.pointer?.mesh;
  if(pointer){
    var intersects = intersectsGroup( [t.tableMesh,...t.zonegroup.children] );
    // console.log('intersects',intersects);
    if ( intersects.length > 0 ) {

      pointer.position.copy(intersects[ 0 ].point);
      pointer.position.y = pointer.position.y + .5;

      // console.log('cursor position?',pointer.position)

      // send a throttled update to the server
      cusorUpdateFN(pointer.position);
    }
  }else{
    console.warn('player pointer not found')
  }

  // t.players[client_id].pointer.mesh.position.set()
}

function updatePlayerHead(){
  // console.log('cam pos?', camera.position);
  headUpdateFN(camera.position);
  // todo
  // headUpdateFN({
  //   pos_x:camera.position.x,
  //   pos_y:camera.position.y,
  //   pos_z:camera.position.z,

  //   rot_x:camera.rotation.x,
  //   rot_y:camera.rotation.y,
  //   rot_z:camera.rotation.z,
  // });
}


function onMouseDown (evt){
  mouseDownCoord = {
    x: evt.clientX,
    y: evt.clientY
  }
}

function onTouchStart (evt){
  const touches = evt.changedTouches;
//   for (let i = 0; i < touches.length; i++) {
//     console.log(`touchstart: ${i}.`,touches[i]);
//     //ongoingTouches.push(copyTouch(touches[i]));

//   }
  if(touches.length){
    //alert(touches[0].clientX);
    onMouseDown({

      clientX: touches[0].clientX,
      clientY: touches[0].clientY

    })
  }

}
function onTouchEnd(evt){
  const touches = evt.changedTouches;
//   for (let i = 0; i < touches.length; i++) {
//     console.log(`touchend: ${i}.`,touches[i]);
//     //ongoingTouches.push(copyTouch(touches[i]));

//   }
  if(touches?.[0]){
    onMouseClick({
      clientX: touches[0].clientX,
      clientY: touches[0].clientY
    })
  }
}

function onMouseClick( evt ){
  if(t.root.show_modal){
    return;
  }

  if(t.debug_inspect_objects){
    onClickDebugObject(intersectsGroup(t.scene.children));
    return;
  }

  if(t.app.state.ignore_clicks || t.client_ignore_clicks || t.deck.shuffling){
    return;
  }

  // if we're not logged in, ignore it
  if(!t?.root?.player?.id){
    return;
  }

  mouseClickCoord = {
      x: evt.clientX,
      y: evt.clientY
    }
  let drag_distance = Math.hypot(
      mouseClickCoord.x - mouseDownCoord.x,
      mouseClickCoord.y - mouseDownCoord.y
    )
  // console.log({
  //   mouseDownCoord,
  //   mouseClickCoord,
  //   drag_distance
  // })
  // console.log('is it my turn?',{
  //   my_id:t.app.my_client_id,
  //   player_turn:t.app.state.player_turn
  // })
  if(t.app.my_client_id !== t.app.state.player_turn){
    console.error('its not your turn');
    // TODO: visual feedback (pulse cursor red or something)
    return;
  }
  // ignore clicks if you dragged the mouse (moved camera)
  if(drag_distance > 10){
    return;
  }

  // let keep_testing = true;
  // for(let i = 0; i<t.cards.length; i++){
  //   if(!keep_testing){
  //       continue;
  //   }
  //   let __card = t.cards[i];
  //   let _card = __card.mesh;

    // TODO: we need to only react to the card that is closest to the camera
    // need to account for occluders too :/
    let user_id = t.root.player.id; // t.app.my_client_id
    const intersects = intersectsGroup(t.debug_inspect_objects ? t.scene.children : t.zonegroup.children)
    let card_id = intersects?.[0]?.object?.userData?.card_id;
    // console.log('click intersects',{intersects,card_id});
    // card is on the play field
    // TODO: certain games will allow you to click on cards that do not have a zone?
    // zone ~~ on playfield (! in deck, ! in hand)
    let __card = t.cards?.[card_id]
    console.log('clicked card',{card_id,__card})
    if(!__card){
      console.warn('card not found',card_id);
    }
    else {
      // keep_testing = false;
      if(
        // ignore if we already flipped this card over
        t.app.state.flipped.indexOf(card_id)>-1
        // or if it's in the player hand
        || t.app.state.player_hands[user_id].indexOf(card_id)>-1
        // todo: or if it's in opponents hand
        // todo: or if it's not in a zone (intersecting only zonegroup.children kind of solves this one)
       ){
         console.log('ignoring click',card_id);
        return;
      }
      // let _card = __card?.mesh;
      // console.log('faceUp?',__card.face_up)
      if( __card.face_up ){ // card faceup
        t.game.flipCard(card_id,false);

        t.server.send({
            type: 'FLIP',
            direction: 'facedown',
            card_id
        })

      } else if( !__card.face_up ) { // card facedown
        // so turn it faceup
        t.game.flipCard(card_id,true)

        t.app.state.flipped.push(card_id);
        if(t.app.state.flipped.length > 1){
          t.app.state.ignore_clicks = true;
        }
        t.server.send({
            type: 'FLIP',
            direction: 'faceup',
            card_id
        })
      }
    }
  // }
  if(t.app.state.flipped.length > 1){
    t.game.checkForMatches();
  }

}

function lerp(v0,v1,t){
  return v0*(1-t)+v1*t
}

// function moveFlippedToPlayersHand(){
//   t.server.send({
//     type: 'move_flipped_to_hand',
//     cardA: t.game.flipped[0],
//     cardB: t.game.flipped[1]
//   })
//   // t.currentPlayerHand == t.round.[t.round.current_player]
//   t.game.current_player.matches.push(t.game.flipped)
//   t.game.current_player.cards.push(t.game.flipped[0],t.game.flipped[1])
//   // remove cards from their zones so new cards can fill in
//   const cardA = t.cards[t.game.flipped[0]];
//   const cardB = t.cards[t.game.flipped[1]];
//   t.game.layout.zones[cardA.zone].card = null;
//   t.game.layout.zones[cardB.zone].card = null;
//   updateCardsInHand(t.game.flipped[0],t.game.flipped[1])
//   t.game.flipped = [];
//   console.warn('moving flipped cards to players hand',
//   t.game.current_player.matches,
//   t.game.current_player.cards)
//   t.game.ignore_clicks = false;

// }

function resetCards(){
  t.game.reset_timer = setTimeout(()=>{
       for(let a = 0; a<t.game.flipped.length; a++){
         let fci = t.game.flipped[a];
         let fc = t.cards[fci].mesh;
         // fc.actions.flipUpside.stop();
         t.sounds.play('flip');
         getFlipTween(fc,'facedown').start();
         // todo: put the soundeffect in the getTween method
        //  fc.actions.flipDownside.start();
         fc.faceUp = false;
       }
       t.game.flipped = [];
       t.client_ignore_clicks = false;
    },reset_delay);
}

function setupRaycast(){
  // calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );
}

// function raycastObject( object ){
//   setupRaycast();

// 	// calculate objects intersecting the picking ray
// 	var intersects = raycaster.intersectObject( object );
//   if( intersects.length > 0 ){
//     return true;
//   }
//   return false;
// }

function intersectsGroup( group ){
  setupRaycast();

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects( group );
  // if( intersects.length > 0 ){
  //   return true;
  // }
  // return false;
  return intersects;
}

function pointsHelper( pointsArray ){
  var geometry = new THREE.BufferGeometry().setFromPoints( pointsArray );
  var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  var curveObject = new THREE.Line( geometry, material );
  return curveObject;
}

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}