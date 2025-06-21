# StrangerChat - Omegle Clone

A modern, full-featured video chat application that connects strangers from around the world, built with React, Node.js, WebRTC, and Socket.IO.

## 🚀 Features

### Core Functionality
- **Real-time Video & Audio Chat**: WebRTC-powered peer-to-peer communication
- **Random Matching**: Instantly connect with strangers worldwide
- **Next Button**: Skip to find a new conversation partner
- **Text Chat**: Send messages alongside video calls
- **Media Controls**: Toggle camera and microphone on/off

### Modern UI/UX
- **Responsive Design**: Works perfectly on mobile and desktop
- **Beautiful Interface**: Gradient backgrounds with smooth animations
- **Real-time Status**: Connection status indicators and loading states
- **Professional Layout**: Clean, intuitive design inspired by modern chat apps

### Technical Features
- **WebRTC Integration**: Direct peer-to-peer video/audio streaming
- **Socket.IO Signaling**: Reliable real-time communication
- **React Router**: Seamless navigation between pages
- **TypeScript**: Full type safety throughout the application
- **Docker Support**: Easy deployment with containerization

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Socket.IO Client** for real-time communication

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **CORS** enabled for cross-origin requests
- **UUID** for room generation

### DevOps
- **Docker** & **Docker Compose**
- **Nodemon** for development hot reload
- **Concurrently** for running multiple processes

## 📁 Project Structure

```
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── HomePage.tsx         # Landing page with hero section
│   │   └── ChatRoom.tsx         # Main chat interface
│   ├── App.tsx                  # Main app component with routing
│   └── main.tsx                 # React entry point
├── server/                       # Backend Node.js server
│   ├── server.js               # Express server with Socket.IO
│   └── package.json            # Server dependencies
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Multi-stage Docker build
└── README.md                   # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stranger-chat
   ```

2. **Install client dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start both client and server**
   ```bash
   npm run dev:all
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Client (React)
   npm run dev

   # Terminal 2 - Server (Node.js)
   npm run server
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Docker Deployment

#### Production Deployment
```bash
docker-compose up --build
```

#### Development with Docker
```bash
docker-compose --profile dev up --build
```

## 🔧 Configuration

### Environment Variables
The application uses default configurations, but you can customize:

**Server Configuration:**
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode

**Client Configuration:**
- WebRTC STUN servers are configured to use Google's public STUN servers
- Socket.IO connects to `http://localhost:3001` by default

### STUN/TURN Servers
For production deployment, consider adding TURN servers for better NAT traversal:

```javascript
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## 🏗️ Architecture

### WebRTC Flow
1. User clicks "Start Chat" → Socket.IO finds available stranger
2. Server creates room and notifies both users
3. WebRTC offer/answer exchange through Socket.IO signaling
4. ICE candidates exchanged for NAT traversal
5. Direct peer-to-peer connection established
6. Video/audio streams and text messages flow directly between users

### Real-time Communication
- **Socket.IO** handles user matching and signaling
- **WebRTC** manages direct peer-to-peer media streams
- **Text chat** goes through Socket.IO for reliability

## 📱 Features in Detail

### Video Chat Interface
- **Dual video layout**: Side-by-side or stacked on mobile
- **Mirror effect**: Local video is mirrored for natural experience
- **Fallback screens**: Elegant loading and disconnection states
- **Media controls**: Prominent mute/unmute and camera toggle buttons

### User Matching System
- **Random pairing**: Users are matched instantly when available
- **Queue management**: Automatic waiting queue for unpaired users
- **Room cleanup**: Automatic cleanup when users disconnect
- **Next functionality**: Skip to new stranger with one click

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: Tailored layouts for phone, tablet, and desktop
- **Touch-friendly**: Large buttons and intuitive gestures
- **Performance**: Optimized for various screen sizes and connection speeds

## 🛡️ Safety & Privacy

### Built-in Safety Features
- **Anonymous by default**: No user registration or personal information required
- **Temporary connections**: All connections are ephemeral
- **No data persistence**: Messages and connections aren't stored
- **Age restriction**: 18+ disclaimer on landing page

### Recommended Additional Safety Measures
- Implement content moderation for text chat
- Add user reporting functionality
- Consider adding profanity filters
- Implement rate limiting for connections

## 🚀 Deployment

### Production Checklist
- [ ] Configure TURN servers for better connectivity
- [ ] Set up SSL/TLS certificates
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Configure proper CORS origins
- [ ] Set up load balancing for multiple servers

### Scaling Considerations
- Use Redis for session management across multiple server instances
- Implement horizontal scaling with load balancers
- Consider CDN for static assets
- Monitor WebRTC connection success rates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Test on multiple devices and browsers
- Keep components modular and reusable

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- WebRTC community for excellent documentation
- Socket.IO team for reliable real-time communication
- React and Vite teams for amazing development tools
- TailwindCSS for the utility-first CSS framework

---

**Note**: This application is designed for educational and demonstration purposes. For production use, implement additional security measures, content moderation, and compliance with local regulations.