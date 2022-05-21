class PeerConnections {
  constructor() {
    this.local_peers = {};
    this.remote_peers = {};
    this.peer_streams = {};
    this.peer_video_settings = {};
  }
  async offerStreamToPeer(peer_id){

    // make sure we have a connection container for the remote peer id
    this.remote_peers[peer_id] = this.setupRTCPeerConnection(peer_id);

    // gather it off the instance
    const peer = this.remote_peers[peer_id];

    // error if none found for peer id
    if(!peer){
      console.error('no peer connection for',peer_id);
      return;
    }

    // offer our audio, video tracks to the peer connection
    t.stream.getTracks().forEach((track) => {
      peer.addTrack(track, t.stream)
    });

    // generate an offer to send to the remote peer
    const localPeerOffer = await peer.createOffer();

    // set the local description of the peer connection
    await peer.setLocalDescription(new RTCSessionDescription(localPeerOffer));

    // send the offer to the remote peer via websocket -> node events
    t.server.send({
      type:'mediaOffer',
      offer: localPeerOffer,
      from: t.app.state.my_client_id,
      to: peer_id,

      // extras
      stream_settings: t.stream.getVideoTracks()[0].getSettings(),
    })
  }

  // TODO: don't offer to stream with peer if they haven't enabled video or audio
  // TODO: maybe show a "calling" popup and send a pre-offer to the peer

  // TODO: when a client joins, and 2 or more clients are already connected,
  //      we need to send them an offer to connect to each other
  setupRTCPeerConnections() {
	t.app.state.client_ids.forEach((client_id)=>{
        if(client_id !== t.app.state.my_client_id && !this.remote_peers?.[client_id]){
            // one connection per peer
            this.remote_peers[client_id] = this.setupRTCPeerConnection(client_id);
            // offer the stream to the peer
            this.offerStreamToPeer(client_id);
        }
    })
  }
  closeAll() {
      for(let i in this.local_peers){
          this.local_peers[i].close();
      }
  }
  /* handler for when a peer offers a video/audio stream */
  async onMediaOffer(decoded) {
    if(!t.stream){
        try{
            await t.setupVideoStream();
        }catch(e){
            console.error('error setting up outbound stream');
        }
    }
    t.root.is_streaming = true;
    // console.log('onMediaOffer',decoded);
    try {
      const FROM_PEER_ID = decoded.from;

      /* make sure we have a "remote peer" object for this client */
      let peer_remote = this.remote_peers?.[FROM_PEER_ID];
      if (!peer_remote) {
        // create a new container if we don't have one
        peer_remote = this.setupRTCPeerConnection(FROM_PEER_ID);
        // peer = t.webrtc_peer_connections?.[FROM_PEER_ID];
        this.remote_peers[FROM_PEER_ID] = peer_remote;
      }
      if (!peer_remote) {
        // if peer is STILL not set, something's gone wrong
        console.error("error with peer_remote", decoded);
        return;
      }

      // set the remote description as the offer
      await peer_remote.setRemoteDescription(new RTCSessionDescription(decoded.offer));

      // offer our audio, video tracks to the peer connection
      t.stream.getTracks().forEach((track) => {
        peer_remote.addTrack(track, t.stream)
      });

      /* create an answer to the offer */
      const peerAnswer = await peer_remote.createAnswer();

      // set the local description on the peer connection to our answer
      await peer_remote.setLocalDescription(new RTCSessionDescription(peerAnswer));

      // save call initiators stream settings (for aspect ratio calculations)
      this.peer_video_settings[FROM_PEER_ID] = decoded.stream_settings;
      if (this.peer_video_settings[FROM_PEER_ID]) {
        let ovss = this.peer_video_settings[FROM_PEER_ID];
        let aspect_ratio = ovss.width / ovss.height;
        // scale the player's head to match the source video aspect ratio
        // console.log('opponent head scale?',t?.players?.[FROM_PEER_ID]?.head?.mesh?.scale)
        t?.players?.[FROM_PEER_ID]?.head.mesh.scale.set(aspect_ratio, 1, 1);
        // console.log('opponent head scale?',t?.players?.[FROM_PEER_ID]?.head?.mesh?.scale)
      }

      // send the answer to the peer
      t.server.send({
        type: "mediaAnswer",
        answer: peerAnswer,
        from: t.app.state.my_client_id,
        to: FROM_PEER_ID,

        // extras
        stream_settings: t.stream.getVideoTracks()[0].getSettings(),
      });
    } catch (error) {
      console.error("onMediaOffer", error);
    }
  }

  /* handler for when a peer responds to our media offer */
  async onMediaAnswer(decoded) {
    // console.log('onMediaAnswer',decoded)
    let peer_connection = this.remote_peers[decoded.from];

    // store the answer as the remote description on the peer connection
    await peer_connection.setRemoteDescription(
      new RTCSessionDescription(decoded.answer)
    );

    // save call recipients stream settings (for aspect ratio calculations)
    this.peer_video_settings[decoded.from] = decoded.stream_settings;
    // TODO: dry this up
    // update opponent's "head" shape to match their video aspect ratio
    if (decoded.stream_settings) {
      let ovss = decoded.stream_settings;
      let aspect_ratio = ovss.width / ovss.height; // mobiel safari did not send .aspectRatio so calculate it
      // console.log('opponent head scale?',t?.players?.[getOpponentID()]?.head?.mesh?.scale)
      t?.players?.[decoded.from]?.head.mesh.scale.set(aspect_ratio, 1, 1);
      // console.log('opponent head scale?',t?.players?.[getOpponentID()]?.head?.mesh?.scale)
    }
  }
  setupRTCPeerConnection(client_id) {
    // fresh peer connection container
    const peer_connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });

    // event binding for ice candidates received
    peer_connection.onicecandidate = (event)=>{
        this.onIceCandidateEvent(event, client_id);
    };

    // const user_id = t.userIDForClientID(client_id);

    // callback for remote stream available, where we bind it to a video output object
    const gotRemoteStream = (event) => {
      console.log("gotRemoteStream", event);
      const [stream] = event.streams;
      this.peer_streams[client_id] = stream;
      let video = t.root.$refs.AVHud.$refs?.[`opponent_video_${client_id}`];
      if (!video || !video.length || video.length > 1) {
        console.error("video not found", video);
        return;
      }

      // assign stream to debug object
      if (video && video.length) {
        video[0].srcObject = stream;
      }

      let playerHead = t.players?.[client_id]?.head;
      console.log('playerHead',playerHead);
      playerHead.assignVideoToHead(video[0])
    };

    // bind the callback
    peer_connection.addEventListener("track", gotRemoteStream);

    // return the connection
    return peer_connection;
  }

  onIceCandidateEvent(event, client_id) {
    // const ids = t.app.state.client_ids.slice();
    // let my_index = ids.indexOf(t.app.state.my_client_id);
    // ids.splice(my_index, 1);
    if (event.candidate) {
      // should we send to all peers or just one by one?
    //   console.log(event);
      // debugger;
    //   ids.forEach((id) => {
    //     t.server.send({
    //       type: "iceCandidate",
    //       to: id,
    //       candidate: event.candidate,
    //     });
    //   });
        t.server.send({
            type: "iceCandidate",
            to: client_id,
            candidate: event.candidate,
        });
    } else {
      console.log("ignoring null candidate", event);
    }
  }

  async onRemotePeerIceCandidate(data) {
    console.warn('onRemotePeerIceCandidate',data);

    let candidate = null;
    try {
      candidate = new RTCIceCandidate(data.candidate);
    } catch (error) {
      console.error(error);
    }

    if (candidate) {
      let PEER_CONNECTION = this.remote_peers?.[data.client_id];
      // console.log('PEER_CONNECTION',PEER_CONNECTION);
      if (!PEER_CONNECTION) {
        console.error("no peer connection for", data.client_id);
        return;
      }
      try {
        await PEER_CONNECTION.addIceCandidate(candidate);
        console.log('ice candidate added');
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("no candidate", data.candidate);
    }
  }
}

export default PeerConnections;
