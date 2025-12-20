'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Line, useCursor, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface NodeData {
    id: string;
    position: [number, number, number];
    title: string;
    type: 'debate' | 'discussion';
    status: 'live' | 'stable' | 'conflict';
    participants: number;
    sector: number;
}

function HexGrid() {
    // Generate a hexagonal grid background
    const hexGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const size = 2;
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
        const gap = 3.5;
        for (let x = -3; x <= 3; x++) {
            for (let y = -2; y <= 2; y++) {
                const xPos = x * gap + (y % 2) * (gap / 2);
                const yPos = y * (gap * 0.866);
                p.push([xPos, yPos, -1]);
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
                        opacity={0.03}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

function ParticleField() {
    const pointsArray = useMemo(() => {
        const p = new Float32Array(5000 * 3);
        for (let i = 0; i < 5000; i++) {
            // Cluster particles around the center and sectors
            const radius = Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            p[i * 3] = Math.cos(angle) * radius;
            p[i * 3 + 1] = Math.sin(angle) * radius;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, []);

    const pointsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z = state.clock.getElapsedTime() * 0.02;
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
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.2}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function DiscourseNode({ node, onSelect }: { node: NodeData; onSelect: (node: any) => void }) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = React.useState(false);
    useCursor(hovered);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y += Math.sin(state.clock.getElapsedTime() * 2 + node.sector) * 0.0015;
            meshRef.current.rotation.z += 0.01;
        }
    });

    const isCyan = node.status === 'stable' || node.status === 'live';
    const color = isCyan ? '#00ffff' : '#ff00ff';

    return (
        <group ref={meshRef} position={node.position} onClick={() => onSelect(node)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {/* Sector Highlight Aura */}
            <mesh>
                <circleGeometry args={[0.4, 32]} />
                <meshBasicMaterial color={color} transparent opacity={hovered ? 0.2 : 0.05} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Tactical Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.15, 0.01, 16, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>

            {/* Core Data Point */}
            <mesh>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>

            {/* Tactical Label */}
            <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
                <Text
                    position={[0, 0.35, 0]}
                    fontSize={0.08}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2}
                >
                    {node.title.toUpperCase()}
                </Text>
                <Text
                    position={[0, 0.25, 0]}
                    fontSize={0.04}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                >
                    DATA_SEC_{node.sector} // {node.participants}_SIGNALS
                </Text>
            </Float>
        </group>
    );
}

const DiscourseGroup = React.memo(({ nodes, onSelect }: { nodes: NodeData[]; onSelect: (node: any) => void }) => {
    return (
        <group>
            {nodes.map((node) => (
                <DiscourseNode key={node.id} node={node} onSelect={onSelect} />
            ))}
        </group>
    );
});

DiscourseGroup.displayName = 'DiscourseGroup';

export default function DiscourseMesh({ onSelectNode, feed }: { onSelectNode: (node: any) => void, feed: any[] }) {
    const nodes: NodeData[] = useMemo(() => {
        if (!feed || feed.length === 0) return [];
        return feed.map((item, i) => {
            // Sector-based clustering
            const sectorCount = 6;
            const sector = i % sectorCount;
            const sectorAngle = (sector / sectorCount) * Math.PI * 2;
            const sectorRadius = 4 + (Math.random() - 0.5) * 1.5;

            // Randomness within sector
            const innerAngle = (Math.random() - 0.5) * 0.5;
            const finalAngle = sectorAngle + innerAngle;

            return {
                id: item.id,
                title: item.title,
                type: item.type,
                status: item.status === 'live' ? 'live' : (item.replies > 10 ? 'stable' : 'conflict'),
                participants: item.participants || item.replies || 0,
                sector: sector,
                position: [
                    Math.cos(finalAngle) * sectorRadius,
                    Math.sin(finalAngle) * sectorRadius,
                    (Math.random() - 0.5) * 1.5
                ] as [number, number, number]
            };
        });
    }, [feed]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    return (
        <div className="w-full h-full bg-transparent">
            <Canvas shadows gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 12 : 8]} fov={isMobile ? 50 : 40} />
                <color attach="background" args={['#0a0a0a']} />
                <fog attach="fog" args={['#0a0a0a', 5, 20]} />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />

                <HexGrid />
                <ParticleField />
                <DiscourseGroup nodes={nodes} onSelect={onSelectNode} />

                {/* Tactical Scan Line (Global Effect) */}
                <ScanLine />
            </Canvas>
        </div>
    );
}

function ScanLine() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 5;
        }
    });

    return (
        <mesh ref={ref}>
            <planeGeometry args={[20, 0.05]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}
