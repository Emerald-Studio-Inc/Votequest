// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VoteQuest {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 deadline;
        string[] options;
        mapping(uint256 => uint256) voteCounts;
        bool exists;
    }

    struct ProposalView {
        uint256 id;
        string title;
        string description;
        uint256 deadline;
        string[] options;
        uint256[] voteCounts;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    event ProposalCreated(uint256 indexed id, string title, uint256 deadline);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 optionIndex);

    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _durationInMinutes,
        string[] memory _options
    ) public {
        require(_options.length > 1, "At least two options required");
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + (_durationInMinutes * 1 minutes);
        newProposal.options = _options;
        newProposal.exists = true;

        emit ProposalCreated(proposalCount, _title, newProposal.deadline);
    }

    function vote(uint256 _proposalId, uint256 _optionIndex) public {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted");
        require(_optionIndex < proposals[_proposalId].options.length, "Invalid option");

        proposals[_proposalId].voteCounts[_optionIndex]++;
        hasVoted[_proposalId][msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender, _optionIndex);
    }

    function getProposal(uint256 _proposalId) public view returns (ProposalView memory) {
        require(proposals[_proposalId].exists, "Proposal does not exist");
        
        Proposal storage p = proposals[_proposalId];
        uint256[] memory counts = new uint256[](p.options.length);
        
        for (uint i = 0; i < p.options.length; i++) {
            counts[i] = p.voteCounts[i];
        }

        return ProposalView({
            id: p.id,
            title: p.title,
            description: p.description,
            deadline: p.deadline,
            options: p.options,
            voteCounts: counts
        });
    }
}
