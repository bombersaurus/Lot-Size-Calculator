# Lot Size Calculator

Lot Size Calculator is a browser-based trading risk tool for working out position size before entering a trade. It supports forex pairs, JPY pairs, gold, indices, and crypto-style contracts.

## What it does

- Calculates position size from account size, risk, and stop distance
- Supports percentage risk and fixed cash risk
- Handles pip-based and contract-based instruments
- Includes optional commission in the sizing formula
- Shows target reward using an `R` multiple
- Saves form values in local storage

## Why I built it

I wanted a quick calculator that keeps the full risk picture visible while changing inputs. It is built around practical trade planning rather than a generic form.

## Tech

- React 19 via browser imports
- Tailwind via CDN
- Vanilla JavaScript modules
- Local storage

## Run locally

Open `index.html` in a browser.

If you prefer serving it locally:

```bash
npx serve --no-clipboard
```

## Notes

The presets are meant as useful defaults. Broker contract sizes and pip values can vary, so the result should be checked against the trading platform before placing a real trade.
