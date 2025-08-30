'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface AvatarProps {
  gender: 'male' | 'female';
  modelUrl: string;
}

interface ExpressionData {
  expressions: {
    smile?: number;
    frown?: number;
    surprise?: number;
    anger?: number;
    blink?: number;
    mouthOpen?: number;
  };
  headMovement: {
    x: number;
    y: number;
    z: number;
  };
}

export default function Avatar({ gender, modelUrl }: AvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load avatar model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        modelRef.current = model;

        // Set up animations if available
        if (gltf.animations.length) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixerRef.current?.clipAction(clip).play();
          });
        }

        // Set initial position and scale
        model.position.set(1, -1, 1);
        model.scale.set(2.5, 1.5, 1.5);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(clock.getDelta());
      }

      renderer.render(scene, camera);
    };
    animate();

    // Event listeners for expression and speech updates
    const handleExpressionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ExpressionData>;
      updateExpression(customEvent.detail);
    };

    const handleSpeechStart = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      startLipSync(customEvent.detail);
    };

    document.addEventListener('expressionUpdate', handleExpressionUpdate);
    document.addEventListener('speechStart', handleSpeechStart);
    document.addEventListener('speechEnd', stopLipSync);

    return () => {
      document.removeEventListener('expressionUpdate', handleExpressionUpdate);
      document.removeEventListener('speechStart', handleSpeechStart);
      document.removeEventListener('speechEnd', stopLipSync);

      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [gender, modelUrl]);

  const updateExpression = (expressionData: ExpressionData) => {
    if (!modelRef.current) return;

    // Update morph targets based on expression data
    const expressions = expressionData.expressions;
    Object.entries(expressions).forEach(([name, value]) => {
      const morphTarget = modelRef.current!.getObjectByName(name);
      if (morphTarget && (morphTarget as any).morphTargetInfluences) {
        (morphTarget as any).morphTargetInfluences[0] = value;
      }
    });

    // Update head position
    modelRef.current.position.x = expressionData.headMovement.x * 0.1;
    modelRef.current.position.y = expressionData.headMovement.y * 0.1;
  };

  const startLipSync = (text: string) => {
    if (!modelRef.current) return;

    // Simple lip sync based on phonemes
    const mouth = modelRef.current.getObjectByName('mouth');
    if (mouth && (mouth as any).morphTargetInfluences) {
      (mouth as any).morphTargetInfluences[0] = 0.8;
    }
  };

  const stopLipSync = () => {
    if (!modelRef.current) return;

    const mouth = modelRef.current.getObjectByName('mouth');
    if (mouth && (mouth as any).morphTargetInfluences) {
      (mouth as any).morphTargetInfluences[0] = 0;
    }
  };

  return <div ref={mountRef} className="w-full h-full" />;
}