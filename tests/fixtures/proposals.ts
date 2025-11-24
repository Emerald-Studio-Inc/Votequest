export const mockProposals = [
    {
        id: 'prop-1',
        title: 'Should we implement Dark Mode?',
        description: 'Dark mode would be easier on the eyes for night time voting.',
        status: 'active',
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        participants: 150,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: [
            { id: 'opt-1-1', proposal_id: 'prop-1', title: 'Yes, absolutely', votes: 100 },
            { id: 'opt-1-2', proposal_id: 'prop-1', title: 'No, light mode is fine', votes: 50 },
        ]
    },
    {
        id: 'prop-2',
        title: 'Increase voting rewards?',
        description: 'Should we increase the VQC reward per vote from 10 to 20?',
        status: 'closed',
        end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // -1 day
        participants: 300,
        created_by: 'user-2',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        options: [
            { id: 'opt-2-1', proposal_id: 'prop-2', title: 'Yes', votes: 200 },
            { id: 'opt-2-2', proposal_id: 'prop-2', title: 'No', votes: 100 },
        ]
    }
];
