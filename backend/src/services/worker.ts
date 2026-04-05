import { fetchLeaderboard, fetchUserFills, generateMockFills } from './hyperliquid.js';
import { createExecutionPlan } from './trading.js';
import { config } from '../config/index.js';
import type { CopyTradeSignal, UserSettings } from '../types/index.js';

const defaultSettings: UserSettings = {
  slippageTolerance: config.trading.defaultSlippageTolerance,
  positionSizeMode: 'proportional',
  fixedAmount: 100,
  proportionalPercent: 2,
  defaultStopLoss: config.trading.defaultStopLoss,
  defaultTakeProfit: config.trading.defaultTakeProfit,
  maxPositionSize: config.trading.maxPositionSize,
};

const subscribedTraders: Map<string, {
  subscribers: Set<string>;
  settings: UserSettings;
}> = new Map();

async function startWorker() {
  console.log('Copy Trading Worker started');
  
  setInterval(async () => {
    for (const [traderId, config] of subscribedTraders) {
      try {
        const fills = await fetchUserFills(config.subscribers.size > 0 ? 'mock' : 'mock');
        
        for (const fill of fills) {
          const signal: CopyTradeSignal = {
            traderId,
            traderAddress: fill.user,
            traderName: 'Trader',
            asset: fill.asset,
            side: fill.side === 'B' ? 'Long' : 'Short',
            price: parseFloat(fill.px) / 1e6,
            size: parseFloat(fill.sz),
            timestamp: fill.timestamp * 1000,
          };
          
          for (const userId of config.subscribers) {
            const plan = createExecutionPlan(
              signal,
              config.settings,
              10000,
              signal.price
            );
            
            if (plan.shouldExecute) {
              console.log(`Executing: ${plan.side} ${plan.size} ${plan.asset} @ $${plan.entryPrice}`);
            } else {
              console.log(`Skipped: ${plan.reason}`);
            }
          }
        }
      } catch (error) {
        console.error(`Worker error for ${traderId}:`, error);
      }
    }
  }, config.trading.pollInterval);
}

function subscribeToTrader(traderId: string, userId: string, settings?: UserSettings) {
  if (!subscribedTraders.has(traderId)) {
    subscribedTraders.set(traderId, {
      subscribers: new Set(),
      settings: settings || defaultSettings,
    });
  }
  
  subscribedTraders.get(traderId)!.subscribers.add(userId);
}

function unsubscribeFromTrader(traderId: string, userId: string) {
  const config = subscribedTraders.get(traderId);
  if (config) {
    config.subscribers.delete(userId);
    if (config.subscribers.size === 0) {
      subscribedTraders.delete(traderId);
    }
  }
}

function updateTraderSettings(traderId: string, settings: UserSettings) {
  const config = subscribedTraders.get(traderId);
  if (config) {
    config.settings = settings;
  }
}

startWorker();

export { subscribeToTrader, unsubscribeFromTrader, updateTraderSettings };
