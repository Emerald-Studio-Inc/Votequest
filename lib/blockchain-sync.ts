// Minimal blockchain-sync stubs to satisfy build when on-chain features
// were removed or unavailable in this environment.

export async function hasUserVoted(_contractAddress: any, _proposalId: number, _voterAddress: any, _chainId: number): Promise<boolean> {
  console.warn('hasUserVoted: blockchain sync is disabled in this build. Returning false.');
  return false;
}

export async function getVoteEvents(_contractAddress: any, _proposalId: number, _chainId: number): Promise<any[]> {
  console.warn('getVoteEvents: blockchain sync is disabled in this build. Returning empty list.');
  return [];
}

export function createBlockchainClient(_chainId: number) {
  console.warn('createBlockchainClient: returning a minimal stub client.');
  return {
    async getBlock(_: { blockNumber: bigint }) {
      return { timestamp: 0 } as any;
    },
    async getLogs(_: any) {
      return [] as any[];
    },
    async readContract(_: any) {
      // Return a fake proposal structure with empty voteCounts
      return [0, '', '', 0, [], []] as any;
    }
  };
}
