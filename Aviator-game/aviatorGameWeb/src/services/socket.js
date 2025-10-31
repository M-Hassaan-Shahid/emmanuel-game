import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:8000';

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('✅ Socket connected to backend:', SOCKET_URL);
  console.log('🔌 Socket ID:', socket.id);

  // Authenticate user with backend when socket connects
  const userId = localStorage.getItem('userId');
  if (userId) {
    socket.emit('authenticate', userId);
    console.log('🔐 Authenticated user:', userId);
  }
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket disconnected from backend');
});

export default socket;
