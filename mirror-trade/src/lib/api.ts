const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data as T;
}

export const api = {
  traders: {
    list: () => fetchApi('/api/traders'),
    getFills: (address: string) => fetchApi(`/api/traders/${address}/fills`),
  },
  
  prices: {
    all: () => fetchApi<Record<string, string>>('/api/prices'),
  },
  
  simulate: (params: {
    signal: any;
    settings: any;
    walletBalance: number;
    currentPrice: number;
  }) => fetchApi('/api/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
  
  calculatePnL: (params: {
    entryPrice: number;
    currentPrice: number;
    size: number;
    side: 'Long' | 'Short';
  }) => fetchApi('/api/calculate-pnl', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
  
  ws: {
    clients: () => fetchApi<{ count: number }>('/api/ws/clients'),
  },
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions: Set<string> = new Set();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_BASE);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      if (this.subscriptions.size > 0) {
        this.send({ type: 'subscribe', payload: { traderIds: Array.from(this.subscriptions) } });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'signal') {
          this.emit('signal', message.payload);
        }
        
        this.emit(message.type, message.payload);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }

  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(traderIds: string[]) {
    traderIds.forEach(id => this.subscriptions.add(id));
    this.send({ type: 'subscribe', payload: { traderIds } });
  }

  unsubscribe(traderIds: string[]) {
    traderIds.forEach(id => this.subscriptions.delete(id));
    this.send({ type: 'unsubscribe', payload: { traderIds } });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
