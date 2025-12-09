# VQC Coin System - Integration Guide

## Quick Start: Adding "Boost Room" Feature

### Step 1: Import Component

In your room management/dashboard component:

```tsx
import CoinFeaturesPurchase from '@/components/CoinFeaturesPurchase';
```

### Step 2: Add State

```tsx
const [showCoinModal, setShowCoinModal] = useState(false);
const [userCoins, setUserCoins] = useState(0);

// Fetch user coins on load
useEffect(() => {
    fetchUserCoins();
}, [userId]);

const fetchUserCoins = async () => {
    const response = await fetch('/api/users/coins');
    const data = await response.json();
    setUserCoins(data.coins);
};
```

### Step 3: Add Button

```tsx
<button
    onClick={() => setShowCoinModal(true)}
    className="btn btn-primary flex items-center gap-2"
>
    <Zap className="w-4 h-4" />
    Boost Room
</button>
```

### Step 4: Render Modal

```tsx
<CoinFeaturesPurchase
    roomId={room.id}
    userCoins={userCoins}
    isOpen={showCoinModal}
    onClose={() => setShowCoinModal(false)}
    onSuccess={(feature) => {
        // Refresh room data and user coins
        fetchRoom();
        fetchUserCoins();
    }}
/>
```

---

## Displaying Purchased Features

### Show Feature Status

```tsx
// Check if feature is enabled
const isWeightedVotingEnabled = room.weighted_voting_enabled;

{isWeightedVotingEnabled && (
    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        ✓ Weighted Voting Enabled
    </div>
)}
```

### Show Available Room Upgrades

```tsx
const availableFeatures = [
    { name: 'Ranked Choice', enabled: room.ranked_choice_enabled },
    { name: 'Anonymous Voting', enabled: room.anonymous_voting_enabled },
    { name: 'Weighted Voting', enabled: room.weighted_voting_enabled },
    { name: 'Audit Trail', enabled: room.audit_trail_enabled },
];

<div className="space-y-2">
    {availableFeatures.map(f => (
        <div key={f.name} className="flex items-center gap-2">
            {f.enabled ? (
                <Check className="w-4 h-4 text-green-400" />
            ) : (
                <X className="w-4 h-4 text-mono-60" />
            )}
            <span>{f.name}</span>
        </div>
    ))}
</div>
```

---

## Weighted Voting UI: Setting Voter Weights

### Component Template

```tsx
'use client';

import React, { useState } from 'react';
import { Slider } from '@/components/ui/Slider';

interface VoterWeight {
    voterId: string;
    voterName: string;
    weight: number;
}

export default function VoterWeightAssignment({
    roomId,
    voters,
    onSave
}: {
    roomId: string;
    voters: any[];
    onSave: (weights: VoterWeight[]) => Promise<void>;
}) {
    const [weights, setWeights] = useState<VoterWeight[]>(
        voters.map(v => ({
            voterId: v.id,
            voterName: v.name,
            weight: 1
        }))
    );
    const [loading, setLoading] = useState(false);

    const handleWeightChange = (voterId: string, newWeight: number) => {
        setWeights(weights.map(w =>
            w.voterId === voterId ? { ...w, weight: newWeight } : w
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/rooms/${roomId}/set-voter-weights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weights })
            });

            if (!response.ok) throw new Error('Failed to save weights');
            
            await onSave(weights);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold">Set Voter Weights</h3>
            <p className="text-sm text-mono-60">
                Assign vote weights to voters. Higher weight = more voting power.
            </p>

            <div className="space-y-4">
                {weights.map(w => (
                    <div key={w.voterId} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="font-medium">{w.voterName}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={w.weight}
                                    onChange={(e) => handleWeightChange(
                                        w.voterId,
                                        parseInt(e.target.value) || 1
                                    )}
                                    className="w-12 px-2 py-1 rounded bg-white/10 border border-white/20 text-white"
                                />
                                <span className="text-sm text-mono-60">votes</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={w.weight}
                            onChange={(e) => handleWeightChange(
                                w.voterId,
                                parseInt(e.target.value)
                            )}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary w-full"
            >
                {loading ? 'Saving...' : 'Save Voter Weights'}
            </button>
        </div>
    );
}
```

### Usage

```tsx
{room.weighted_voting_enabled && (
    <VoterWeightAssignment
        roomId={room.id}
        voters={voters}
        onSave={async () => {
            // Refresh room
            await fetchRoom();
        }}
    />
)}
```

---

## API: Set Voter Weights

### POST `/api/rooms/[id]/set-voter-weights`

```typescript
// app/api/rooms/[id]/set-voter-weights/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const roomId = params.id;
        const userId = request.headers.get('x-user-id');
        const body = await request.json();
        const { weights } = body;

        // Verify user owns room
        const { data: room } = await supabaseAdmin
            .from('rooms')
            .select('id, created_by')
            .eq('id', roomId)
            .single();

        if (room?.created_by !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Verify weighted voting is enabled
        if (!room.weighted_voting_enabled) {
            return NextResponse.json(
                { error: 'Weighted voting not enabled for this room' },
                { status: 400 }
            );
        }

        // Update weights
        for (const w of weights) {
            const { error } = await supabaseAdmin
                .from('voter_eligibility')
                .update({ vote_weight: w.weight })
                .eq('id', w.voterId)
                .eq('room_id', roomId);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
```

---

## Vote Counting with Weighted Votes

### Update Your Vote Counting Logic

```tsx
// When counting votes
const countVotes = async (roomId: string) => {
    const { data: votes } = await supabaseAdmin
        .from('votes')
        .select('option_id, voter_id')
        .eq('room_id', roomId);

    const voteCount: { [key: string]: number } = {};

    for (const vote of votes) {
        // Calculate weighted vote
        const weightedVote = await supabaseAdmin.rpc(
            'calculate_weighted_vote',
            {
                p_room_id: roomId,
                p_vote_value: 1,
                p_voter_id: vote.voter_id
            }
        );

        const option = vote.option_id;
        voteCount[option] = (voteCount[option] || 0) + weightedVote.data;
    }

    return voteCount;
};
```

### Or Use Raw SQL

```sql
-- Get weighted vote tallies
SELECT 
    option_id,
    SUM(calculate_weighted_vote(room_id, 1, voter_id)) as vote_count
FROM votes
WHERE room_id = 'room_uuid'
GROUP BY option_id
ORDER BY vote_count DESC;
```

---

## Display Results with Weights

```tsx
{room.weighted_voting_enabled && (
    <div className="space-y-2">
        <p className="text-xs text-mono-60 font-medium uppercase">
            Weighted Results
        </p>
        {results.map(r => (
            <div key={r.optionId} className="space-y-1">
                <div className="flex items-center justify-between">
                    <span>{r.optionName}</span>
                    <span className="font-bold">{r.weightedVotes} votes</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500"
                        style={{
                            width: `${(r.weightedVotes / totalVotes) * 100}%`
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
)}
```

---

## Database Queries Reference

### Check if Room Has Feature

```sql
SELECT has_coin_feature('room_id'::uuid, 'weighted_voting') AS enabled;
```

### Get All Features for Room

```sql
SELECT feature_type, cost_vqc, purchased_at, expires_at
FROM coin_features
WHERE room_id = 'room_id'::uuid
ORDER BY purchased_at DESC;
```

### Get Voter Weights

```sql
SELECT id, name, vote_weight
FROM voter_eligibility
WHERE room_id = 'room_id'::uuid
ORDER BY name;
```

### Calculate Final Results with Weighting

```sql
SELECT 
    p.id as option_id,
    p.title,
    COUNT(v.id) as regular_votes,
    COALESCE(SUM(calculate_weighted_vote(
        'room_id'::uuid,
        1,
        v.voter_id
    )), 0) as weighted_votes
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
GROUP BY p.id, p.title
ORDER BY weighted_votes DESC;
```

---

## Common Issues & Solutions

### Issue: Coins Not Deducting
**Solution:** Check user has `coin_balance` column in users table

### Issue: Weighted Voting Not Calculating
**Solution:** Make sure `vote_weight` is set on voter_eligibility records

### Issue: Feature Flag Not Updating
**Solution:** Verify room.id matches roomId in purchase request

### Issue: Votes Not Multiplying
**Solution:** Ensure `calculate_weighted_vote()` function exists and is called

---

## Deployment Checklist

- [ ] Run `coin_features_system.sql` migration in Supabase
- [ ] Create `/api/rooms/[id]/set-voter-weights` endpoint
- [ ] Build voter weight assignment UI component
- [ ] Add "Boost Room" button to room dashboard
- [ ] Update vote counting logic to use `calculate_weighted_vote()`
- [ ] Add feature status display to room details
- [ ] Test all coin purchase flows
- [ ] Test weighted voting calculation
- [ ] Add error handling for edge cases
- [ ] Test with multiple voters and different weights
