'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Line, useCursor, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface NodeData {
    id: string;
    position: [number, number, number];
    title: string;
    type: 'debate' | 'discussion' | 'hub';
    status: 'live' | 'stable' | 'conflict' | 'hub';
    participants: number;
    sector: number;
    organization_id?: string;
}

interface DiscourseMeshProps {
    onSelectNode: (node: any) => void;
    feed: any[];
    organizations: any[];
}

function HexGrid() {
    // Generate a hexagonal grid background
    const hexGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const size = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = size * Math.cos(angle);
            const y = size * Math.sin(angle);
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
        return new THREE.ShapeGeometry(shape);
    }, []);

    // Create a grid of hexagons
    const positions = useMemo(() => {
        const p = [];
        const gap = 12;
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                const xPos = x * gap + (y % 2) * (gap / 2);
                const yPos = y * (gap * 0.866);
                p.push([xPos, yPos, -2]);
            }
        }
        return p;
    }, []);

    return (
        <group>
            {positions.map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <shapeGeometry args={[hexGeometry.parameters.shapes]} />
                    <meshBasicMaterial
                        color="#00ffff"
                        wireframe
                        transparent
                        opacity={0.05}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

function ParticleField() {
    const pointsArray = useMemo(() => {
        const p = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            const radius = 10 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            p[i * 3] = Math.cos(angle) * radius;
            p[i * 3 + 1] = Math.sin(angle) * radius;
            p[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
        return p;
    }, []);

    const pointsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.01;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={pointsArray.length / 3}
                    array={pointsArray}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                transparent
                color="#00ffff"
                size={0.03}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.15}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function ConnectionBeam({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) {
    const points = useMemo(() => [
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
    ], [start, end]);

    return (
        <Line
            points={points}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
        />
    );
}

function DiscourseNode({ node, onSelect, isHub = false }: { node: NodeData; onSelect: (node: any) => void, isHub?: boolean }) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = React.useState(false);
    useCursor(hovered);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y += Math.sin(state.clock.getElapsedTime() * (isHub ? 1 : 2) + node.sector) * (isHub ? 0.001 : 0.002);
            if (isHub) {
                meshRef.current.rotation.y += 0.005;
            } else {
                meshRef.current.rotation.z += 0.01;
            }
        }
    });

    const isCyan = node.status === 'stable' || node.status === 'live' || isHub;
    const color = isCyan ? '#00ffff' : '#ff00ff';

    return (
        <group ref={meshRef} position={node.position} onClick={() => onSelect(node)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {/* Focal Aura */}
            <mesh>
                <circleGeometry args={[isHub ? 0.8 : 0.4, 32]} />
                <meshBasicMaterial color={color} transparent opacity={hovered ? 0.3 : 0.08} blending={THREE.AdditiveBlending} />
            </mesh>

            {isHub ? (
                /* Organization Hub Geometry: Octahedron */
                <mesh>
                    <octahedronGeometry args={[0.4]} />
                    <meshStandardMaterial
                        color={color}
                        wireframe
                        emissive={color}
                        emissiveIntensity={1}
                        transparent
                        opacity={0.8}
                    />
                    <mesh>
                        <octahedronGeometry args={[0.15]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
                    </mesh>
                </mesh>
            ) : (
                /* Signal Node Geometry */
                <>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.2, 0.015, 16, 32]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.6} />
                    </mesh>
                    <mesh>
                        <sphereGeometry args={[0.06, 16, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
                    </mesh>
                </>
            )}

            {/* Tactical Label */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
                <Text
                    position={[0, isHub ? 0.8 : 0.45, 0]}
                    fontSize={isHub ? 0.18 : 0.12}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2}
                >
                    {node.title.toUpperCase()}
                </Text>
                {!isHub && (
                    <Text
                        position={[0, 0.3, 0]}
                        fontSize={0.06}
                        color={color}
                        anchorX="center"
                        anchorY="middle"
                    >
                        REL_SEC_{node.sector} // {node.participants}_SIGNALS
                    </Text>
                )}
            </Float>
        </group>
    );
}

export default function DiscourseMesh({ onSelectNode, feed, organizations }: DiscourseMeshProps) {
    const { nodes, hubs, beams } = useMemo(() => {
        if (!feed || feed.length === 0) return { nodes: [], hubs: [], beams: [] };

        const hubNodes: NodeData[] = (organizations || []).map((org, i) => {
            const angle = (i / organizations.length) * Math.PI * 2;
            const radius = 6;
            return {
                id: org.id,
                title: org.name,
                type: 'hub',
                status: 'hub',
                participants: 0,
                sector: i,
                position: [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                ] as [number, number, number]
            };
        });

        const signalNodes: NodeData[] = feed.map((item, i) => {
            // Find parent hub
            const hubIndex = hubNodes.findIndex(h => h.id === item.organization_id);
            const hub = hubIndex !== -1 ? hubNodes[hubIndex] : null;

            let position: [number, number, number];
            if (hub) {
                // Cluster around hub
                const angle = (i * 0.5) % (Math.PI * 2);
                const radius = 1.2 + Math.random() * 0.8;
                position = [
                    hub.position[0] + Math.cos(angle) * radius,
                    hub.position[1] + Math.sin(angle) * radius,
                    (Math.random() - 0.5) * 1
                ];
            } else {
                // Fallback: Random orbit
                const angle = Math.random() * Math.PI * 2;
                const radius = 10 + Math.random() * 5;
                position = [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    (Math.random() - 0.5) * 2
                ];
            }

            return {
                id: item.id,
                title: item.title,
                type: item.type,
                status: item.status === 'live' ? 'live' : (item.replies > 20 ? 'stable' : 'conflict'),
                participants: item.participants || item.replies || 0,
                sector: hubIndex !== -1 ? hubIndex : 99,
                organization_id: item.organization_id,
                position
            };
        });

        // Generate Beams
        const beamsData: any[] = signalNodes
            .filter(s => s.organization_id)
            .map(s => {
                const hub = hubNodes.find(h => h.id === s.organization_id);
                if (!hub) return null;
                return {
                    start: hub.position,
                    end: s.position,
                    color: s.status === 'conflict' ? '#ff00ff' : '#00ffff'
                };
            })
            .filter(Boolean);

        return { nodes: signalNodes, hubs: hubNodes, beams: beamsData };
    }, [feed, organizations]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    return (
        <div className="w-full h-full bg-transparent">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 18 : 12]} fov={isMobile ? 50 : 40} />
                <color attach="background" args={['#0a0a0a']} />
                <fog attach="fog" args={['#0a0a0a', 8, 30]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />

                <HexGrid />
                <ParticleField />

                {/* Render Hubs */}
                {hubs.map(hub => (
                    <DiscourseNode key={hub.id} node={hub} onSelect={onSelectNode} isHub />
                ))}

                {/* Render Signals */}
                {nodes.map(node => (
                    <DiscourseNode key={node.id} node={node} onSelect={onSelectNode} />
                ))}

                {/* Render Beams */}
                {beams.map((beam, i) => (
                    <ConnectionBeam key={i} start={beam.start} end={beam.end} color={beam.color} />
                ))}

                <ScanLine />
            </Canvas>
        </div>
    );
}

function ScanLine() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 8;
        }
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[40, 0.1]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}
