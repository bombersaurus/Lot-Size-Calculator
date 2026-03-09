import { useState, useMemo } from 'react'

const PIP_VALUES = {
  forex: 10,   // 1 lot = 100k units, 1 pip = $10
  xau: 1,      // 1 lot = 100 oz, 1 pip (0.01 move) = $1
}

function App() {
  const [assetType, setAssetType] = useState('forex')
  const [accountSize, setAccountSize] = useState('10000')
  const [stopLoss, setStopLoss] = useState('20')
  const [riskMode, setRiskMode] = useState('percent')
  const [riskPercent, setRiskPercent] = useState('1')
  const [riskAmount, setRiskAmount] = useState('100')

  const pipValue = PIP_VALUES[assetType]

  const { lotSize, riskValue } = useMemo(() => {
    const account = parseFloat(accountSize) || 0
    const sl = parseFloat(stopLoss) || 0
    let risk = 0

    if (riskMode === 'percent') {
      const pct = parseFloat(riskPercent) || 0
      risk = account * (pct / 100)
    } else {
      risk = parseFloat(riskAmount) || 0
    }

    if (sl <= 0 || risk <= 0) {
      return { lotSize: 0, riskValue: risk }
    }

    const lot = risk / (sl * pipValue)
    return {
      lotSize: Math.max(0, Math.round(lot * 100) / 100),
      riskValue: risk,
    }
  }, [accountSize, stopLoss, riskMode, riskPercent, riskAmount, pipValue])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background depth: subtle radial gradient blur */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(251,146,60,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Asset toggle - spans full width */}
        <div className="lg:col-span-3">
          <div className="flex gap-2 p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setAssetType('forex')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                assetType === 'forex'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              Standard Forex
            </button>
            <button
              type="button"
              onClick={() => setAssetType('xau')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                assetType === 'xau'
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:text-neutral-400'
              }`}
            >
              XAU / Gold
            </button>
          </div>
        </div>

        {/* Inputs card - bento left/main */}
        <div className="lg:col-span-2 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-1">
            Lot Size Calculator
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            {assetType === 'forex' ? 'Forex & Crypto' : 'XAU/USD Gold'} position sizing
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">
                Account Size ($)
              </label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-neutral-600 border-0 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0 outline-none transition-all"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">
                Stop Loss ({assetType === 'xau' ? 'points (0.01 = 1)' : 'pips'})
              </label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-neutral-600 border-0 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0 outline-none transition-all"
                placeholder={assetType === 'xau' ? '10' : '20'}
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-xs font-medium uppercase tracking-wider mb-3">
                Risk
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setRiskMode('percent')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    riskMode === 'percent'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-black/40 text-neutral-500 border-0 hover:text-neutral-400'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setRiskMode('amount')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    riskMode === 'amount'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-black/40 text-neutral-500 border-0 hover:text-neutral-400'
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
                  className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-neutral-600 border-0 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0 outline-none transition-all"
                  placeholder="1"
                  step="0.1"
                />
              ) : (
                <input
                  type="number"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-neutral-600 border-0 focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0 outline-none transition-all"
                  placeholder="100"
                />
              )}
            </div>
          </div>
        </div>

        {/* Results cards - bento right, stacked */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">
              Lot Size
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white tabular-nums leading-tight">
              {lotSize.toFixed(2)}
            </p>
          </div>
          <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-2">
              At Risk
            </p>
            <p className="text-4xl md:text-5xl font-bold text-white tabular-nums leading-tight">
              ${riskValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
