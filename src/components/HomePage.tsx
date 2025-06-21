import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MessageCircle, Globe, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Stranger<span className="text-blue-400">Chat</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect with random strangers from around the world through video chat.
            <br />
            <span className="text-blue-400">Anonymous. Instant. Exciting.</span>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Video className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Video Chat</h3>
            <p className="text-gray-300 text-sm">High-quality video calls with strangers worldwide</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Text Chat</h3>
            <p className="text-gray-300 text-sm">Send messages alongside your video conversation</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Anonymous</h3>
            <p className="text-gray-300 text-sm">Chat safely without revealing your identity</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-8">
          <button
            onClick={handleStartChat}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-full hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
          >
            <span className="flex items-center">
              <Globe className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Start Chatting Now
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row gap-8 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-blue-400">1M+</div>
            <div className="text-gray-400 text-sm">Conversations</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-green-400">24/7</div>
            <div className="text-gray-400 text-sm">Available</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-purple-400">190+</div>
            <div className="text-gray-400 text-sm">Countries</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center max-w-2xl">
          <p className="text-gray-400 text-sm">
            By using StrangerChat, you agree to be respectful and follow our community guidelines.
            <br />
            You must be 18+ to use this service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;