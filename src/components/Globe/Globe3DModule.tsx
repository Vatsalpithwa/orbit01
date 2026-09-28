'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Globe2,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  Maximize2,
  RotateCw,
  Compass,
  X,
} from 'lucide-react';
import { GlobeEvent } from '@/lib/types';
import { INITIAL_GLOBE_EVENTS } from '@/lib/sampleData';
import { useToast } from '@/components/Notification/ToastContext';

export default function Globe3DModule() {
  const { showToast } = useToast();
  const mountRef = useRef<HTMLDivElement>(null);

  const [selectedEvent, setSelectedEvent] = useState<GlobeEvent | null>(INITIAL_GLOBE_EVENTS[0]);
  const [autoRotate, setAutoRotate] = useState(true);

  // References to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markerMeshesRef = useRef<{ mesh: THREE.Mesh; event: GlobeEvent }[]>([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const width = mount.clientWidth || 800;
    const height = 540;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight.position.set(100, 100, 150);
    scene.add(dirLight);

    const purpleLight = new THREE.DirectionalLight(0x7928ca, 0.8);
    purpleLight.position.set(-100, -100, -100);
    scene.add(purpleLight);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Inner Core Sphere
    const sphereGeo = new THREE.SphereGeometry(70, 48, 48);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x090e1c,
      emissive: 0x040812,
      specular: 0x00f2fe,
      shininess: 25,
      transparent: true,
      opacity: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Wireframe Grid / Parallels & Meridians
    const wireGeo = new THREE.SphereGeometry(70.8, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Glowing Outer Atmosphere Rim
    const atmosGeo = new THREE.SphereGeometry(76, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.1,
    });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmos);

    // Background Particle Stars
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 600 - 100;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x7928ca, size: 2, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Lat/Long to 3D Vector function
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Add Interactive Event Markers
    const markerMeshes: { mesh: THREE.Mesh; event: GlobeEvent }[] = [];
    INITIAL_GLOBE_EVENTS.forEach((evt) => {
      const pos = latLngToVector3(evt.lat, evt.lng, 72.5);

      // Marker glowing dot
      const markerGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: evt.category === 'AI Breakthrough' ? 0x00f2fe : evt.category === 'Quantum Lab' ? 0x9d4edd : 0x10b981,
      });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      globeGroup.add(markerMesh);

      // Outer Pulse Ring
      const ringGeo = new THREE.RingGeometry(2.8, 4.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);

      markerMeshes.push({ mesh: markerMesh, event: evt });
    });
    markerMeshesRef.current = markerMeshes;

    // Mouse Interaction (Drag to rotate, click to inspect)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const rect = mount.getBoundingClientRect();
        mouseVector.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, camera);
        const meshes = markerMeshes.map((m) => m.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hit = markerMeshes.find((m) => m.mesh === intersects[0].object);
          if (hit) {
            setSelectedEvent(hit.event);
            showToast(`Inspecting Innovation Hub: ${hit.event.city}`, 'info');
          }
        }
      }
      isDragging = false;
    };

    // Zoom on wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.15, 140), 380);
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0025;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [autoRotate, showToast]);

  // Jump camera directly to an event location
  const handleJumpToEvent = (evt: GlobeEvent) => {
    setSelectedEvent(evt);
    if (globeGroupRef.current) {
      // Calculate target rotation to bring marker to front
      const targetY = -((evt.lng + 90) * (Math.PI / 180));
      const targetX = (evt.lat - 10) * (Math.PI / 180) * 0.4;
      globeGroupRef.current.rotation.y = targetY;
      globeGroupRef.current.rotation.x = targetX;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>3D Global Innovation & Frontier Tech Globe</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Interactive 3D Earth tracking real-time AI summits, quantum computing laboratories, and robotics breakthroughs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="gradient-btn-secondary"
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            <RotateCw size={14} style={{ animation: autoRotate ? 'spin 4s linear infinite' : 'none' }} />
            <span>{autoRotate ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Globe Stage & Event Card Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Three.js Canvas Container */}
        <div className="glass-panel" style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, #0a1122 0%, #060911 100%)',
          minHeight: '540px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 0 50px rgba(0, 242, 254, 0.1)',
        }}>
          {/* Canvas Mount */}
          <div ref={mountRef} style={{ width: '100%', height: '540px', cursor: 'grab' }} />

          {/* Floating Instructions */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            background: 'rgba(6, 9, 17, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}>
            🖱️ Drag to rotate • Scroll to zoom • Click pulsing pins to inspect
          </div>
        </div>

        {/* Event Detail Inspector Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedEvent ? (
            <div className="glass-panel" style={{
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(121, 40, 202, 0.05))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="badge-pill badge-cyan">
                  {selectedEvent.category}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} />
                  {selectedEvent.date}
                </span>
              </div>

              <h3 style={{ fontSize: '22px', marginBottom: '8px', color: '#fff' }}>
                {selectedEvent.title}
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00f2fe',
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '18px',
              }}>
                <MapPin size={15} />
                <span>{selectedEvent.city}, {selectedEvent.country}</span>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                {selectedEvent.summary}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '18px',
              }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Attribution: <strong>{selectedEvent.source}</strong>
                </div>

                <a
                  href={selectedEvent.url}
                  target="_blank"
                  rel="noreferrer"
                  className="gradient-btn-primary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  <span>Explore Coverage</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Click on any location marker on the 3D globe to inspect recent tech research breakthroughs.
            </div>
          )}

          {/* Quick-Jump Location Hubs */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600 }}>
              Global Innovation Clusters:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {INITIAL_GLOBE_EVENTS.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => handleJumpToEvent(evt)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: selectedEvent?.id === evt.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedEvent?.id === evt.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: selectedEvent?.id === evt.id ? '#00f2fe' : '#cbd5e1',
                    fontSize: '12.5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MapPin size={12} />
                  <span>{evt.city}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
