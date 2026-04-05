import type { CopyTradeSignal, UserSettings } from '../types/index.js';
import Decimal from 'decimal.js';

export function calculatePositionSize(
  signal: CopyTradeSignal,
  settings: UserSettings,
  walletBalance: number
): number {
  if (settings.positionSizeMode === 'fixed') {
    return Math.min(settings.fixedAmount, settings.maxPositionSize);
  }
  
  const proportionalAmount = new Decimal(walletBalance)
    .times(settings.proportionalPercent)
    .dividedBy(100)
    .toNumber();
  
  return Math.min(proportionalAmount, settings.maxPositionSize);
}

export function calculateStopLoss(
  entryPrice: number,
  side: 'Long' | 'Short',
  stopLossPercent: number
): number {
  const factor = new Decimal(stopLossPercent).dividedBy(100);
  
  if (side === 'Long') {
    return new Decimal(entryPrice).times(new Decimal(1).minus(factor)).toNumber();
  }
  return new Decimal(entryPrice).times(new Decimal(1).plus(factor)).toNumber();
}

export function calculateTakeProfit(
  entryPrice: number,
  side: 'Long' | 'Short',
  takeProfitPercent: number
): number {
  const factor = new Decimal(takeProfitPercent).dividedBy(100);
  
  if (side === 'Long') {
    return new Decimal(entryPrice).times(new Decimal(1).plus(factor)).toNumber();
  }
  return new Decimal(entryPrice).times(new Decimal(1).minus(factor)).toNumber();
}

export function checkSlippage(
  entryPrice: number,
  currentPrice: number,
  maxSlippage: number
): { allowed: boolean; slippage: number } {
  const slippage = new Decimal(currentPrice)
    .minus(entryPrice)
    .abs()
    .dividedBy(entryPrice)
    .times(100)
    .toNumber();
  
  return {
    allowed: slippage <= maxSlippage,
    slippage,
  };
}

export function calculatePnL(
  entryPrice: number,
  currentPrice: number,
  size: number,
  side: 'Long' | 'Short'
): { unrealizedPnl: number; pnlPercent: number } {
  const entryValue = new Decimal(entryPrice).times(size);
  
  let unrealizedPnl: Decimal;
  if (side === 'Long') {
    unrealizedPnl = new Decimal(currentPrice).minus(entryPrice).times(size);
  } else {
    unrealizedPnl = new Decimal(entryPrice).minus(currentPrice).times(size);
  }
  
  const pnlPercent = unrealizedPnl.dividedBy(entryValue).times(100).toNumber();
  
  return {
    unrealizedPnl: unrealizedPnl.toNumber(),
    pnlPercent,
  };
}

export interface ExecutionPlan {
  asset: string;
  side: 'Long' | 'Short';
  size: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  shouldExecute: boolean;
  reason?: string;
}

export function createExecutionPlan(
  signal: CopyTradeSignal,
  settings: UserSettings,
  walletBalance: number,
  currentPrice: number
): ExecutionPlan {
  const slippageCheck = checkSlippage(signal.price, currentPrice, settings.slippageTolerance);
  
  if (!slippageCheck.allowed) {
    return {
      asset: signal.asset,
      side: signal.side,
      size: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      shouldExecute: false,
      reason: `Slippage ${slippageCheck.slippage.toFixed(2)}% exceeds tolerance ${settings.slippageTolerance}%`,
    };
  }
  
  const sizeInUsd = calculatePositionSize(signal, settings, walletBalance);
  const sizeInAsset = new Decimal(sizeInUsd).dividedBy(currentPrice).toNumber();
  
  if (sizeInAsset < 0.0001) {
    return {
      asset: signal.asset,
      side: signal.side,
      size: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      shouldExecute: false,
      reason: 'Position size too small after price conversion',
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

export function formatAddress(address: string): string {
  if (!address || address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
