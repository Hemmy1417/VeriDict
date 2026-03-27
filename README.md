# VeriDict

**AI-powered contribution evaluation governed by optimistic democracy on GenLayer.**

## Setup

1. Install dependencies:
```bash
npm install
```

2. Fill in `.env.local`:
```env
GENLAYER_RPC_URL=https://studio.genlayer.com:8443/api
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
NEXT_PUBLIC_GENLAYER_RPC_URL=http://localhost:3000/api/rpc
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CHAIN_NAME=GenLayer Studio
NEXT_PUBLIC_GENLAYER_SYMBOL=GEN
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8
```

3. Run:
```bash
npm run dev
```

## Features

- GEN balance shown live in navbar and wallet modal
- AI Activity Feed powered by Claude — summarises latest on-chain contributions
- Submissions table with scores, status badges, evaluate and view actions
- Leaderboard ranked by total accepted score
- Optimistic democracy challenge window (72 hours, min 10 GEN stake)

## Contract

`0x5dA860186C6e72C194450C9204E6Fc42b5372Ae8` on GenLayer Studio