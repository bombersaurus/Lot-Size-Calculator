import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import {
  ASSET_PRESETS,
  calculatePositionSize,
  formatMoney,
  formatNumber
} from "./positionSizing.js";
const STORAGE_KEY = "lot-calculator:v3";
const DEFAULT_FORM = {
  assetType: "forex",
  accountSize: "",
  riskMode: "percent",
  riskPercent: "1",
  riskAmount: "",
  stopMode: "distance",
  stopDistance: "",
  distanceUnit: "auto",
  entryPrice: "",
  stopPrice: "",
  customContractSize: "",
  commission: "",
  rewardR: "2"
};
const riskPresets = ["0.25", "0.5", "1", "2"];
const rewardPresets = ["1", "1.5", "2", "3"];
function App() {
  const [form, setForm] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_FORM, ...JSON.parse(saved) } : DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);
  const preset = ASSET_PRESETS[form.assetType] ?? ASSET_PRESETS.forex;
  const result = useMemo(() => calculatePositionSize(form), [form]);
  const hasResult = result.issues.length === 0 && result.positionSize > 0;
  const rewardMultiple = Number(form.rewardR) > 0 ? Number(form.rewardR) : 0;
  const rewardBarWidth = Math.min(100, Math.max(8, rewardMultiple * 24));
  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }
  function resetForm() {
    setForm(DEFAULT_FORM);
  }
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#0F1216] text-slate-100", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "grid gap-4 rounded-xl border border-slate-800 bg-[#171B21] p-4 shadow-2xl shadow-black/25 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase text-[#74D99F]", children: "Live position planner" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-1 text-3xl font-semibold tracking-normal text-white md:text-4xl", children: "Lot Size Calculator" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-slate-400", children: "Size trades across forex, gold, indices, and crypto with stop distance, commission, and target reward in one view." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 md:min-w-[380px]", children: [
        /* @__PURE__ */ jsx(Metric, { label: "Instrument", value: preset.label }),
        /* @__PURE__ */ jsx(Metric, { label: "Risk", value: formatMoney(result.riskValue) }),
        /* @__PURE__ */ jsx(Metric, { label: "Target", value: formatMoney(result.potentialReward), tone: "blue" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_390px]", children: [
      /* @__PURE__ */ jsxs("section", { className: "grid gap-5", children: [
        /* @__PURE__ */ jsxs(Panel, { title: "Instrument", kicker: "Preset", children: [
          /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-5", children: Object.values(ASSET_PRESETS).map((asset) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => updateField("assetType", asset.id),
              className: `min-h-24 rounded-xl border p-3 text-left transition ${form.assetType === asset.id ? "border-[#74D99F] bg-[#162A20] text-white shadow-lg shadow-[#74D99F]/10" : "border-slate-800 bg-[#14181D] text-slate-300 hover:border-slate-600 hover:bg-[#181E25]"}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "block text-base font-semibold", children: asset.label }),
                /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs leading-5 text-slate-400", children: asset.caption })
              ]
            },
            asset.id
          )) }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-slate-500", children: preset.hint })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Panel, { title: "Account", kicker: "Balance", children: /* @__PURE__ */ jsx(
            NumberField,
            {
              label: "Account size",
              prefix: "$",
              value: form.accountSize,
              placeholder: "10000",
              onChange: (value) => updateField("accountSize", value)
            }
          ) }),
          /* @__PURE__ */ jsxs(Panel, { title: "Risk", kicker: "Per trade", children: [
            /* @__PURE__ */ jsx(
              SegmentedControl,
              {
                value: form.riskMode,
                onChange: (value) => updateField("riskMode", value),
                options: [
                  { value: "percent", label: "Percent" },
                  { value: "amount", label: "Fixed cash" }
                ]
              }
            ),
            form.riskMode === "percent" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                NumberField,
                {
                  label: "Risk percent",
                  suffix: "%",
                  value: form.riskPercent,
                  placeholder: "1",
                  step: "0.1",
                  onChange: (value) => updateField("riskPercent", value)
                }
              ),
              /* @__PURE__ */ jsx(QuickButtons, { values: riskPresets, suffix: "%", onPick: (value) => updateField("riskPercent", value) })
            ] }) : /* @__PURE__ */ jsx(
              NumberField,
              {
                label: "Risk amount",
                prefix: "$",
                value: form.riskAmount,
                placeholder: "100",
                onChange: (value) => updateField("riskAmount", value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Panel, { title: "Stop Loss", kicker: "Distance", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_auto] md:items-end", children: [
            /* @__PURE__ */ jsx(
              SegmentedControl,
              {
                value: form.stopMode,
                onChange: (value) => updateField("stopMode", value),
                options: [
                  { value: "distance", label: "Distance" },
                  { value: "entry", label: "Entry / stop" }
                ]
              }
            ),
            preset.model === "pip" && form.stopMode === "distance" ? /* @__PURE__ */ jsx(
              SegmentedControl,
              {
                value: form.distanceUnit,
                onChange: (value) => updateField("distanceUnit", value),
                options: [
                  { value: "auto", label: "Auto" },
                  { value: "pips", label: "Pips" },
                  { value: "price", label: "Price" }
                ]
              }
            ) : null
          ] }),
          form.stopMode === "entry" ? /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(
              NumberField,
              {
                label: "Entry price",
                value: form.entryPrice,
                placeholder: preset.model === "pip" ? "1.0850" : "2360.00",
                step: preset.model === "pip" ? "0.0001" : "0.01",
                onChange: (value) => updateField("entryPrice", value)
              }
            ),
            /* @__PURE__ */ jsx(
              NumberField,
              {
                label: "Stop price",
                value: form.stopPrice,
                placeholder: preset.model === "pip" ? "1.0830" : "2355.00",
                step: preset.model === "pip" ? "0.0001" : "0.01",
                onChange: (value) => updateField("stopPrice", value)
              }
            )
          ] }) : /* @__PURE__ */ jsx(
            NumberField,
            {
              label: preset.model === "pip" ? "Stop distance" : "Point distance",
              value: form.stopDistance,
              placeholder: preset.model === "pip" ? "20 or 0.0020" : "5.00",
              step: preset.model === "pip" ? "0.0001" : "0.01",
              onChange: (value) => updateField("stopDistance", value)
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Panel, { title: "Costs", kicker: "Optional", children: /* @__PURE__ */ jsx(
            NumberField,
            {
              label: preset.model === "pip" ? "Commission per lot" : "Commission per contract/unit",
              prefix: "$",
              value: form.commission,
              placeholder: "0",
              step: "0.01",
              onChange: (value) => updateField("commission", value)
            }
          ) }),
          /* @__PURE__ */ jsxs(Panel, { title: "Reward", kicker: "Target", children: [
            /* @__PURE__ */ jsx(
              NumberField,
              {
                label: "Target multiple",
                suffix: "R",
                value: form.rewardR,
                placeholder: "2",
                step: "0.25",
                onChange: (value) => updateField("rewardR", value)
              }
            ),
            /* @__PURE__ */ jsx(QuickButtons, { values: rewardPresets, suffix: "R", onPick: (value) => updateField("rewardR", value) })
          ] })
        ] }),
        preset.model === "contract" ? /* @__PURE__ */ jsx(Panel, { title: "Contract", kicker: "Broker setting", children: /* @__PURE__ */ jsx(
          NumberField,
          {
            label: "Contract size",
            value: form.customContractSize,
            placeholder: String(preset.contractSize),
            step: "0.01",
            onChange: (value) => updateField("customContractSize", value)
          }
        ) }) : null
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "self-start rounded-xl border border-slate-800 bg-[#171B21] p-4 shadow-2xl shadow-black/25 lg:sticky lg:top-5 md:p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[#74D99F]/30 bg-[#102018] p-5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[#74D99F]", children: "Recommended size" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 break-words text-5xl font-semibold tracking-normal text-white", children: hasResult ? formatNumber(result.positionSize, { maximumFractionDigits: 5 }) : "0" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-400", children: preset.sizeLabel })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(ResultCard, { label: "Risk amount", value: formatMoney(result.riskValue) }),
          /* @__PURE__ */ jsx(
            ResultCard,
            {
              label: preset.model === "pip" ? "Stop loss" : "Distance",
              value: preset.model === "pip" ? `${formatNumber(result.stopPips, { maximumFractionDigits: 2 })} pips` : formatNumber(result.stopDistance, { maximumFractionDigits: 5 })
            }
          ),
          /* @__PURE__ */ jsx(ResultCard, { label: `Loss / ${preset.sizeLabel.toLowerCase()}`, value: formatMoney(result.lossPerSize) }),
          /* @__PURE__ */ jsx(ResultCard, { label: "Target reward", value: formatMoney(result.potentialReward), tone: "blue" }),
          preset.model === "pip" ? /* @__PURE__ */ jsx(ResultCard, { label: "Micro lots", value: String(result.microLots) }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-slate-800 bg-[#11161C] p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-300", children: "Risk / reward" }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-[#92B7F5]", children: [
              formatNumber(rewardMultiple, { maximumFractionDigits: 2 }),
              "R"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 grid h-3 grid-cols-[1fr_3fr] overflow-hidden rounded-full bg-slate-800", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-[#F2B366]" }),
            /* @__PURE__ */ jsx("div", { className: "bg-slate-800", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-[#74D99F]", style: { width: `${rewardBarWidth}%` } }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex justify-between text-xs text-slate-500", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              formatMoney(result.riskValue),
              " risk"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              formatMoney(result.potentialReward),
              " target"
            ] })
          ] })
        ] }),
        result.issues.length > 0 ? /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-xl border border-[#F2B366]/40 bg-[#2A2114] p-3 text-sm text-[#F2D19A]", children: result.issues[0] }) : /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-xl border border-slate-800 bg-[#11161C] p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: "Formula" }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 font-mono text-sm leading-6 text-slate-300", children: [
            result.formula,
            " =",
            " ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-[#74D99F]", children: formatNumber(result.positionSize, { maximumFractionDigits: 5 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: resetForm,
            className: "mt-4 h-11 w-full rounded-lg border border-slate-700 bg-[#11161C] text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#1D2530]",
            children: "Reset calculator"
          }
        )
      ] })
    ] })
  ] }) });
}
function Panel({ title, kicker, children }) {
  return /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-slate-800 bg-[#171B21] p-4 shadow-xl shadow-black/15 md:p-5", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: kicker }),
      /* @__PURE__ */ jsx("h2", { className: "mt-1 text-lg font-semibold text-white", children: title })
    ] }) }),
    children
  ] });
}
function Metric({ label, value, tone = "green" }) {
  const toneClass = tone === "blue" ? "text-[#92B7F5]" : "text-[#74D99F]";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-800 bg-[#11161C] p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-1 truncate text-base font-semibold ${toneClass}`, children: value })
  ] });
}
function NumberField({ label, value, onChange, prefix, suffix, placeholder, step = "any" }) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-2 block text-sm font-medium text-slate-300", children: label }),
    /* @__PURE__ */ jsxs("span", { className: "flex h-12 overflow-hidden rounded-lg border border-slate-700 bg-[#0F1216] focus-within:border-[#74D99F] focus-within:ring-2 focus-within:ring-[#74D99F]/20", children: [
      prefix ? /* @__PURE__ */ jsx("span", { className: "flex items-center px-3 text-sm text-slate-500", children: prefix }) : null,
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          min: "0",
          step,
          value,
          placeholder,
          onChange: (event) => onChange(event.target.value),
          className: "min-w-0 flex-1 bg-transparent px-3 text-base text-white outline-none placeholder:text-slate-600"
        }
      ),
      suffix ? /* @__PURE__ */ jsx("span", { className: "flex items-center px-3 text-sm text-slate-500", children: suffix }) : null
    ] })
  ] });
}
function SegmentedControl({ value, onChange, options }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-flow-col gap-1 rounded-lg border border-slate-800 bg-[#0F1216] p-1", children: options.map((option) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => onChange(option.value),
      className: `h-10 rounded-md px-3 text-sm font-semibold transition ${value === option.value ? "bg-[#74D99F] text-[#0B1710]" : "text-slate-400 hover:bg-[#1D2530] hover:text-white"}`,
      children: option.label
    },
    option.value
  )) });
}
function QuickButtons({ values, suffix, onPick }) {
  return /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: values.map((value) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => onPick(value),
      className: "h-8 rounded-md border border-slate-700 bg-[#11161C] px-3 text-xs font-semibold text-slate-300 transition hover:border-[#74D99F]/70 hover:text-white",
      children: [
        value,
        suffix
      ]
    },
    value
  )) });
}
function ResultCard({ label, value, tone = "default" }) {
  const toneClass = tone === "blue" ? "text-[#92B7F5]" : tone === "default" ? "text-slate-100" : "text-[#74D99F]";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-slate-800 bg-[#11161C] p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase text-slate-500", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-1 break-words text-xl font-semibold tabular-nums ${toneClass}`, children: value })
  ] });
}
var stdin_default = App;
export {
  stdin_default as default
};
