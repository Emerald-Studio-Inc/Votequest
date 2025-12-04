# Blockchain Export Guide - Quick Implementation

## Overview

Add a bulk blockchain export feature to your AdminDashboard that:
1. Fetches all unexported receipts from database
2. Prepares them for blockchain submission
3. Submits in batches to save gas
4. Marks receipts as exported

---

## Step 1: Create Blockchain Export API

**File:** `app/api/admin/export-receipts/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Get all unexported receipts ready for blockchain submission
 * GET /api/admin/export-receipts
 */
export async function GET() {
  try {
    // Fetch unexported coin transactions with receipts
    const { data: transactions, error } = await supabaseAdmin
      .from('coin_transactions')
      .select('*')
      .not('receipt_hash', 'is', null)
      .is('blockchain_exported', null) // Not yet exported
      .order('created_at', { ascending: true })
      .limit(100); // Batch of 100

    if (error) throw error;

    // Format for blockchain
    const receipts = transactions?.map(tx => ({
      hash: tx.receipt_hash,
      userId: tx.user_id,
      amount: tx.amount,
      timestamp: new Date(tx.created_at).getTime(),
      action: tx.reason,
      metadata: tx.action_metadata
    })) || [];

    return NextResponse.json({
      count: receipts.length,
      receipts,
      totalValue: receipts.reduce((sum, r) => sum + r.amount, 0)
    });

  } catch (error: any) {
    console.error('[ADMIN] Export receipts error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Mark receipts as exported to blockchain
 * POST /api/admin/export-receipts
 */
export async function POST(request: Request) {
  try {
    const { receiptHashes, txHash } = await request.json();

    if (!receiptHashes || !Array.isArray(receiptHashes)) {
      return NextResponse.json({ error: 'Invalid receipt hashes' }, { status: 400 });
    }

    // Mark receipts as exported
    const { error } = await supabaseAdmin
      .from('coin_transactions')
      .update({
        blockchain_exported: true,
        blockchain_tx_hash: txHash,
        blockchain_exported_at: new Date().toISOString()
      })
      .in('receipt_hash', receiptHashes);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      exported: receiptHashes.length,
      txHash
    });

  } catch (error: any) {
    console.error('[ADMIN] Mark exported error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Step 2: Add Export UI to AdminDashboard

**File:** `components/AdminDashboard.tsx`

Add this function to the component:

```typescript
const [exportLoading, setExportLoading] = useState(false);
const [exportStats, setExportStats] = useState({ count: 0, totalValue: 0 });

// Fetch unexported receipts
const loadExportStats = async () => {
  try {
    const response = await fetch('/api/admin/export-receipts');
    const data = await response.json();
    setExportStats({ count: data.count, totalValue: data.totalValue });
  } catch (error) {
    console.error('Error loading export stats:', error);
  }
};

// Export to blockchain (manual trigger for now)
const exportToBlockchain = async () => {
  setExportLoading(true);
  try {
    // 1. Get unexported receipts
    const response = await fetch('/api/admin/export-receipts');
    const data = await response.json();

    if (data.count === 0) {
      alert('No receipts to export');
      return;
    }

    // 2. TODO: Submit to blockchain contract
    // For now, just download the data
    const blob = new Blob([JSON.stringify(data.receipts, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-export-${Date.now()}.json`;
    a.click();

    alert(`Downloaded ${data.count} receipts for blockchain export.\n\nNext steps:\n1. Review the JSON file\n2. Submit to blockchain contract\n3. Mark as exported with tx hash`);

    // 3. In future: Mark as exported automatically
    // await fetch('/api/admin/export-receipts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     receiptHashes: data.receipts.map(r => r.hash),
    //     txHash: blockchainTxHash
    //   })
    // });

  } catch (error) {
    console.error('Export error:', error);
    alert('Export failed: ' + error);
  } finally {
    setExportLoading(false);
  }
};

// Call on mount
useEffect(() => {
  loadExportStats();
}, []);
```

Add UI in the render section:

```tsx
{/* Blockchain Export Section */}
<div className="glass rounded-2xl p-6">
  <h3 className="text-xl font-bold mb-4">Blockchain Export</h3>
  
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-zinc-400">Unexported Receipts</p>
        <p className="text-2xl font-bold">{exportStats.count}</p>
      </div>
      <div>
        <p className="text-sm text-zinc-400">Total Value</p>
        <p className="text-2xl font-bold">{exportStats.totalValue} VQC</p>
      </div>
    </div>

    <button 
      onClick={exportToBlockchain}
      disabled={exportLoading || exportStats.count === 0}
      className="btn btn-primary w-full"
    >
      {exportLoading ? 'Exporting...' : `Export ${exportStats.count} Receipts to Blockchain`}
    </button>

    <p className="text-xs text-zinc-500">
      Receipts are exported in batches of 100. Run multiple times if needed.
    </p>
  </div>
</div>
```

---

## Step 3: Add Database Column

**File:** `migrations/add_blockchain_export_tracking.sql` (NEW)

```sql
-- Add blockchain export tracking to coin_transactions
ALTER TABLE coin_transactions
  ADD COLUMN IF NOT EXISTS blockchain_exported BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS blockchain_exported_at TIMESTAMP;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_coin_tx_blockchain 
  ON coin_transactions(blockchain_exported, created_at);

-- View export status
SELECT 
  COUNT(*) FILTER (WHERE blockchain_exported = TRUE) as exported,
  COUNT(*) FILTER (WHERE blockchain_exported IS NULL OR blockchain_exported = FALSE) as pending,
  COUNT(*) as total
FROM coin_transactions
WHERE receipt_hash IS NOT NULL;
```

---

## Step 4: Future - Auto Submit to Smart Contract

When you're ready to auto-submit to blockchain:

```typescript
// In exportToBlockchain function, replace the TODO section:

// 2. Submit to blockchain contract
const receiptBatch = data.receipts.map(r => ({
  hash: r.hash,
  user: r.userId,
  amount: r.amount,
  timestamp: r.timestamp
}));

// Example with viem (if using Ethereum)
import { createPublicClient, createWalletClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';

const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: http()
});

// Submit batch to contract
const txHash = await walletClient.writeContract({
  address: 'YOUR_CONTRACT_ADDRESS',
  abi: YOUR_CONTRACT_ABI,
  functionName: 'submitReceiptBatch',
  args: [receiptBatch]
});

// Wait for confirmation
await publicClient.waitForTransactionReceipt({ hash: txHash });

// 3. Mark as exported
await fetch('/api/admin/export-receipts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiptHashes: data.receipts.map(r => r.hash),
    txHash
  })
});

alert(`Success! Exported ${data.count} receipts.\nTx: ${txHash}`);
```

---

## Quick Start (Manual Process)

**For now, without smart contract:**

1. **Add the database migration** - Run `add_blockchain_export_tracking.sql`
2. **Add the API route** - Create `app/api/admin/export-receipts/route.ts`
3. **Update AdminDashboard** - Add export button and stats
4. **Access admin panel** - Use Konami code (↑↑↓↓←→←→A)
5. **Click "Export Receipts"** - Downloads JSON file with all receipts
6. **Review receipts** - Check the exported JSON
7. **Submit to blockchain** - Use external tools or script
8. **Mark as exported** - Manually update database or use POST endpoint

**Later, when contract is ready:**
- Deploy smart contract with `submitReceiptBatch()` function
- Update export function to auto-submit
- Automatic marking as exported

---

## Receipt JSON Format

The exported file will look like:

```json
[
  {
    "hash": "a3f5e8c9d2b1f4e7...",
    "userId": "123e4567-e89b...",
    "amount": 10,
    "timestamp": 1733328000000,
    "action": "vote_cast",
    "metadata": {
      "proposalId": "789e4567...",
      "proposalTitle": "Community Treasury Q4",
      "optionTitle": "Option A"
    }
  }
]
```

---

## Summary

**Current state:** Download receipts as JSON → Manual blockchain submission  
**Future state:** One-click blockchain submission → Auto-mark as exported

**Timeline:**
- **Now:** 30 minutes to add export UI
- **Later:** When you deploy smart contract, add auto-submit

No rush - the receipt system works perfectly without blockchain! Export when ready.
