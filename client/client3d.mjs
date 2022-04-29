// This example uses THREE.CatmullRomCurve3 to create a path for a custom Keyframe Track position animation.
// AnimationClip creation function on line 136

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
var ground;

async function delay(t){
    return new Promise(resolve => setTimeout(resolve, t));
}

const colorDark = new THREE.Color( 0xb0b0b0 );
const colorLight = new THREE.Color( 0xffffff );
const animationDuration = 0.5; // seconds
const reset_delay = 1000;

class Player{
    constructor(name){
        this.name = name;
        // todo support multiple hands
        this.matches = [];
        this.cards = [];
    }
}

class Tabletop{
    constructor(){
        // table tops have uuids which can be shared / spectated / joined
        this.id = "id"+performance.now();

        // Lights
        initLights()

        // Table (groundplane)
        initGround();

        this.deckgroup = new THREE.Group();
        scene.add(this.deckgroup);

        this.players = [];
        this.players.push(new Player("Player One"));
    }

    setupGame(){
        this.game = new Game_PVPMemory();
    }

    startGame(){
        this.game.startRound();
    }

    get deck(){
        return this.game.decks.default;
    }
    get cards(){
        return this.deck.cards;
    }
}

class Card{
    constructor(index){
        this.index = index;
        this.deck_order_index = index; // what order is this card in the deck's available cards array? (saves repeat indexOf calls)
        this.setupTexturesAndMaterials();
        this.setupMesh();

        // Animation
        this.mesh.faceUp = false;
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
        this.faceUpTexture = txtLoader.load('https://images-na.ssl-images-amazon.com/images/I/61YXNhfzlzL._SL1012_.jpg');
        this.faceDownTexture = txtLoader.load('https://vignette3.wikia.nocookie.net/yugioh/images/9/94/Back-Anime-2.png/revision/latest?cb=20110624090942');
        // faceUpTexture.flipY = false;
        this.darkMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
        this.faceUpMaterial = new THREE.MeshPhongMaterial({
            color: colorDark,
            map: this.faceUpTexture,
            shininess: 40
        });
        this.faceDownMaterial = new THREE.MeshPhongMaterial({
            color: colorDark,
            map: this.faceDownTexture,
            shininess: 40
        });
    }

    // used to move a card from a deck to a zone or a player hand
    // note you can use options{arc:true,arcTo:{}} to move the card in an arc (basically just adds an intermediate keyframe point to the curve)
    async tweenTo(destination,options){
        // console.log('card move to point',destination,options);
        // this generates a tween between the current position and the destination
        this.destination = destination;
        if(this.animating){
            return false;
        }
        this.animating = true;

        // TODO: add ability to include/exclude properties from tween to save overhead

        let _mesh = this.mesh;
        let tweenMid = null;
        if(options && options.arcTo){
            // optional midpoint
            tweenMid = getMeshTween(_mesh,options.arcTo,300/2);
        }
        let tweenEnd = getMeshTween(_mesh,destination,{
            duration: tweenMid ? 300/2 : 300,
            // todo accept easing option
        });

        tweenMid ? tweenMid.chain(tweenEnd).start() : tweenEnd.start();

        await delay(150);


        // run the tween
        this.animating = false;
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

        for(var i=0; i<options?.card_count ?? 52; i++){
            this.cards.push(new Card(i));
            this.available_cards.push(i);
        }
    }
    // todo allow shuffling indefinitely until player clicks to stop
    async shuffle(iterations=3){
        if(this.shuffling){
            return;
        }
        this.shuffling = true;
        for(var i=0; i<iterations; i++){
            let final_available_cards = await this.shuffleOnce(this.available_cards);
            this.available_cards = final_available_cards;
        }
        this.shuffling = false;
    }
    async shuffleOnce(array){
        var m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // snapshot the array
            this.available_cards_history.push(array.slice());

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;

            this.cards[array[m]].deck_order_index = m;
            this.cards[array[i]].deck_order_index = i;

            // animate the shuffled cards coming off the top
            // and sliding back into the deck
            this.animateOrderChangeAsShuffle(
                array[i],
                array[m],
                i,
                m
            );
            // artificially delay the shuffling
            await delay(3);
        }


        return array;
    }
    animateOrderChangeAsShuffle(iCardA,iCardB,indexA,indexB){
        //console.log('animating swap of A and B',iCardA,iCardB,indexA,indexB);

        const cardA = this.cards[iCardA];
        cardA.tweenTo({
            pos_x:0,//cardA.mesh.position.x,
            pos_y:indexB * 0.025, // offset by card thickness + minor gap
        },{
            duration: 150,
            arcTo:{
                pos_x:'-0.5', // camera left, screen right
                // y:'+1',
            }
        });
        const cardB = this.cards[iCardB];
        cardB.tweenTo({
            pos_x:0,//cardB.mesh.position.x,
            pos_y:indexA * 0.025, // offset by card thickness + minor gap
        },{
            duration: 150,
            arcTo:{
                pos_x:'+0.5', // camera right, screen left
                // y:'+1',
            }
        });

        // by default card order updates do nothing to their position
        // if this was reactive, every modification to this.available_cards (aka the card order of the remaining cards in the deck) would trigger a property update
        // then we would watch those properties and either update z-depth instantly
        // or with a transition tween
        // in this case, we'd want a SPECIAL tween, not just a linear tween of cards phasing thru each other
        // to give it more physicality we want to animate the cards moving off the top of the deck and then back in
    }
    async dealToLayout(layout){
        // for each zone in passed layout
        // if there is no card in the zone
        // pick the top card from the deck
        // and place it in the zone

        // TODO: support multiple cards per zone (think klondike solitaire)
        console.log('dealToLayout',this);
        for(let izone in layout.zones){
            let zone = layout.zones[izone];
            if(!zone.card){
                let card_index = this.available_cards.pop();
                zone.card = card_index;
                this.cards[card_index].zone = izone;
                // remove card from deckgroup, attach it back to scene root
                scene.attach(this.cards[card_index].mesh);
                this.cards[card_index].tweenTo(
                    {
                        pos_x: zone.origin.x,
                        // todo offset by num cards already in the zone
                        pos_y: zone.origin.y,
                        pos_z: zone.origin.z
                    },
                    {
                        duration: 1000,
                    }
                );
                console.warn('todo, settle ypos of cards in deck as cards are removed')
                console.warn('todo deal from other end of array?')
                await delay(150); // slight delay in dealing
            }
        }
    }
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
        this.players = [];
        this.current_player_id = 0;
        for(let i=0; i<t.players.length; i++){
            // initialize player for round
            this.players.push({
                score: 0,
                cards: [],
                matches: []
            })
        }
        console.warn('round players',this.players);
    }
    async start(){
        console.log('round start','deck',window.t.deck);

        // center the deck

        // animate the camera
        getMeshTween(camera,{
            pos_y: '+5'
        },{
            duration: 3000
        }).start();

        await delay(1000);

        // shuffle the deck at the start of each round
        await window.t.deck.shuffle();


        await delay(1000);

        // move the deck out of the way
        getMeshTween(t.deckgroup,{
            pos_x: '-8',
        },{
            duration: 1000,
            easing: TWEEN.Easing.Quadratic.InOut
        }).start();

        await delay(1000);

        // deal the cards
        // for symmetry could allow calling t.game.layout.dealFromDeck(deck)
        await window.t.deck.dealToLayout(
            window.t.game.layout
        )
    }
    recordMove(move){
        this.moves.push(move);
        // todo this.players[move.player].score += move.action_score;
    }
    onRoundEnd(cb){
        this.on_round_end_callback = cb;
    }
    get current_player(){
        return this.players[this.current_player_id];
    }
}
class Layout{
    constructor(options){
        this.zones = [];
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

                    origin:{
                        x: (2.5*r)-this.spacing.x+(r*0.5),
                        y: 0,
                        z: (3.5*c)-this.spacing.y+(c*0.5)
                    }
                });
            }
        }
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
        let card_count = 52;
        this.decks.default = new Deck({card_count});
        this.rounds = [];
        this.player_scores = [];
        this.flipped = [];
        this.reset_timer = null;
        this.reset_delay = 1000;
        this.layout = new Layout({
            rows: 4,
            cols: 4
        })
        this.ignore_clicks = false;
    }
    startRound(){
        let round = new Round();
        round.onRoundEnd(()=>{
            // update player scores? (they should be reactive during game...)
        })
        this.rounds.push(round);
        this.current_round.start();
    }
    get current_round(){
        return this.rounds[this.round];
    }
    get current_player(){
        return this.current_round.current_player;
    }
    async checkForMatches(){
        // we've flipped 2+ cards,
        t.game.ignore_clicks = true;
        // temp: 50/50
        let match = Math.random() >= 0.5;
        // TODO: flippedCardsMatch()
        // check for matches
        if(match){
            // move cards to players hand
            await delay(animationDuration*1000);
            moveFlippedToPlayersHand();
            await delay(1000);
            // deal more cards
            // console.warn('todo: if out of cards, reset')
            t.deck.dealToLayout(t.game.layout);

        }else{
            // set a timer, and then flip them back
            // reset cards
            resetCards();
        }
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

  canvas = renderer.domElement;
  document.body.appendChild(canvas);

  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set( 0, 10, -1.5 );
  scene.add(camera);
  controls = new THREE.OrbitControls(camera, canvas);

  window.addEventListener( 'mousemove', onMouseMove, false );
  window.addEventListener( 'click', onMouseClick, false );
  window.addEventListener( 'mousedown', onMouseDown, false);
  window.addEventListener( 'touchstart', onTouchStart, false);
  window.addEventListener( 'touchend', onTouchEnd, false)
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  txtLoader = new THREE.TextureLoader();
  clock = new THREE.Clock();

  // init our game instance as window.t
  window.t = new Tabletop();
  t.setupGame();
  t.startGame(); // start the first round

  // kick off render loop
  render();
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


  renderer.render( scene, camera );
  requestAnimationFrame( render );
}

function initLights(){
  var ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 )
  var dirLight = new THREE.DirectionalLight( 0xcceeff, 0.9 );
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.position.setScalar( 5 );
  scene.add( dirLight , ambientLight );
}

function getFlipTween(card, direction){
  const initPos = card.position;
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
    card.position.set(pos.x,pos.y,pos.z)
    card.quaternion.set(pos.rx,pos.ry,pos.rz,pos.rw)
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
  }
  const tween = new TWEEN.Tween(tweenProps)
  .to(updateTo, options?.duration ?? 500)
  .easing(options?.easing ?? TWEEN.Easing.Quadratic.Out)
  // Use an easing function to make the animation smooth.
  .onUpdate(propsUpdate)

  return tween;
}

function initGround(){

  ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(50, 50),
    new THREE.MeshStandardMaterial({
      //map: txtLoader.load( "https://threejs.org/examples/textures/hardwood2_diffuse.jpg" ),
      metalness: 0,
      roughness: 1,
      color: '#000000'
    })
  );
  ground.geometry.rotateX(-Math.PI * 0.5);
  ground.position.set(0, -0.001, 0);
  ground.receiveShadow = true;
  scene.add(ground);
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

// mouse over hover effect
// TODO: use SHADER to blend
// TODO: animate color transition
function onMouseMove( evt ){
  let cards = t.cards;
  let keep_testing = true;
  for(let i = 0; i<cards.length; i++){
    let card = cards[i].mesh;
    if( keep_testing && raycast( card ) == true ){
        keep_testing = false;
      card.material[2].color.set( colorLight );
      card.material[3].color.set( colorLight );
    } else {
      card.material[2].color.set( colorDark );
      card.material[3].color.set( colorDark );
    }
  }
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
  if(t.game.ignore_clicks || t.deck.shuffling){
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
  console.log({
    mouseDownCoord,
    mouseClickCoord,
    drag_distance
  })
  // ignore clicks if you dragged the mouse
  if(drag_distance > 10){
    return;
  }
  let keep_testing = true;
  for(let i = 0; i<t.cards.length; i++){
    if(!keep_testing){
        continue;
    }
    let __card = t.cards[i];
    let _card = __card.mesh;

    // TODO: we need to only react to the card that is closest to the camera
    // need to account for occluders too :/
    if( _card && raycast( _card ) == true && !__card.animating){
      keep_testing = false;
      if(
        // ignore if we already flipped this card over
        t.game.flipped.indexOf(i)>-1
        // or if it's in the player hand
        || t.game.current_player.cards.indexOf(i)>-1
       ){
        return;
      }
      if( _card.faceUp ){ // card faceup
        getFlipTween(_card,'facedown').start();
        _card.faceUp = false;

      } else if( !_card.faceUp ) { // card facedown
        // so turn it faceup
        getFlipTween(_card,'faceup').start();
        _card.faceUp = true;
        t.game.flipped.push(i);
      }
    }
  }
  if(t.game.flipped.length > 1){
    t.game.checkForMatches();
  }

}

function lerp(v0,v1,t){
  return v0*(1-t)+v1*t
}

function addMatchToHand(i_card_a,i_card_b){
  camera.attach(t.cards[i_card_a].mesh)
  camera.attach(t.cards[i_card_b].mesh)

//   cards[i_card_a].position.set(0,-.5,-1)
//   cards[i_card_a].scale.set(.1,.1,.1)
//   cards[i_card_a].rotation.set(1,Math.PI,Math.PI,'XYZ')

//   cards[i_card_b].scale.set(.1,.1,.1)
//   cards[i_card_b].position.set(-.1,-.5,-1)
//   cards[i_card_b].rotation.set(1,Math.PI,Math.PI,'XYZ')
  const current_player = t.game.current_player;
  let matches_count = current_player.matches.length;
  for(let a = 1; a<=current_player.cards.length; a++){
    let i_card = current_player.cards[a-1];
    let card = t.cards[i_card];
    let even = a % 2 == 0;
    let lerp_max = .07 * matches_count

    let updateTo = {}
    updateTo.pos_x = lerp(
      0, // 0 basis
      lerp_max, // lerp max width
      (1/matches_count)*(even?a+1:a+2)) // % of lerp
      -(even?.1:.105) // slight offset for "paired" card
      -(a*.01) // padding between cards
      -(lerp_max) // center
      +(.05)
    updateTo.pos_y = -0.5 + (0.001 * a);
    updateTo.pos_z = -1.0 + (0.001 * a);

    updateTo.rot_x = 0.5;//1;
    updateTo.rot_y = Math.PI;
    updateTo.rot_z = Math.PI;

    updateTo.scale_x = .09 * .65
    updateTo.scale_y = .09
    updateTo.scale_z = .09 //
    // console.log(updateTo);
    card.tweenTo(updateTo,{duration:300})
  }
}

function moveFlippedToPlayersHand(){
  // t.currentPlayerHand == t.round.[t.round.current_player]
  t.game.current_player.matches.push(t.game.flipped)
  t.game.current_player.cards.push(t.game.flipped[0],t.game.flipped[1])
  // remove cards from their zones so new cards can fill in
  const cardA = t.cards[t.game.flipped[0]];
  const cardB = t.cards[t.game.flipped[1]];
  t.game.layout.zones[cardA.zone].card = null;
  t.game.layout.zones[cardB.zone].card = null;
  addMatchToHand(t.game.flipped[0],t.game.flipped[1])
  t.game.flipped = [];
  console.warn('moving flipped cards to players hand',
  t.game.current_player.matches,
  t.game.current_player.cards)
  t.game.ignore_clicks = false;

}

function resetCards(){
  t.game.reset_timer = setTimeout(()=>{
       for(let a = 0; a<t.game.flipped.length; a++){
         let fci = t.game.flipped[a];
         let fc = t.cards[fci].mesh;
         // fc.actions.flipUpside.stop();
         getFlipTween(fc,'facedown').start();
        //  fc.actions.flipDownside.start();
         fc.faceUp = false;
       }
       t.game.flipped = [];
       t.game.ignore_clicks = false;
    },reset_delay);
}

function raycast( object ){
  // calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObject( object );
  if( intersects.length > 0 ){
    return true;
  } else {
    return false;
  }
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