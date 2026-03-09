# Lot Size Calculator

A Forex/Crypto Lot Size Calculator built with React and Tailwind CSS.

## Features

- **Account Size** – Enter your trading account balance in $
- **Stop Loss** – Set your stop loss distance in pips/points
- **Risk Toggle** – Switch between:
  - **Percentage (%)** – Risk a % of your account per trade
  - **Fixed Amount ($)** – Risk a specific dollar amount
- **Output** – Calculated lot size and exact monetary value at risk

## Formula

```
Lot Size = Risk Amount / (Stop Loss in Pips × Pip Value)
```

Uses $10 pip value per standard lot (typical for EUR/USD-style pairs).

## Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
