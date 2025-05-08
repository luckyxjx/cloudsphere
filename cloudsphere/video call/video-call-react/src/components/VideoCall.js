import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import '@fortawesome/fontawesome-free/css/all.min.css';

const VideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 1rem;
  gap: 1rem;
  background: ${props => props.theme.background};
`;

const RoomInput = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 0.5rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}33;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: ${props => props.theme.primary};
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  flex: 1;
  overflow: hidden;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: ${props => props.theme.surface};
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.surface};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
`;

const ControlButton = styled.button`
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: ${props => props.theme.primary};
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.primaryDark};
    transform: scale(1.1);
  }

  &.danger {
    background: ${props => props.theme.danger};
    &:hover {
      background: #DC2626;
    }
  }

  &.muted {
    background: ${props => props.theme.textSecondary};
  }
`;

const StatusIndicator = styled.div`
  position: fixed;
  top: 5rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
`;

const Notification = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const VideoCall = () => {
  const [roomId, setRoomId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [status, setStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const socketRef = useRef();
  const localVideoRef = useRef();
  const peerConnections = useRef({});

  useEffect(() => {
    socketRef.current = io('https://192.168.255.39:3000', {
      transports: ['websocket'],
      rejectUnauthorized: false
    });

    socketRef.current.on('connect', () => {
      setStatus('Connected to server');
    });

    socketRef.current.on('disconnect', () => {
      setStatus('Disconnected from server');
    });

    socketRef.current.on('user-joined', handleUserJoined);
    socketRef.current.on('user-left', handleUserLeft);
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);

    return () => {
      socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setNotification('Error accessing camera and microphone');
    }
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: peerId
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [peerId]: event.streams[0]
      }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected') {
        handleUserLeft(peerId);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnections.current[peerId] = pc;
    return pc;
  };

  const handleUserJoined = async (userId) => {
    const pc = createPeerConnection(userId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('offer', {
        offer,
        to: userId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleUserLeft = (userId) => {
    if (peerConnections.current[userId]) {
      peerConnections.current[userId].close();
      delete peerConnections.current[userId];
    }
    setPeers(prev => {
      const newPeers = { ...prev };
      delete newPeers[userId];
      return newPeers;
    });
  };

  const handleOffer = async ({ offer, from }) => {
    const pc = createPeerConnection(from);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('answer', {
        answer,
        to: from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async ({ answer, from }) => {
    try {
      await peerConnections.current[from].setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async ({ candidate, from }) => {
    try {
      await peerConnections.current[from].addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (error) {
      console.error('Error adding ice candidate:', error);
    }
  };

  const joinRoom = async () => {
    if (!roomId) return;
    await startLocalStream();
    socketRef.current.emit('join-room', roomId);
    setStatus(`Joined room: ${roomId}`);
  };

  const leaveRoom = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setPeers({});
    setLocalStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    socketRef.current.emit('leave-room', roomId);
    setStatus('Left room');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setNotification(audioTrack.enabled ? 'Unmuted' : 'Muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        setNotification(videoTrack.enabled ? 'Video on' : 'Video off');
      }
    }
  };

  return (
    <VideoContainer>
      <RoomInput>
        <Input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <Button onClick={joinRoom} disabled={!roomId}>
          Join Room
        </Button>
      </RoomInput>

      <VideoGrid>
        {localStream && (
          <VideoWrapper>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
            />
          </VideoWrapper>
        )}
        {Object.entries(peers).map(([peerId, stream]) => (
          <VideoWrapper key={peerId}>
            <video
              autoPlay
              playsInline
              srcObject={stream}
            />
          </VideoWrapper>
        ))}
      </VideoGrid>

      {localStream && (
        <Controls>
          <ControlButton 
            onClick={toggleMute}
            className={isMuted ? 'muted' : ''}
          >
            <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`} />
          </ControlButton>
          <ControlButton 
            onClick={toggleVideo}
            className={isVideoOff ? 'muted' : ''}
          >
            <i className={`fas fa-video${isVideoOff ? '-slash' : ''}`} />
          </ControlButton>
          <ControlButton className="danger" onClick={leaveRoom}>
            <i className="fas fa-phone-slash" />
          </ControlButton>
        </Controls>
      )}

      {status && <StatusIndicator>{status}</StatusIndicator>}
      {notification && (
        <Notification
          onAnimationEnd={() => setTimeout(() => setNotification(null), 3000)}
        >
          {notification}
        </Notification>
      )}
    </VideoContainer>
  );
};

export default VideoCall; 