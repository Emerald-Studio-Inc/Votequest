# VQC Coin System - Implementation Summary

## What Was Built

A complete **VQC Coin System** for VoteQuest that allows users to purchase premium features for their voting rooms using in-app coins.

---

## Components Created

### 1. **CoinFeaturesPurchase.tsx** (Component)
Modal interface for purchasing room features with coins.

**Features:**
- 10 purchasable features organized in 3 categories
- Real-time coin balance display
- Category tabs (Add-ons, Features, Services)
- Visual feedback for insufficient coins
- Loading states and error handling

**Location:** `components/CoinFeaturesPurchase.tsx`

---

## API Endpoint Created

### **POST `/api/rooms/[id]/purchase-feature`**

**Functionality:**
1. Validates feature type and cost
2. Verifies user owns the room
3. Checks user has sufficient coins
4. Deducts coins from user balance
5. Creates coin_features record
6. Updates room feature flags
7. Returns updated coin balance

**Security:**
- User ownership verification
- Cost validation
- Rate limiting (20 req/60s)

**Location:** `app/api/rooms/[id]/purchase-feature/route.ts`

---

## Database Schema

### New Table: `coin_features`
Tracks all coin feature purchases with:
- Feature type, cost, purchase date
- Expiry dates for time-limited features
- JSON data for feature-specific config
- Indexes for performance

### Updated Tables:
- **rooms:** Added 7 boolean flags + extra_voters_added + extended_until
- **voter_eligibility:** Added vote_weight column (for weighted voting)

**Location:** `migrations/coin_features_system.sql`

---

## SQL Helper Functions

### 1. `has_coin_feature(room_id, feature_type)`
Check if room has purchased a feature (handles expiry)

### 2. `get_extra_voters_count(room_id)`
Calculate total extra voters from all purchases

### 3. `calculate_weighted_vote(room_id, vote_value, voter_id)`
Calculate final vote count with weighting applied

---

## Coin Pricing Structure

### Room Add-ons
| Feature | Cost | Benefit |
|---------|------|---------|
| Extra Voters | 1 | +10 voters |
| Extend Room | 5 | +30 days |
| Audit Trail | 3 | Voting history |

### Feature Upgrades
| Feature | Cost | Benefit |
|---------|------|---------|
| Ranked Choice Voting | 2 | Voter ranking |
| Anonymous Voting | 2 | Hide identities |
| **Weighted Voting** | 2 | Vote weights |
| Custom Branding | 1 | Custom styling |

### Quick Services
| Feature | Cost | Benefit |
|---------|------|---------|
| Generate QR Code | 1 | Access QR |
| Instant Tabulation | 2 | Immediate results |
| Extended Window | 1 | +7 days voting |

---

## Weighted Voting Feature

**What It Does:**
Allows admins to assign different vote weights to individual voters:
- Default: 1 vote per voter
- Custom: 1-10 votes per voter
- Use cases: Boards, executives, seniority-based

**How It Works:**
1. Admin purchases "Weighted Voting" (2 coins)
2. Room flag `weighted_voting_enabled = true`
3. Admin assigns weights to voters
4. Stored in `voter_eligibility.vote_weight`
5. Vote counting multiplies by weight
6. Results show weighted totals

**Example:**
- Alice (weight 3) votes YES → 3 votes
- Bob (weight 1) votes NO → 1 vote
- Carol (weight 2) votes YES → 2 votes
- **YES: 5 weighted votes, NO: 1 vote**

---

## Integration Points

### To Use CoinFeaturesPurchase in Your App:

```tsx
import CoinFeaturesPurchase from '@/components/CoinFeaturesPurchase';

// In your room management component:
<CoinFeaturesPurchase
    roomId={room.id}
    userCoins={user.coin_balance}
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    onSuccess={(feature) => {
        // Refresh room data
        loadRoom();
    }}
/>
```

### To Check if Feature is Enabled:

```sql
-- In your voting/room logic
SELECT has_coin_feature('room_id', 'weighted_voting') AS weighted;
```

### To Calculate Weighted Vote:

```sql
-- In your vote counting logic
SELECT calculate_weighted_vote('room_id', vote_count, voter_id) AS final_vote;
```

---

## Files Created/Modified

### New Files:
1. `migrations/coin_features_system.sql` - Database schema
2. `components/CoinFeaturesPurchase.tsx` - UI component
3. `app/api/rooms/[id]/purchase-feature/route.ts` - API endpoint
4. `VQC_COIN_SYSTEM_DOCUMENTATION.md` - Full documentation

### Files Using This System:
- Will need to integrate CoinFeaturesPurchase into room management
- Will need to update vote counting logic
- Will need to create voter weight assignment UI

---

## Next Steps (Not Yet Implemented)

1. **Integrate CoinFeaturesPurchase Component**
   - Add button to room dashboard → "Boost Room"
   - Show available features for that room
   - Handle coin deduction flow

2. **Create Voter Weight Assignment UI**
   - Interface to set weight for each voter
   - Show in voter management section
   - Save to `voter_eligibility.vote_weight`

3. **Update Vote Counting Logic**
   - Modify vote tally calculations
   - Use `calculate_weighted_vote()` function
   - Display weighted results

4. **Add Feature Status Display**
   - Show which features are enabled on room dashboard
   - Show remaining coin balance
   - Display feature expiry dates

5. **Test All Flows**
   - Purchase each feature type
   - Test weighted voting calculation
   - Verify coin deduction
   - Test API error handling

---

## Database Migration

Run this in Supabase SQL Editor:

```sql
-- Copy contents of migrations/coin_features_system.sql
-- Paste into Supabase SQL Editor
-- Execute
```

---

## Testing the System

### Quick Test:
1. User has 100 coins
2. Go to room settings
3. Click "Boost Room"
4. Select "Weighted Voting" (2 coins)
5. Verify: coins deducted, room updated, feature enabled

### Weighted Voting Test:
1. Purchase weighted voting for room
2. Add 3 voters: Alice, Bob, Carol
3. Set weights: Alice=3, Bob=1, Carol=2
4. Cast votes: Alice→YES, Bob→NO, Carol→YES
5. Verify: YES=5 votes, NO=1 vote (weighted calculation works)

---

## Status

| Component | Status |
|-----------|--------|
| Database schema | ✅ Complete |
| CoinFeaturesPurchase component | ✅ Complete |
| Purchase API endpoint | ✅ Complete |
| SQL helper functions | ✅ Complete |
| Documentation | ✅ Complete |
| UI integration | ⏳ TODO |
| Vote counting updates | ⏳ TODO |
| Voter weight UI | ⏳ TODO |
| Testing | ⏳ TODO |

---

## Architecture Overview

```
User Purchases Coins (via Flutterwave)
    ↓
User Opens Room Dashboard
    ↓
Clicks "Boost Room" Button
    ↓
CoinFeaturesPurchase Modal Opens
    ↓
User Selects Feature & Clicks Purchase
    ↓
POST /api/rooms/[id]/purchase-feature
    ↓
Verify Ownership & Coins
    ↓
Deduct Coins from users.coin_balance
    ↓
Create coin_features Record
    ↓
Update Room Feature Flags
    ↓
Return Success + Remaining Coins
    ↓
Modal Closes, Room Refreshes
    ↓
Feature Now Available in Room
```

---

## Notes

- All features are idempotent (purchasing twice doesn't break)
- Coin deduction happens atomically (all or nothing)
- Expiry handled in SQL functions (automatic)
- Feature flags stored on rooms table for fast checks
- Detailed audit trail in coin_features table
- Error handling with automatic rollback
