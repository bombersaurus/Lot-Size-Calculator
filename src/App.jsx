import { useState, useMemo } from 'react'

// Forex: 1 pip = 0.0001, $10/pip per lot. XAU: Lot = Risk / (Price Distance × 100).
const PIP_SIZE_FOREX = 0.0001
const PIP_VALUE_FOREX = 10
const XAU_MULTIPLIER = 100

function App() {
  const [assetType, setAssetType] = useState('forex')
  const [accountSize, setAccountSize] = useState('')
  const [priceDistance, setPriceDistance] = useState('')
  const [riskMode, setRiskMode] = useState('percent')
  const [riskPercent, setRiskPercent] = useState('')
  const [riskAmount, setRiskAmount] = useState('')

  const { lotSize, riskValue, formulaDenom, formulaLabel } = useMemo(() => {
    const account = parseFloat(accountSize) || 0
    const distance = parseFloat(priceDistance) || 0
    let risk = 0

    if (riskMode === 'percent') {
      const pct = parseFloat(riskPercent) || 0
      risk = account * (pct / 100)
    } else {
      risk = parseFloat(riskAmount) || 0
    }

    if (risk <= 0) {
      return { lotSize: 0, riskValue: risk, formulaDenom: 0, formulaLabel: '' }
    }

    if (assetType === 'xau') {
      if (distance <= 0) return { lotSize: 0, riskValue: risk, formulaDenom: 0, formulaLabel: '' }
      const denom = distance * XAU_MULTIPLIER
      const lot = risk / denom
      return {
        lotSize: Math.max(0, Math.round(lot * 100) / 100),
        riskValue: risk,
        formulaDenom: denom,
        formulaLabel: `${priceDistance || '0'} × 100`,
      }
    }

    if (distance <= 0) return { lotSize: 0, riskValue: risk, formulaDenom: 0, formulaLabel: '' }
    // If user enters a small number (e.g. 0.0020), it's price distance. If they enter 20+ it's pips.
    const pips = distance >= 1 ? distance : distance / PIP_SIZE_FOREX
    const denom = pips * PIP_VALUE_FOREX
    const lot = risk / denom
    return {
      lotSize: Math.max(0, Math.round(lot * 100) / 100),
      riskValue: risk,
      formulaDenom: denom,
      formulaLabel: `${pips >= 1 ? pips.toFixed(0) : (distance / PIP_SIZE_FOREX).toFixed(1)} pips × $10`,
    }
  }, [accountSize, priceDistance, riskMode, riskPercent, riskAmount, assetType])

  const lotSizeDisplay = lotSize % 1 === 0 ? lotSize.toFixed(0) : lotSize.toFixed(2)
  const riskDisplay = riskValue % 1 === 0 ? riskValue.toFixed(0) : riskValue.toFixed(2)

  return (
    <div className="min-h-screen bg-[#333333] flex items-center justify-center p-6 font-sans">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#474747] p-8 md:p-12 overflow-hidden"
        style={{
          boxShadow: `
            inset 2px 2px 4px rgba(0,0,0,0.2),
            inset -1px -1px 2px rgba(255,255,255,0.04)
          `,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, rgba(181,232,181,0.5), transparent 80%)' }}
        />
        <div
          className="absolute top-0 left-0 w-px h-full pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(181,232,181,0.5), transparent 80%)' }}
        />

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Lot Size Calculator
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            {assetType === 'forex' ? 'Forex & Crypto' : 'XAU/USD Gold'} position sizing
          </p>

          {/* Asset toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAssetType('forex')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                assetType === 'forex'
                  ? 'bg-[#B5E8B5]/20 text-[#B5E8B5] border border-[#B5E8B5]/50'
                  : 'bg-[#333333] text-neutral-400 border border-[#333333] hover:bg-[#333333]/90'
              }`}
            >
              Standard Forex
            </button>
            <button
              type="button"
              onClick={() => setAssetType('xau')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                assetType === 'xau'
                  ? 'bg-[#B5E8B5]/20 text-[#B5E8B5] border border-[#B5E8B5]/50'
                  : 'bg-[#333333] text-neutral-400 border border-[#333333] hover:bg-[#333333]/90'
              }`}
            >
              XAU/USD
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-neutral-400 text-sm font-medium mb-2">
                Account Size ($)
              </label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#333333] text-white placeholder-neutral-500 border border-[#474747] focus:border-[#B5E8B5] focus:ring-1 focus:ring-[#B5E8B5]/40 outline-none transition-all"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm font-medium mb-2">
                Stop Loss Price Distance ($)
              </label>
              <input
                type="number"
                value={priceDistance}
                onChange={(e) => setPriceDistance(e.target.value)}
                step={assetType === 'xau' ? '0.01' : '0.0001'}
                className="w-full px-4 py-3 rounded-xl bg-[#333333] text-white placeholder-neutral-500 border border-[#474747] focus:border-[#B5E8B5] focus:ring-1 focus:ring-[#B5E8B5]/40 outline-none transition-all"
                placeholder={assetType === 'xau' ? '1.243' : '0.0020'}
              />
              <p className="text-neutral-500 text-xs mt-1.5">
                {assetType === 'xau'
                  ? 'Entry price − stop loss price'
                  : 'Enter pips (20) or price distance (0.0020) for EUR/USD'}
              </p>
            </div>

            <div>
              <label className="block text-neutral-400 text-sm font-medium mb-3">
                Risk
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setRiskMode('percent')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    riskMode === 'percent'
                      ? 'bg-[#B5E8B5]/20 text-[#B5E8B5] border border-[#B5E8B5]/50'
                      : 'bg-[#333333] text-neutral-400 border border-[#333333] hover:bg-[#333333]/90'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setRiskMode('amount')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    riskMode === 'amount'
                      ? 'bg-[#B5E8B5]/20 text-[#B5E8B5] border border-[#B5E8B5]/50'
                      : 'bg-[#333333] text-neutral-400 border border-[#333333] hover:bg-[#333333]/90'
                  }`}
                >
                  Fixed ($)
                </button>
              </div>
              {riskMode === 'percent' ? (
                <input
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#333333] text-white placeholder-neutral-500 border border-[#474747] focus:border-[#B5E8B5] focus:ring-1 focus:ring-[#B5E8B5]/40 outline-none transition-all"
                  placeholder="1"
                  step="0.1"
                />
              ) : (
                <input
                  type="number"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#333333] text-white placeholder-neutral-500 border border-[#474747] focus:border-[#B5E8B5] focus:ring-1 focus:ring-[#B5E8B5]/40 outline-none transition-all"
                  placeholder="100"
                />
              )}
            </div>

            {/* Output section */}
            <div className="pt-8 border-t border-[#333333]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#333333] p-5 border border-[#474747]/80">
                  <p className="text-neutral-400 text-sm mb-1">Lot Size</p>
                  <p className="text-2xl font-semibold text-white tabular-nums">
                    {lotSizeDisplay}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#333333] p-5 border border-[#474747]/80">
                  <p className="text-neutral-400 text-sm mb-1">At Risk</p>
                  <p className="text-2xl font-semibold text-[#B5E8B5] tabular-nums">
                    ${riskDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* Formula */}
            {formulaDenom > 0 && (
              <div className="mt-6 pt-6 border-t border-[#333333]">
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">
                  Calculation
                </p>
                <p className="font-mono text-neutral-400 text-sm">
                  Lot = ${riskDisplay} ÷ ({formulaLabel}) = ${riskDisplay} ÷ {formulaDenom.toFixed(2)} = <span className="text-[#B5E8B5] font-semibold">{lotSizeDisplay}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
