import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://taxi-transportdange.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.io server with JWT token
   */
  connect() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token available for socket connection');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupDefaultListeners();
  }

  /**
   * Setup default connection event listeners
   */
  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Listen to a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);
    
    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   */
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      // Remove all custom listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();

      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Setup mission event listeners
   * @param {Function} onNewMission - Callback for new mission
   * @param {Function} onConfirmedMission - Callback for confirmed mission
   * @param {Function} onAssignedMission - Callback for assigned mission
   * @param {Function} onModifiedMission - Callback for modified mission
   */
  setupMissionListeners({ 
    onNewMission, 
    onConfirmedMission, 
    onAssignedMission, 
    onModifiedMission 
  }) {
    if (onNewMission) {
      this.on('mission:nouvelle', onNewMission);
    }
    if (onConfirmedMission) {
      this.on('mission:confirmee', onConfirmedMission);
    }
    if (onAssignedMission) {
      this.on('mission:assignee', onAssignedMission);
    }
    if (onModifiedMission) {
      this.on('mission:modifiee', onModifiedMission);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
