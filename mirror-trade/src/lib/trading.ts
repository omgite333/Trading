import type { CopyTradeSignal, TraderSettings, Position } from '@/types';

export function calculatePositionSize(
  signal: CopyTradeSignal,
  settings: TraderSettings,
  walletBalance: number
): number {
  if (settings.positionSizeMode === 'fixed') {
    return Math.min(settings.fixedAmount, settings.maxPositionSize);
  }
  
  const proportionalAmount = (walletBalance * settings.proportionalPercent) / 100;
  return Math.min(proportionalAmount, settings.maxPositionSize);
}

export function calculateStopLoss(
  entryPrice: number,
  side: 'Long' | 'Short',
  stopLossPercent: number
): number {
  const slFactor = stopLossPercent / 100;
  if (side === 'Long') {
    return entryPrice * (1 - slFactor);
  }
  return entryPrice * (1 + slFactor);
}

export function calculateTakeProfit(
  entryPrice: number,
  side: 'Long' | 'Short',
  takeProfitPercent: number
): number {
  const tpFactor = takeProfitPercent / 100;
  if (side === 'Long') {
    return entryPrice * (1 + tpFactor);
  }
  return entryPrice * (1 - tpFactor);
}

export function checkSlippage(
  entryPrice: number,
  currentPrice: number,
  maxSlippage: number
): boolean {
  const slippage = Math.abs((currentPrice - entryPrice) / entryPrice) * 100;
  return slippage <= maxSlippage;
}

export function generateCopyTrade(
  signal: CopyTradeSignal,
  settings: TraderSettings,
  walletBalance: number
): {
  asset: string;
  side: 'Long' | 'Short';
  size: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  shouldExecute: boolean;
  reason?: string;
} {
  const currentPrice = signal.price;
  
  if (!checkSlippage(signal.price, currentPrice, settings.slippageTolerance)) {
    return {
      asset: signal.asset,
      side: signal.side,
      size: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      shouldExecute: false,
      reason: 'Slippage exceeds tolerance',
    };
  }
  
  const size = calculatePositionSize(signal, settings, walletBalance);
  const sizeInAsset = size / currentPrice;
  
  if (sizeInAsset < 0.001) {
    return {
      asset: signal.asset,
      side: signal.side,
      size: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      shouldExecute: false,
      reason: 'Position size too small',
    };
  }
  
  return {
    asset: signal.asset,
    side: signal.side,
    size: sizeInAsset,
    entryPrice: currentPrice,
    stopLoss: calculateStopLoss(currentPrice, signal.side, settings.defaultStopLoss),
    takeProfit: calculateTakeProfit(currentPrice, signal.side, settings.defaultTakeProfit),
    shouldExecute: true,
  };
}

export function simulateOrderExecution(
  order: ReturnType<typeof generateCopyTrade>
): Promise<{ success: boolean; fillPrice: number; orderId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const slippage = (Math.random() - 0.5) * 0.002 * order.entryPrice;
      resolve({
        success: true,
        fillPrice: order.entryPrice + slippage,
        orderId: `order-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
    }, 100 + Math.random() * 200);
  });
}

export function calculatePnL(position: Position): {
  unrealizedPnl: number;
  pnlPercent: number;
  distanceToSL: number;
  distanceToTP: number;
} {
  const currentPrice = position.currentPrice;
  const entryPrice = position.entryPrice;
  const size = position.size;
  
  let unrealizedPnl: number;
  if (position.side === 'Long') {
    unrealizedPnl = (currentPrice - entryPrice) * size;
  } else {
    unrealizedPnl = (entryPrice - currentPrice) * size;
  }
  
  const pnlPercent = (unrealizedPnl / (entryPrice * size)) * 100;
  
  let distanceToSL: number;
  let distanceToTP: number;
  
  if (position.side === 'Long') {
    distanceToSL = position.stopLoss ? ((entryPrice - (position.stopLoss || 0)) / entryPrice) * 100 : 0;
    distanceToTP = position.takeProfit ? ((position.takeProfit - entryPrice) / entryPrice) * 100 : 0;
  } else {
    distanceToSL = position.stopLoss ? (((position.stopLoss || 0) - entryPrice) / entryPrice) * 100 : 0;
    distanceToTP = position.takeProfit ? ((entryPrice - position.takeProfit) / entryPrice) * 100 : 0;
  }
  
  return { unrealizedPnl, pnlPercent, distanceToSL, distanceToTP };
}
