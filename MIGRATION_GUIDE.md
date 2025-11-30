# VoteQuestApp.tsx - Email Auth Migration Guide

## Changes Needed

### 1. Remove Wallet Imports (Line 7-8)
**DELETE:**
```typescript
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTE_QUEST_ADDRESS, VOTE_QUEST_ABI } from '@/lib/contracts';
```

**ADD:**
```typescript
import { onAuthStateChange, getCurrentUser, getUserProfile } from '@/lib/supabase-auth';
import RegistrationScreen from './RegistrationScreen';
```

### 2. Remove Wallet State (Line 79)
**DELETE:**
```typescript
const { address, isConnected } = useAccount();
```

**ADD:**
```typescript
const [authUser, setAuthUser] = useState<any>(null);
const [needsRegistration, setNeedsRegistration] = useState(false);
```

### 3. Replace Wallet Connection Logic (Around line 440-474)
**FIND:** The `useEffect` that handles wallet connection with `isConnected` and `address`

**REPLACE WITH:**
```typescript
// Handle Supabase auth state
useEffect(() => {
  const { data: { subscription } } = onAuthStateChange(async (user) => {
    setAuthUser(user);
    
    if (user) {
      // Check if user has profile
      const profile = await getUserProfile(user.id);
      
      if (!profile) {
        // New user needs to complete registration
        setNeedsRegistration(true);
        setCurrentScreen('register');
      } else {
        // Existing user - load their data
        setUserData({
          address: user.email,
          userId: profile.id,
          level: profile.level,
          xp: profile.xp,
          nextLevelXP: 5000,
          streak: profile.streak,
          votingPower: profile.voting_power,
          votesCount: profile.votes_count,
          globalRank: profile.global_rank,
          achievements: [],
          votedProposals: await getUserVotedProposals(profile.id),
          coins: profile.coins || 0
        });
        
        if (currentScreen === 'login') {
          setCurrentScreen('dashboard');
        }
      }
    } else {
      // Not logged in
      if (currentScreen !== 'splash' && !currentScreen.startsWith('onboarding')) {
        setCurrentScreen('login');
      }
    }
  });

  // Initial check
  getCurrentUser().then(user => {
    if (user) {
      setAuthUser(user);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### 4. Remove Blockchain Vote Function (Line 476-504)
**DELETE:** The entire `castVote` function that uses `writeContract`

**REPLACE WITH:**
```typescript
const castVote = async () => {
  if (!selectedOption || !selectedProposal || !userData.userId) return;

  if (!captchaToken) {
    alert('Please complete the security verification to vote');
    return;
  }

  const option = selectedProposal.options.find(o => o.id === selectedOption);
  if (!option) return;

  setLoading(true);
  
  // Database-only voting (no blockchain)
  const success = await dbCastVote(
    userData.userId,
    selectedProposal.id,
    selectedOption,
    undefined, // no txHash
    undefined, // no walletAddress  
    captchaToken
  );

  if (success) {
    // Reload user data
    const profile = await getUserProfile(authUser.id);
    if (profile) {
      const votedProposals = await getUserVotedProposals(profile.id);
      setUserData(prev => ({
        ...prev,
        xp: profile.xp,
        level: profile.level,
        votesCount: profile.votes_count,
        votingPower: profile.voting_power,
        coins: profile.coins || 0,
        votedProposals
      }));
    }
    
    await loadProposals();
    setCurrentScreen('dashboard');
    triggerAnimation('vote');
  }

  setLoading(false);
  setCaptchaToken('');
};
```

### 5. Add Registration Screen Render (Around line 636)
**ADD AFTER CREATE-PROPOSAL SCREEN:**
```typescript
if (currentScreen === 'register' && needsRegistration && authUser) {
  return (
    <RegistrationScreen 
      authUser={authUser}
      onComplete={() => {
        setNeedsRegistration(false);
        setCurrentScreen('dashboard');
      }}
    />
  );
}
```

### 6. Update Login Screen (Line 559-561)
**CHANGE:**
```typescript
if (currentScreen === 'login') {
  return <LoginScreen loading={loading} />;
}
```

**TO:**
```typescript
if (currentScreen === 'login') {
  return <LoginScreen />;
}
```

---

## Summary of Changes

**Remove:**
- All `wagmi` imports and hooks
- Wallet connection logic
- Blockchain vote/proposal functions

**Add:**
- Supabase auth state management
- Database-only voting
- Registration screen for new users

**Result:**
- Simple email authentication
- Instant database transactions
- Cryptographic receipts on every action

---

## Testing After Changes

1. **Delete localStorage:** `localStorage.clear()` in console
2. **Refresh app:** Should show splash → login
3. **Enter email:** Get magic link
4. **Click link:** Creates account → registration
5. **Complete profile:** Enter username → dashboard
6. **Vote/Create:** Check database for receipt hashes

✅ **No wallet needed, no gas fees, instant actions**
