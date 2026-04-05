import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config/index.js';
import { fetchLeaderboard, fetchUserFills } from './hyperliquid.js';
import type { CopyTradeSignal, Trader } from '../types/index.js';

interface Client {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  userId?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();
  private traders: Map<string, Trader> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;

  initialize(port: number = 3002) {
    this.wss = new WebSocketServer({ port });
    
    console.log(`WebSocket server running on port ${port}`);
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateId();
      const client: Client = {
        id: clientId,
        ws,
        subscriptions: new Set(),
      };
      
      this.clients.set(clientId, client);
      console.log(`Client connected: ${clientId}`);
      
      this.sendToClient(client, {
        type: 'connected',
        payload: { clientId },
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
      });
      
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
      });
    });
    
    this.startPolling();
    
    return this;
  }

  private handleMessage(client: Client, message: any) {
    switch (message.type) {
      case 'subscribe':
        if (message.payload?.traderIds) {
          message.payload.traderIds.forEach((id: string) => {
            client.subscriptions.add(id);
          });
        }
        if (message.payload?.allTraders) {
          client.subscriptions.add('__all__');
        }
        this.sendToClient(client, {
          type: 'subscribed',
          payload: { subscriptions: Array.from(client.subscriptions) },
        });
        break;
        
      case 'unsubscribe':
        if (message.payload?.traderIds) {
          message.payload.traderIds.forEach((id: string) => {
            client.subscriptions.delete(id);
          });
        }
        if (message.payload?.allTraders) {
          client.subscriptions.delete('__all__');
        }
        break;
        
      case 'ping':
        this.sendToClient(client, { type: 'pong', payload: { timestamp: Date.now() } });
        break;
    }
  }

  private sendToClient(client: Client, message: any) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: any, filter?: (client: Client) => boolean) {
    this.clients.forEach((client) => {
      if (!filter || filter(client)) {
        this.sendToClient(client, message);
      }
    });
  }

  private startPolling() {
    this.pollInterval = setInterval(async () => {
      await this.pollTraderFills();
    }, config.trading.pollInterval);
  }

  private async pollTraderFills() {
    const traderAddresses = Array.from(this.traders.values())
      .filter(t => t.isActive)
      .map(t => t.address);
    
    for (const address of traderAddresses) {
      try {
        const fills = await fetchUserFills(address);
        
        fills.forEach((fill) => {
          const signal: CopyTradeSignal = {
            traderId: this.getTraderIdByAddress(address),
            traderAddress: address,
            traderName: this.getTraderNameByAddress(address),
            asset: fill.asset,
            side: fill.side === 'B' ? 'Long' : 'Short',
            price: parseFloat(fill.px) / 1e6,
            size: parseFloat(fill.sz),
            timestamp: fill.timestamp * 1000,
          };
          
          this.broadcastSignal(signal);
        });
      } catch (error) {
        console.error(`Poll error for ${address}:`, error);
      }
    }
  }

  private broadcastSignal(signal: CopyTradeSignal) {
    this.broadcast(
      { type: 'signal', payload: signal },
      (client) => {
        if (client.subscriptions.has('__all__')) return true;
        return client.subscriptions.has(signal.traderId);
      }
    );
  }

  async loadTraders() {
    const traders = await fetchLeaderboard();
    traders.forEach((trader) => {
      this.traders.set(trader.id, trader);
    });
    return traders;
  }

  setTraderActive(traderId: string, active: boolean) {
    const trader = this.traders.get(traderId);
    if (trader) {
      trader.isActive = active;
      trader.lastTradeTime = active ? Date.now() : undefined;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getTraderIdByAddress(address: string): string {
    for (const [id, trader] of this.traders) {
      if (trader.address.toLowerCase() === address.toLowerCase()) {
        return id;
      }
    }
    return address;
  }

  private getTraderNameByAddress(address: string): string {
    for (const trader of this.traders.values()) {
      if (trader.address.toLowerCase() === address.toLowerCase()) {
        return trader.name;
      }
    }
    return formatAddress(address);
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  shutdown() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    this.wss?.close();
    console.log('WebSocket server shut down');
  }
}

function formatAddress(address: string): string {
  if (!address || address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const wsService = new WebSocketService();
