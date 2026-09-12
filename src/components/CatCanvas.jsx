import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../utils/audio';

const CatCanvas = forwardRef(function CatCanvas({ onPet }, ref) {
  const canvasRef = useRef(null);
  const internalRef = useRef({});

  useImperativeHandle(ref, () => ({
    petCat: (clientX, clientY) => {
      if (internalRef.current.petCat) {
        internalRef.current.petCat(clientX, clientY);
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffe8d6, 0.035);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting (Golden warm morning atmosphere)
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.15);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.6);
    sunLight.position.set(4, 7, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xff9a76, 0.85);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // 3. Materials
    const catColor = 0xfffcf9; // Creamy warm white cat
    const orangeStripeColor = 0xffa964; // Gentle orange patches
    const pinkColor = 0xffb0ba; // Soft pink nose/ears/cheeks
    const eyeColor = 0x2b3846; // Deep navy gloss eyes

    const furMaterial = new THREE.MeshLambertMaterial({ color: catColor });
    const patchMaterial = new THREE.MeshLambertMaterial({ color: orangeStripeColor });
    const innerEarMaterial = new THREE.MeshLambertMaterial({ color: pinkColor });
    const noseMaterial = new THREE.MeshLambertMaterial({ color: pinkColor });
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: eyeColor, shininess: 90 });
    const eyeSparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0xc4b5a5, linewidth: 2 });
    const collarMaterial = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const bellMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.65, roughness: 0.25 });

    const catGroup = new THREE.Group();
    catGroup.position.set(0, -0.65, 0);
    scene.add(catGroup);

    // --- Body ---
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 24);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, furMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    catGroup.add(bodyMesh);

    // Cute orange patch on back
    const backPatchGeo = new THREE.SphereGeometry(0.5, 16, 16);
    backPatchGeo.scale(0.8, 1, 0.3);
    const backPatch = new THREE.Mesh(backPatchGeo, patchMaterial);
    backPatch.position.set(0.35, 0.25, -0.65);
    catGroup.add(backPatch);

    // --- Paws ---
    const pawGeo = new THREE.SphereGeometry(0.22, 16, 16);
    pawGeo.scale(0.9, 0.6, 1.25);

    const leftPaw = new THREE.Mesh(pawGeo, furMaterial);
    leftPaw.position.set(-0.42, -0.85, 0.65);
    leftPaw.castShadow = true;
    catGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, furMaterial);
    rightPaw.position.set(0.42, -0.85, 0.65);
    rightPaw.castShadow = true;
    catGroup.add(rightPaw);

    // --- Tail ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.6, -0.8);
    catGroup.add(tailGroup);

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.25, 0.35, -0.3),
      new THREE.Vector3(0.1, 0.8, -0.45),
      new THREE.Vector3(-0.15, 1.1, -0.35)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.09, 8, false);
    const tailMesh = new THREE.Mesh(tailGeo, patchMaterial);
    tailMesh.castShadow = true;
    tailGroup.add(tailMesh);

    // --- Collar & Bell ---
    const collarGeo = new THREE.TorusGeometry(0.72, 0.05, 12, 32);
    collarGeo.rotateX(Math.PI / 2.2);
    const collarMesh = new THREE.Mesh(collarGeo, collarMaterial);
    collarMesh.position.set(0, 0.6, 0.05);
    catGroup.add(collarMesh);

    const bellGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const bellMesh = new THREE.Mesh(bellGeo, bellMaterial);
    bellMesh.position.set(0, 0.48, 0.72);
    bellMesh.castShadow = true;
    catGroup.add(bellMesh);

    // --- Head Group ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0.15);
    catGroup.add(headGroup);

    // Head Base (Chubby cheeks)
    const headGeo = new THREE.SphereGeometry(0.72, 32, 28);
    headGeo.scale(1.1, 0.95, 1.02);
    const headMesh = new THREE.Mesh(headGeo, furMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Cute forehead patch
    const foreheadPatchGeo = new THREE.SphereGeometry(0.38, 16, 16);
    foreheadPatchGeo.scale(0.8, 0.9, 0.3);
    const foreheadPatch = new THREE.Mesh(foreheadPatchGeo, patchMaterial);
    foreheadPatch.position.set(-0.25, 0.3, 0.58);
    foreheadPatch.rotation.set(-0.1, 0.2, 0.1);
    headGroup.add(foreheadPatch);

    // --- Ears with wiggle ---
    const leftEarGroup = new THREE.Group();
    leftEarGroup.position.set(-0.48, 0.58, 0.1);
    leftEarGroup.rotation.z = 0.25;
    leftEarGroup.rotation.x = -0.15;
    headGroup.add(leftEarGroup);

    const earGeo = new THREE.ConeGeometry(0.28, 0.5, 4);
    earGeo.scale(1, 1, 0.45);
    const leftEarMesh = new THREE.Mesh(earGeo, furMaterial);
    leftEarGroup.add(leftEarMesh);

    const innerEarGeo = new THREE.ConeGeometry(0.18, 0.36, 4);
    innerEarGeo.scale(1, 1, 0.35);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    leftInnerEar.position.set(0, -0.04, 0.05);
    leftEarGroup.add(leftInnerEar);

    const rightEarGroup = new THREE.Group();
    rightEarGroup.position.set(0.48, 0.58, 0.1);
    rightEarGroup.rotation.z = -0.25;
    rightEarGroup.rotation.x = -0.15;
    headGroup.add(rightEarGroup);

    const rightEarMesh = new THREE.Mesh(earGeo, patchMaterial);
    rightEarGroup.add(rightEarMesh);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, innerEarMaterial);
    rightInnerEar.position.set(0, -0.04, 0.05);
    rightEarGroup.add(rightInnerEar);

    // --- Eyes (Glossy with anime sparkles) ---
    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);

    const eyeBaseGeo = new THREE.SphereGeometry(0.12, 20, 20);
    const eyeSparkleGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const eyeMiniSparkleGeo = new THREE.SphereGeometry(0.02, 8, 8);

    // Left Eye
    const leftEyeContainer = new THREE.Group();
    leftEyeContainer.position.set(-0.28, 0.08, 0.66);
    eyesGroup.add(leftEyeContainer);

    const leftEye = new THREE.Mesh(eyeBaseGeo, eyeMaterial);
    leftEyeContainer.add(leftEye);

    const leftSparkle1 = new THREE.Mesh(eyeSparkleGeo, eyeSparkleMaterial);
    leftSparkle1.position.set(-0.03, 0.04, 0.1);
    leftEyeContainer.add(leftSparkle1);

    const leftSparkle2 = new THREE.Mesh(eyeMiniSparkleGeo, eyeSparkleMaterial);
    leftSparkle2.position.set(0.04, -0.03, 0.1);
    leftEyeContainer.add(leftSparkle2);

    // Right Eye
    const rightEyeContainer = new THREE.Group();
    rightEyeContainer.position.set(0.28, 0.08, 0.66);
    eyesGroup.add(rightEyeContainer);

    const rightEye = new THREE.Mesh(eyeBaseGeo, eyeMaterial);
    rightEyeContainer.add(rightEye);

    const rightSparkle1 = new THREE.Mesh(eyeSparkleGeo, eyeSparkleMaterial);
    rightSparkle1.position.set(-0.03, 0.04, 0.1);
    rightEyeContainer.add(rightSparkle1);

    const rightSparkle2 = new THREE.Mesh(eyeMiniSparkleGeo, eyeSparkleMaterial);
    rightSparkle2.position.set(0.04, -0.03, 0.1);
    rightEyeContainer.add(rightSparkle2);

    // Blushing Cheeks
    const blushGeo = new THREE.SphereGeometry(0.12, 16, 16);
    blushGeo.scale(1.2, 0.5, 0.4);

    const leftBlush = new THREE.Mesh(blushGeo, innerEarMaterial);
    leftBlush.position.set(-0.46, -0.07, 0.58);
    leftBlush.rotation.set(0.1, -0.4, 0.1);
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, innerEarMaterial);
    rightBlush.position.set(0.46, -0.07, 0.58);
    rightBlush.rotation.set(0.1, 0.4, -0.1);
    headGroup.add(rightBlush);

    // Tiny Pink Nose
    const noseGeo = new THREE.SphereGeometry(0.05, 12, 12);
    noseGeo.scale(1.1, 0.8, 0.9);
    const noseMesh = new THREE.Mesh(noseGeo, noseMaterial);
    noseMesh.position.set(0, 0.01, 0.74);
    headGroup.add(noseMesh);

    // Snout / Mouth Muzzle
    const muzzleGeo = new THREE.SphereGeometry(0.11, 14, 14);
    muzzleGeo.scale(1.1, 0.85, 0.7);

    const leftMuzzle = new THREE.Mesh(muzzleGeo, furMaterial);
    leftMuzzle.position.set(-0.08, -0.07, 0.69);
    headGroup.add(leftMuzzle);

    const rightMuzzle = new THREE.Mesh(muzzleGeo, furMaterial);
    rightMuzzle.position.set(0.08, -0.07, 0.69);
    headGroup.add(rightMuzzle);

    // Whiskers
    function createWhisker(x1, y1, z1, x2, y2, z2) {
      const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geom, whiskerMaterial);
    }
    headGroup.add(createWhisker(-0.16, -0.05, 0.7, -0.65, 0.02, 0.72));
    headGroup.add(createWhisker(-0.16, -0.09, 0.7, -0.62, -0.14, 0.7));
    headGroup.add(createWhisker(0.16, -0.05, 0.7, 0.65, 0.02, 0.72));
    headGroup.add(createWhisker(0.16, -0.09, 0.7, 0.62, -0.14, 0.7));

    // Dust particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 10;
      particlePos[i + 1] = Math.random() * 6 - 2;
      particlePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffe29a,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // Platform Cushion
    const cushionGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.25, 36);
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(0, -0.92, 0);
    cushion.receiveShadow = true;
    catGroup.add(cushion);

    // Mouse & Touch tracking coordinates
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const rayMouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (clientX, clientY) => {
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = -(clientY / window.innerHeight) * 2 + 1;
      mouse.targetX = x * 0.45;
      mouse.targetY = y * 0.35;

      rayMouse.x = x;
      rayMouse.y = y;
    };

    const handleMouseMove = (e) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Petting reaction implementation
    const petCat = (clientX, clientY) => {
      soundManager.playMeow();
      soundManager.playPurr();

      // Kill previous tweens so rapid clicks don't trap the scales mid-transition
      gsap.killTweensOf(catGroup.scale);
      gsap.killTweensOf(headGroup.rotation);
      gsap.killTweensOf([leftEarGroup.rotation, rightEarGroup.rotation]);
      gsap.killTweensOf(tailGroup.rotation);
      gsap.killTweensOf(eyesGroup.scale);

      // Bounce & Wiggle Animation via GSAP (always cleanly resets)
      gsap.fromTo(catGroup.scale,
        { x: 1, y: 1 },
        {
          x: 1.08,
          y: 0.92,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power1.out',
          onComplete: () => {
            catGroup.scale.set(1, 1, 1);
          }
        }
      );

      gsap.to(headGroup.rotation, {
        x: headGroup.rotation.x + 0.2,
        duration: 0.15,
        yoyo: true,
        repeat: 1
      });

      // Ear twitch
      gsap.to([leftEarGroup.rotation, rightEarGroup.rotation], {
        z: (i) => (i === 0 ? 0.45 : -0.45),
        duration: 0.12,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut'
      });

      // Tail energetic swish
      gsap.to(tailGroup.rotation, {
        y: 0.8,
        duration: 0.18,
        yoyo: true,
        repeat: 3
      });

      // Close eyes warmly and GUARANTEE they reopen completely to y = 1
      eyesGroup.scale.y = 1;
      gsap.fromTo(eyesGroup.scale,
        { y: 1 },
        {
          y: 0.1,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
          onComplete: () => {
            eyesGroup.scale.y = 1;
          }
        }
      );

      const clickX = clientX || window.innerWidth / 2;
      const clickY = clientY || window.innerHeight / 2 + 20;
      if (onPet) {
        onPet(clickX, clickY);
      }
    };

    internalRef.current.petCat = petCat;

    // Direct canvas tap/click detection on cat
    const handleCanvasInteraction = (e) => {
      let clientX = e.clientX;
      let clientY = e.clientY;

      if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
        rayMouse.x = (clientX / window.innerWidth) * 2 - 1;
        rayMouse.y = -(clientY / window.innerHeight) * 2 + 1;
      }

      raycaster.setFromCamera(rayMouse, camera);
      const intersects = raycaster.intersectObjects(catGroup.children, true);

      if (intersects.length > 0) {
        petCat(clientX, clientY);
      }
    };

    canvas.addEventListener('click', handleCanvasInteraction);
    canvas.addEventListener('touchend', handleCanvasInteraction);

    // Natural blinking
    let lastBlinkTime = 0;
    let blinkInterval = 3.5;

    const checkBlink = (time) => {
      if (time - lastBlinkTime > blinkInterval) {
        lastBlinkTime = time;
        blinkInterval = 2.5 + Math.random() * 3.5;

        // Only blink if eyes are not currently tweened by petting
        if (!gsap.isTweening(eyesGroup.scale)) {
          gsap.killTweensOf(eyesGroup.scale);
          gsap.fromTo(eyesGroup.scale,
            { y: 1 },
            {
              y: 0.05,
              duration: 0.09,
              yoyo: true,
              repeat: 1,
              ease: 'power2.inOut',
              onComplete: () => {
                eyesGroup.scale.y = 1;
              }
            }
          );
        }
      }
    };

    // Responsive camera & positioning optimization for Mobile vs Desktop
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;

      camera.aspect = aspect;

      // Dynamic framing:
      // Mobile screens (portrait aspect < 0.8) need greater camera distance and slight downward offset
      // so the cat is perfectly placed between top header and bottom quote card.
      if (width < 480) {
        camera.position.set(0, 1.25, 7.3);
        catGroup.position.set(0, -1.05, 0);
      } else if (width < 768) {
        camera.position.set(0, 1.25, 6.6);
        catGroup.position.set(0, -0.95, 0);
      } else {
        camera.position.set(0, 1.2, 5.8);
        catGroup.position.set(0, -0.65, 0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth tracking interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Cat head tracks cursor / touch
      headGroup.rotation.y = mouse.x * 0.9;
      headGroup.rotation.x = -mouse.y * 0.7;

      // Cute natural breathing motion
      const baseCatY = window.innerWidth < 480 ? -1.05 : (window.innerWidth < 768 ? -0.95 : -0.65);
      catGroup.position.y = baseCatY + Math.sin(elapsedTime * 2.2) * 0.025;
      bodyMesh.scale.y = 1.15 + Math.sin(elapsedTime * 2.2) * 0.02;

      // Gentle tail idle swaying
      tailGroup.rotation.y = Math.sin(elapsedTime * 2.0) * 0.35;
      tailGroup.rotation.z = Math.cos(elapsedTime * 1.5) * 0.08;

      // Soft bell dangle
      bellMesh.position.x = Math.sin(elapsedTime * 3.0) * 0.015;

      // Upward drift for morning particles
      const positions = dustParticles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.0035;
        if (positions[i] > 4) {
          positions[i] = -2;
        }
      }
      dustParticles.geometry.attributes.position.needsUpdate = true;
      dustParticles.rotation.y = elapsedTime * 0.02;

      // Blinking controller
      checkBlink(elapsedTime);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasInteraction);
      canvas.removeEventListener('touchend', handleCanvasInteraction);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js objects
      renderer.dispose();
      [
        bodyGeo, backPatchGeo, pawGeo, tailGeo, collarGeo, bellGeo,
        headGeo, foreheadPatchGeo, earGeo, innerEarGeo, eyeBaseGeo,
        eyeSparkleGeo, eyeMiniSparkleGeo, blushGeo, noseGeo, muzzleGeo,
        particleGeo, cushionGeo
      ].forEach(geo => geo.dispose());

      [
        furMaterial, patchMaterial, innerEarMaterial, noseMaterial,
        eyeMaterial, eyeSparkleMaterial, whiskerMaterial, collarMaterial,
        bellMaterial, particleMat, cushionMat
      ].forEach(mat => mat.dispose());
    };
  }, [onPet]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      className="fixed inset-0 w-full h-full z-[1] pointer-events-auto touch-none"
    />
  );
});

export default CatCanvas;
