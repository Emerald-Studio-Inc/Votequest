// Quick API test page for institutional voting system
// Access at: http://localhost:3000/test-institutional

'use client';

import { useState } from 'react';

export default function TestInstitutionalPage() {
    const [userId] = useState('1ab0a77f-c341-44a5-969f-e6bb1be3ad7d'); // Replace with actual user ID
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const log = (message: string) => {
        setOutput((prev) => prev + '\n' + message);
        console.log(message);
    };

    const testCreateOrganization = async () => {
        setOutput('');
        setLoading(true);
        log('🧪 Testing: Create Organization...');

        try {
            const response = await fetch('/api/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test High School',
                    type: 'school',
                    domain: 'testschool.edu',
                    userId: userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                log(`❌ Error: ${data.error}`);
            } else {
                log(`✅ Organization created!`);
                log(`   ID: ${data.organization.id}`);
                log(`   Name: ${data.organization.name}`);
                log(`   Type: ${data.organization.type}`);
                log(`   Tier: ${data.organization.subscription_tier}`);

                // Save for next tests
                localStorage.setItem('test_org_id', data.organization.id);
            }
        } catch (error: any) {
            log(`❌ Exception: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testCreateRoom = async () => {
        const orgId = localStorage.getItem('test_org_id');
        if (!orgId) {
            log('❌ No organization ID found. Create an organization first!');
            return;
        }

        setOutput('');
        setLoading(true);
        log('🧪 Testing: Create Voting Room...');

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationId: orgId,
                    title: 'Class President Election 2025',
                    description: 'Vote for your class president',
                    verificationTier: 'tier2',
                    options: [
                        { title: 'Alice Johnson', description: 'Senior, 4.0 GPA' },
                        { title: 'Bob Smith', description: 'Junior, Student Council VP' },
                        { title: 'Charlie Davis', description: 'Senior, Club President' }
                    ],
                    userId: userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                log(`❌ Error: ${data.error}`);
            } else {
                log(`✅ Room created!`);
                log(`   ID: ${data.room.id}`);
                log(`   Title: ${data.room.title}`);
                log(`   Verification: ${data.room.verification_tier}`);
                log(`   Status: ${data.room.status}`);

                localStorage.setItem('test_room_id', data.room.id);
            }
        } catch (error: any) {
            log(`❌ Exception: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const testAddVoter = async () => {
        const roomId = localStorage.getItem('test_room_id');
        if (!roomId) {
            log('❌ No room ID found. Create a room first!');
            return;
        }

        setOutput('');
        setLoading(true);
        log('🧪 Testing: Add Voter to Eligibility List...');

        try {
            const response = await fetch(`/api/rooms/${roomId}/voters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    single: true,
                    identifier: 'student@testschool.edu',
                    identifierType: 'email',
                    metadata: { name: 'Test Student', grade: '12' }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                log(`❌ Error: ${data.error}`);
            } else {
                log(`✅ Voter added to eligibility list!`);
                log(`   Email: student@testschool.edu`);
            }
        } catch (error: any) {
            log(`❌ Exception: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">🧪 Institutional Voting API Tests</h1>
                <p className="text-mono-60 mb-8">Test the backend APIs for organizations and rooms</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testCreateOrganization}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        1. Create Org
                    </button>

                    <button
                        onClick={testCreateRoom}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        2. Create Room
                    </button>

                    <button
                        onClick={testAddVoter}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        3. Add Voter
                    </button>
                </div>

                <div className="card-elevated p-6">
                    <h3 className="text-lg font-bold mb-4">Console Output</h3>
                    <pre className="bg-black/50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap min-h-[300px]">
                        {output || 'Click a button to run tests...'}
                    </pre>
                </div>

                <div className="card p-4 bg-blue-500/10 border-blue-500/20 mt-6">
                    <p className="text-sm text-mono-70">
                        💡 <strong>Instructions:</strong>
                    </p>
                    <ol className="text-sm text-mono-60 mt-2 space-y-1 ml-4">
                        <li>1. Click "Create Org" to create a test organization</li>
                        <li>2. Click "Create Room" to create a voting room</li>
                        <li>3. Click "Add Voter" to add someone to the eligibility list</li>
                        <li>4. Check console output for results</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
