# VoteQuest VQC Coin System

## Overview

VQC (VoteQuest Coins) are an in-app currency that users can purchase and spend to unlock premium features for their voting rooms.

---

## Pricing Structure

### Room Add-ons (Permanent Benefits)
| Feature | Cost | Benefit |
|---------|------|---------|
| Extra Voters | 1 coin | Add 10 more voters beyond tier limit |
| Extend Room | 5 coins | Keep room open for 30 additional days |
| Audit Trail | 3 coins | Track voting history & timestamps |

### Feature Upgrades (Room Capabilities)
| Feature | Cost | Benefit |
|---------|------|---------|
| Ranked Choice Voting | 2 coins | Voters can rank options by preference |
| Anonymous Voting | 2 coins | Hide voter identities in results |
| **Weighted Voting** | 2 coins | Assign different vote weights to voters |
| Custom Branding | 1 coin | Add custom colors & logos to room |

### Quick Services (Single-Use)
| Feature | Cost | Benefit |
|---------|------|---------|
| Generate QR Code | 1 coin | Create QR code for voter access |
| Instant Tabulation | 2 coins | Get results immediately (no wait) |
| Extended Window | 1 coin | Keep voting open 7 more days |

---

## Coin Packages

Users purchase coins via Flutterwave in NGN (Nigerian Naira):

| Package | VQC Coins | Price (₦) | Bonus |
|---------|-----------|-----------|-------|
| Trial | 50 | ₦500 | - |
| Starter | 200 | ₦1,500 | - |
| Popular | 500 | ₦3,500 | +50 bonus |
| Power | 1,500 | ₦7,500 | +300 bonus |

---

## Database Schema

### coin_features Table
Tracks all coin feature purchases:
```sql
- id: UUID (Primary Key)
- room_id: UUID (Foreign Key to rooms)
- feature_type: TEXT (e.g., 'weighted_voting', 'extra_voters')
- cost_vqc: INT (Coins spent)
- purchased_by: UUID (User who purchased)
- purchased_at: TIMESTAMP
- expires_at: TIMESTAMP (NULL for permanent)
- data: JSONB (Feature-specific configuration)
```

### Rooms Table Updates
```sql
- ranked_choice_enabled: BOOLEAN
- anonymous_voting_enabled: BOOLEAN
- weighted_voting_enabled: BOOLEAN
- instant_tabulation_enabled: BOOLEAN
- audit_trail_enabled: BOOLEAN
- custom_branding_enabled: BOOLEAN
- extra_voters_added: INT (cumulative)
- extended_until: TIMESTAMP
```

### voter_eligibility Table Update
```sql
- vote_weight: INT (Default: 1, multiplier for vote count)
```

---

## Weighted Voting System

### How It Works

When **Weighted Voting** feature is purchased (2 coins), room admins can assign different vote weights to individual voters:

- **Default weight:** 1 vote per voter
- **Custom weight:** 1-10 votes per voter
- **Use cases:**
  - Board meetings (executives = 3 votes, members = 1 vote)
  - Organizational voting (seniority-based)
  - Weighted stakeholder voting

### Example

Room has 5 voters with weights:
- Alice (weight: 3) votes YES → counts as 3 votes
- Bob (weight: 1) votes YES → counts as 1 vote
- Carol (weight: 2) votes NO → counts as 2 votes
- Dave (weight: 1) votes NO → counts as 1 vote
- Eve (weight: 1) votes YES → counts as 1 vote

**Results:**
- YES: 3 + 1 + 1 = 5 weighted votes
- NO: 2 + 1 = 3 weighted votes

### Database Implementation

The `vote_weight` column in `voter_eligibility` stores each voter's multiplier:

```sql
-- Admin sets voter weights when purchasing weighted voting
UPDATE voter_eligibility 
SET vote_weight = 3 
WHERE voter_id = 'alice_id' AND room_id = 'room_id';
```

Voting calculation uses the `calculate_weighted_vote()` function:

```sql
SELECT calculate_weighted_vote(room_id, 1, voter_id) AS weighted_vote
-- Returns: 1 * vote_weight = final vote count
```

---

## Component: CoinFeaturesPurchase

Modal component for purchasing room features with coins.

### Props
```typescript
interface CoinFeaturesPurchaseProps {
    roomId: string;              // Room to purchase features for
    userCoins: number;           // Current coin balance
    isOpen: boolean;             // Modal visibility
    onClose: () => void;         // Close handler
    onSuccess?: (feature: string) => void; // Success callback
}
```

### Usage
```tsx
<CoinFeaturesPurchase
    roomId={room.id}
    userCoins={user.coin_balance}
    isOpen={showFeatureModal}
    onClose={() => setShowFeatureModal(false)}
    onSuccess={(feature) => {
        console.log('Purchased:', feature);
        refreshRoom();
    }}
/>
```

---

## API Endpoint: Purchase Feature

### POST `/api/rooms/[id]/purchase-feature`

**Request Headers:**
```
Content-Type: application/json
x-user-id: {userId}
```

**Request Body:**
```json
{
    "featureType": "weighted_voting",
    "cost": 2
}
```

**Response (Success):**
```json
{
    "success": true,
    "feature": {
        "id": "uuid",
        "room_id": "uuid",
        "feature_type": "weighted_voting",
        "cost_vqc": 2,
        "purchased_by": "uuid",
        "purchased_at": "2025-12-09T10:30:00Z"
    },
    "remainingCoins": 48
}
```

**Response (Error):**
```json
{
    "error": "Insufficient coins"
}
```

---

## Helper Functions (SQL)

### `has_coin_feature(room_id, feature_type)`
Check if room has purchased a feature:
```sql
SELECT has_coin_feature('room_uuid', 'weighted_voting') AS has_feature;
-- Returns: true/false
```

### `get_extra_voters_count(room_id)`
Get total extra voters added:
```sql
SELECT get_extra_voters_count('room_uuid') AS extra_voters;
-- Returns: 30 (if 3x extra_voters purchases)
```

### `calculate_weighted_vote(room_id, vote_value, voter_id)`
Calculate vote with weighting:
```sql
SELECT calculate_weighted_vote('room_uuid', 1, 'voter_uuid') AS weighted_vote;
-- Returns: 1 (if weight=1) or 3 (if weight=3)
```

---

## Implementation Checklist

- [x] Database schema created (`coin_features_system.sql`)
- [x] CoinFeaturesPurchase component built
- [x] API endpoint for feature purchase created
- [ ] Integrate CoinFeaturesPurchase into room creation/management
- [ ] Add weighted voting UI for voter weight assignment
- [ ] Update vote counting logic to use `calculate_weighted_vote()`
- [ ] Add feature status indicators to room dashboard
- [ ] Test all coin purchase flows
- [ ] Add audit logging for coin transactions

---

## Testing

### Test Scenario: Purchase Weighted Voting

1. User has 100 coins
2. Room created
3. Click "Boost Room" → CoinFeaturesPurchase modal
4. Select "Weighted Voting" (2 coins)
5. Click "Purchase Feature"
6. Verify:
   - 2 coins deducted (balance: 98)
   - Room gets `weighted_voting_enabled = true`
   - Coin feature recorded in database
   - Success message shown

### Test Scenario: Assign Voter Weights

1. Room has weighted voting enabled
2. Admin adds voters
3. Admin clicks "Set Voter Weight"
4. Assigns weights (Alice=3, Bob=1, etc.)
5. Room records weights in `voter_eligibility.vote_weight`
6. When voting, each vote multiplied by weight

---

## Future Enhancements

1. **Coin Refunds:** Allow users to cancel features for partial refund
2. **Coin Bonuses:** Seasonal promotions (2x coins, double rewards)
3. **Subscription Coins:** Monthly coin allowance based on tier
4. **Coin Analytics:** Dashboard showing coin spending by feature
5. **Batch Purchases:** Buy multiple features at discount
