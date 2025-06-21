import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  SkipForward, 
  Home, 
  Send,
  Loader2,
  UserX,
  Users
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  isOwnMessage: boolean;
  timestamp: Date;
}

const ChatRoom: React.FC = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'searching' | 'connected'>('disconnected');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  // Media states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    // Socket event listeners
    newSocket.on('waiting-for-stranger', () => {
      setConnectionStatus('searching');
      setIsConnecting(true);
    });

    newSocket.on('stranger-found', async ({ roomId: newRoomId, partnerId: newPartnerId }) => {
      console.log('Stranger found!', { roomId: newRoomId, partnerId: newPartnerId });
      setRoomId(newRoomId);
      setPartnerId(newPartnerId);
      setConnectionStatus('connected');
      setIsConnecting(false);
      await initializeCall(newSocket, newRoomId);
    });

    newSocket.on('stranger-disconnected', () => {
      handleStrangerDisconnected();
    });

    newSocket.on('disconnected', () => {
      handleStrangerDisconnected();
    });

    // WebRTC signaling events
    newSocket.on('webrtc-offer', async (data) => {
      await handleReceiveOffer(data.offer);
    });

    newSocket.on('webrtc-answer', async (data) => {
      await handleReceiveAnswer(data.answer);
    });

    newSocket.on('webrtc-ice-candidate', async (data) => {
      await handleReceiveIceCandidate(data.candidate);
    });

    // Chat events
    newSocket.on('receive-message', (data) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        isOwnMessage: false,
        timestamp: new Date(data.timestamp)
      };
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      newSocket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeCall = async (socketInstance: Socket, roomId: string) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(rtcConfiguration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log(remoteStream);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit('webrtc-ice-candidate', {
            roomId,
            candidate: event.candidate
          });
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socketInstance.emit('webrtc-offer', {
        roomId,
        offer
      });

    } catch (error) {
      console.error('Error initializing call:', error);
    }
  };

  const handleReceiveOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnectionRef.current) return;
      
      await peerConnectionRef.current.setRemoteDescription(offer);
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      if (socket && roomId) {
        socket.emit('webrtc-answer', {
          roomId,
          answer
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleReceiveAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleReceiveIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleStrangerDisconnected = () => {
    setConnectionStatus('disconnected');
    setRoomId(null);
    setPartnerId(null);
    setMessages([]);
    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleStartChat = () => {
    if (socket && isConnected) {
      setIsConnecting(true);
      socket.emit('find-stranger');
    }
  };

  const handleNext = () => {
    if (socket) {
      socket.emit('next-stranger');
      setIsConnecting(true);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && socket && roomId) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageInput.trim(),
        isOwnMessage: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      socket.emit('send-message', {
        roomId,
        message: messageInput.trim()
      });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'searching':
        return 'Searching for a stranger...';
      case 'connected':
        return 'Connected to stranger';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'searching':
        return 'text-yellow-400';
      case 'connected':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              {connectionStatus === 'searching' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : connectionStatus === 'connected' ? (
                <Users className="w-4 h-4" />
              ) : (
                <UserX className="w-4 h-4" />
              )}
              <span className="text-sm">{getStatusText()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectionStatus === 'disconnected' && (
              <button
                onClick={handleStartChat}
                disabled={!isConnected || isConnecting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                <span>Start Chat</span>
              </button>
            )}
            {connectionStatus === 'connected' && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span className="hidden sm:inline">Next</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto h-[calc(100vh-70px)]">
        {/* Video Section */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    {connectionStatus === 'searching' ? (
                      <>
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-300">Looking for someone to chat with...</p>
                      </>
                    ) : connectionStatus === 'connected' ? (
                      <>
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">Waiting for stranger's video...</p>
                      </>
                    ) : (
                      <>
                        <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">No stranger connected</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-sm">
                Stranger
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-sm">
                You
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-96 flex flex-col bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Chat</h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No messages yet.</p>
                <p className="text-sm mt-2">Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={connectionStatus === 'connected' ? 'Type a message...' : 'Connect to chat'}
                disabled={connectionStatus !== 'connected'}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim() || connectionStatus !== 'connected'}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;