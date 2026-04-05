import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mirror_trade',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  hyperliquid: {
    apiUrl: process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz/info',
    exchangeUrl: process.env.HYPERLIQUID_EXCHANGE_URL || 'https://api.hyperliquid.xyz/exchange',
    wsUrl: process.env.HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws',
  },
  
  trading: {
    defaultSlippageTolerance: parseFloat(process.env.DEFAULT_SLIPPAGE_TOLERANCE || '0.5'),
    defaultStopLoss: parseFloat(process.env.DEFAULT_STOP_LOSS || '5'),
    defaultTakeProfit: parseFloat(process.env.DEFAULT_TAKE_PROFIT || '10'),
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '1000'),
    pollInterval: 1000,
  },
};
