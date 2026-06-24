"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * "The Spinning Pressing" — a single refractive vinyl record, dead-centre,
 * rendered as iridescent glass over a molten backdrop. Heavy (transmission =
 * FBO re-render), so it only runs on a real pointer + wide screen + motion-OK.
 * Everywhere else it degrades to a still CSS record, which still looks good.
 */
function Record({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.4;
  });
  return (
    <group ref={group} position={[1.35, 0.35, 0]} scale={0.96} rotation={[-0.5, 0, 0.1]}>
      {/* vinyl disc — glass with chromatic sheen */}
      <mesh>
        <cylinderGeometry args={[2.3, 2.3, 0.05, 120]} />
        <MeshTransmissionMaterial
          thickness={0.8}
          roughness={0.14}
          ior={1.46}
          chromaticAberration={0.55}
          anisotropy={0.4}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.08}
          color="#0a0a0f"
          background={new THREE.Color("#2a1640")}
          resolution={256}
          samples={6}
        />
      </mesh>
      {/* groove rings to read as vinyl */}
      {[0.95, 1.35, 1.75, 2.1].map((r) => (
        <mesh key={r} position={[0, 0.028, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.006, 8, 140]} />
          <meshStandardMaterial color="#3a3142" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* outer rim catches the light */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.028, 12, 120]} />
        <meshStandardMaterial color="#b0b0bd" metalness={0.9} roughness={0.28} />
      </mesh>
      {/* centre label — glows the brand pink */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.66, 0.66, 0.055, 64]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      {/* spindle hole */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export function VinylHero({ accent = "#ff3d6e" }: { accent?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.innerWidth >= 820;
    setEnabled(!reduce && wide);
  }, []);

  if (!enabled) {
    // Still, beautiful fallback: a CSS record on the molten field.
    return (
      <div className="vh-poster" aria-hidden>
        <div className="vh-disc" style={{ ["--accent" as string]: accent }} />
      </div>
    );
  }

  return (
    <div className="vh-canvas" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.5, 8.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} />
        <directionalLight position={[-5, -2, -3]} intensity={0.5} color={accent} />
        <Record accent={accent} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
