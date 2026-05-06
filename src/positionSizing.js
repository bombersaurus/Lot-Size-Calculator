export const ASSET_PRESETS = {
  forex: {
    id: 'forex',
    label: 'Forex',
    caption: 'EUR/USD style pairs',
    model: 'pip',
    pipSize: 0.0001,
    pipValuePerLot: 10,
    sizeLabel: 'Lots',
    hint: 'Use pips or price distance.',
  },
  jpy: {
    id: 'jpy',
    label: 'JPY FX',
    caption: 'USD/JPY style pairs',
    model: 'pip',
    pipSize: 0.01,
    pipValuePerLot: 9.1,
    sizeLabel: 'Lots',
    hint: 'JPY pairs usually use 0.01 as one pip.',
  },
  xau: {
    id: 'xau',
    label: 'XAU/USD',
    caption: 'Gold, 100 oz contract',
    model: 'contract',
    contractSize: 100,
    sizeLabel: 'Lots',
    hint: 'One lot moves about $100 per $1.00 gold move.',
  },
  indices: {
    id: 'indices',
    label: 'Index CFD',
    caption: 'US30/NAS style CFDs',
    model: 'contract',
    contractSize: 1,
    sizeLabel: 'Contracts',
    hint: 'Set the point value to your broker contract size.',
  },
  crypto: {
    id: 'crypto',
    label: 'Crypto',
    caption: 'Spot or linear contracts',
    model: 'contract',
    contractSize: 1,
    sizeLabel: 'Units',
    hint: 'Set contract size to 1 for spot units.',
  },
}

const EMPTY_RESULT = {
  riskValue: 0,
  stopDistance: 0,
  stopPips: 0,
  lossPerSize: 0,
  positionSize: 0,
  microLots: 0,
  potentialReward: 0,
  formula: '',
  issues: [],
}

export function toNumber(value) {
  if (value === '' || value === null || value === undefined) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function roundTo(value, decimals = 5) {
  const scale = 10 ** decimals
  return Math.round((value + Number.EPSILON) * scale) / scale
}

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: options.maximumFractionDigits ?? 5,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function calculatePositionSize(input) {
  const preset = ASSET_PRESETS[input.assetType] ?? ASSET_PRESETS.forex
  const accountSize = Math.max(0, toNumber(input.accountSize))
  const riskPercent = Math.max(0, toNumber(input.riskPercent))
  const fixedRisk = Math.max(0, toNumber(input.riskAmount))
  const riskValue = input.riskMode === 'amount' ? fixedRisk : accountSize * (riskPercent / 100)
  const rewardR = Math.max(0, toNumber(input.rewardR))
  const commission = Math.max(0, toNumber(input.commission))

  const rawDistance =
    input.stopMode === 'entry'
      ? Math.abs(toNumber(input.entryPrice) - toNumber(input.stopPrice))
      : Math.max(0, toNumber(input.stopDistance))

  const issues = []
  if (input.riskMode === 'percent' && accountSize <= 0) issues.push('Enter account size.')
  if (riskValue <= 0) issues.push('Enter risk.')
  if (rawDistance <= 0) issues.push('Enter stop distance.')

  if (issues.length > 0) {
    return { ...EMPTY_RESULT, riskValue, stopDistance: rawDistance, issues }
  }

  if (preset.model === 'pip') {
    const distanceIsPips =
      input.stopMode === 'distance' &&
      (input.distanceUnit === 'pips' || (input.distanceUnit === 'auto' && rawDistance >= 1))
    const stopPips = distanceIsPips ? rawDistance : rawDistance / preset.pipSize
    const lossPerLot = stopPips * preset.pipValuePerLot + commission
    const positionSize = lossPerLot > 0 ? riskValue / lossPerLot : 0

    return {
      riskValue,
      stopDistance: rawDistance,
      stopPips,
      lossPerSize: lossPerLot,
      positionSize: roundTo(Math.max(0, positionSize), 5),
      microLots: Math.max(0, Math.round(positionSize * 100)),
      potentialReward: riskValue * rewardR,
      formula: `Risk ${formatMoney(riskValue)} / (${formatNumber(stopPips, {
        maximumFractionDigits: 2,
      })} pips x ${formatMoney(preset.pipValuePerLot)}${commission > 0 ? ` + ${formatMoney(commission)}` : ''})`,
      issues,
    }
  }

  const contractSize = Math.max(0.000001, toNumber(input.customContractSize) || preset.contractSize)
  const lossPerUnit = rawDistance * contractSize + commission
  const positionSize = lossPerUnit > 0 ? riskValue / lossPerUnit : 0

  return {
    riskValue,
    stopDistance: rawDistance,
    stopPips: 0,
    lossPerSize: lossPerUnit,
    positionSize: roundTo(Math.max(0, positionSize), 5),
    microLots: 0,
    potentialReward: riskValue * rewardR,
    formula: `Risk ${formatMoney(riskValue)} / (${formatNumber(rawDistance, {
      maximumFractionDigits: 5,
    })} points x ${formatNumber(contractSize, { maximumFractionDigits: 4 })}${
      commission > 0 ? ` + ${formatMoney(commission)}` : ''
    })`,
    issues,
  }
}
