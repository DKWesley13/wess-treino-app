// WESS TREINO R22: avatar 3D (three.js, MIT) montado com primitivas — luz, sombra e câmera em órbita.
// Recebe as articulações 2D (vista lateral, espaço 360x215) de r21Pose e as leva para 3D.
// É uma simulação gerada por computador, não uma pessoa filmada.
import * as THREE from './three/three.module.js';

const S = 1 / 60;
const toV = (p, z) => new THREE.Vector3((p[0] - 180) * S, (205 - p[1]) * S, z || 0);

export function create(wrap) {
  const W = wrap.clientWidth || 360, H = wrap.clientHeight || 300;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const cv = renderer.domElement; cv.id = 'wt3dCanvas';
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  wrap.insertBefore(cv, wrap.children[1] || null);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x1a1208, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2.5, 5, 3.5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff1e0, 1.1); rim.position.set(-3, 2.5, -3); scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.ShadowMaterial({ opacity: 0.45 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; floor.receiveShadow = true; scene.add(floor);

  const mat = {
    skin: new THREE.MeshStandardMaterial({ color: 0xc58a64, roughness: 0.55, metalness: 0.0 }),
    skinHot: new THREE.MeshStandardMaterial({ color: 0xc58a64, roughness: 0.5, emissive: 0xff1f35, emissiveIntensity: 0 }),
    shirt: new THREE.MeshStandardMaterial({ color: 0x0b5ad9, roughness: 0.7 }),
    shorts: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }),
    shoe: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x1c1410, roughness: 0.9 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.65 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x9aa6b2, roughness: 0.3, metalness: 0.85 }),
    accent: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4, metalness: 0.4 }),
    cable: new THREE.LineBasicMaterial({ color: 0xcbd5e1 }),
    shirtHot: new THREE.MeshStandardMaterial({ color: 0x0b5ad9, roughness: 0.6, emissive: 0xff1f35, emissiveIntensity: 0 }),
    grip: new THREE.MeshBasicMaterial({ color: 0xffd60a, transparent: true, opacity: 0.85, toneMapped: false })
  };
  const root = new THREE.Group(); scene.add(root);
  const unitCap = new THREE.CapsuleGeometry(1, 1, 6, 16);
  const unitSph = new THREE.SphereGeometry(1, 24, 16);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
  const pool = []; let used = 0;
  function mesh(geo, m) {
    let o = pool[used];
    if (!o) { o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; pool.push(o); root.add(o); }
    o.geometry = geo; o.material = m; o.visible = true; o.scale.set(1, 1, 1); o.rotation.set(0, 0, 0); o.quaternion.identity(); used++; return o;
  }
  const UP = new THREE.Vector3(0, 1, 0);
  function limb(a, b, r, m, flat) {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const o = mesh(unitCap, m);
    o.position.copy(a).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    o.scale.set(r * (flat || 1), len / 3, r);
    return o;
  }
  function sphere(c, r, m, sx, sy, sz) { const o = mesh(unitSph, m); o.position.copy(c); o.scale.set(r * (sx || 1), r * (sy || 1), r * (sz || 1)); return o; }
  function box(c, w, h, d, m, rz) { const o = mesh(unitBox, m); o.position.copy(c); o.scale.set(w, h, d); if (rz) o.rotation.z = rz; return o; }
  function bar(c, len, r, m) { const o = mesh(unitCyl, m); o.position.copy(c); o.rotation.x = Math.PI / 2; o.scale.set(r, len, r); return o; }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), mat.cable); root.add(line);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffd60a, toneMapped: false });
  function mkArrow() { const g = new THREE.Group(); const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12), arrowMat); shaft.position.y = 0.25; const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 16), arrowMat); head.position.y = 0.63; g.add(shaft, head); root.add(g); return g; }
  const arrow = mkArrow(), arrow2 = mkArrow();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 32), mat.grip); root.add(ring);

  function render(P, t, elapsed, hotSeg, gripWidth, nextP, moveJoint) {
    if (human) human.visible = false; root.visible = true;
    used = 0;
    const SW = 0.2; // half shoulder/hip width
    const Z = { near: SW, far: -SW };
    const J = k => P[k];
    const foot = P.toe || [P.an[0] + 16, P.an[1] + 2];
    mat.skinHot.emissiveIntensity = 0.25 + 0.55 * t; mat.shirtHot.emissiveIntensity = 0.06 + 0.18 * t;
    // equipment
    if (P.seat) { box(toV([P.seat[0], P.seat[1] + 2]), 1.15, 0.22, 0.75, mat.pad); const post = mesh(unitCyl, mat.metal); post.position.copy(toV([P.seat[0], (P.seat[1] + 205) / 2])); post.scale.set(0.05, (205 - P.seat[1]) * S, 0.05); }
    if (P.back) { const [x1, y1, x2, y2] = P.back; const a = toV([x1, y1]), b = toV([x2, y2]); const o = box(a.clone().lerp(b, 0.5), 0.26, a.distanceTo(b), 0.7, mat.pad); o.rotation.z = Math.atan2(b.x - a.x, a.y - b.y) * -1; }
    if (P.recline) { const a = toV([150, 182]), b = toV([86, 108]); const o = box(a.clone().lerp(b, 0.5), 0.26, a.distanceTo(b) + 0.3, 0.75, mat.pad); o.rotation.z = -Math.atan2(b.x - a.x, b.y - a.y); box(toV([154, 178]), 0.9, 0.2, 0.75, mat.pad);
      const r1 = toV([196, 150]), r2 = toV([330, 20]); [-0.45, 0.45].forEach(z => limb(r1.clone().setZ(z), r2.clone().setZ(z), 0.035, mat.metal));
      const s = toV(P.sled); const o2 = box(s, 0.16, 1.1, 0.9, mat.accent); o2.rotation.z = -0.78; }
    if (P.pad && Array.isArray(P.pad)) box(toV(P.pad), 0.45, 0.22, 0.7, mat.pad);
    if (P.bike) { limb(toV([150, 118]), toV([196, 168]), 0.05, mat.metal); limb(toV([196, 168]), toV([250, 90]), 0.05, mat.metal); const w = mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 32), mat.metal); w.position.copy(toV([196, 168])); }
    if (P.floor) box(toV([180, 200]), 4.6, 0.05, 1.2, mat.pad);
    if (P.box) { const [bx, by, bw, bh] = P.box; box(toV([bx + bw / 2, by + bh / 2]), bw / 60, bh / 60, 0.9, mat.pad); }
    if (P.cable) { line.visible = true; line.geometry.setFromPoints([toV(P.cable, 0), toV(P.wr, 0)]); } else line.visible = false;
    if (P.handle === 'bar' || P.handle === 'press') bar(toV(P.wr, 0), (gripWidth || 0.5) * 2 + 0.35, 0.03, mat.metal);
    if (P.bar) { bar(toV(P.sh, 0), 1.9, 0.035, mat.metal); [-0.85, 0.85].forEach(z => { const o = bar(toV(P.sh, z), 0.08, 0.32, mat.pad); void o; }); }
    // body: both sides
    const hw = (gripWidth || SW + 0.05);
    [['far', mat.skin], ['near', mat.skin]].forEach(([side]) => {
      const z = Z[side], hz = side === 'near' ? hw : -hw;
      // R28: far limbs can have their own pose (lunge, mountain climber, walk); jumping jacks spread legs/arms sideways
      const F = (k, d) => (side === 'far' && P[k + '2']) ? P[k + '2'] : d;
      const sp = P.spread ? P.spread * 0.28 : 0;
      const hip = toV(J('hip'), z * 0.8), kn = toV(F('kn', J('kn')), z * (0.85 + sp * 2)), an = toV(F('an', J('an')), z * (0.85 + sp * 4)), ft = toV(F('toe', foot), z * (0.85 + sp * 4));
      const sh = toV(J('sh'), z * 1.15), el = toV(F('el', J('el')), (z * 1.2 + hz) / 2 * (1 + sp * 3)), wr = toV(F('wr', J('wr')), hz * (1 + sp * 4));
      const legHot = hotSeg === 'thigh', armHot = hotSeg === 'upper';
      limb(hip, kn, 0.13, mat.shorts);
      limb(hip.clone().lerp(kn, 0.5), kn, 0.115, legHot ? mat.skinHot : mat.skin);
      limb(kn, an, 0.085, hotSeg === 'shin' ? mat.skinHot : mat.skin); sphere(kn, 0.1, mat.skin);
      const f = box(an.clone().lerp(ft, 0.55).add(new THREE.Vector3(0, -0.04, 0)), 0.3, 0.1, 0.12, mat.shoe); f.rotation.z = Math.atan2(ft.y - an.y, ft.x - an.x);
      limb(sh, el, 0.07, armHot ? mat.skinHot : mat.skin); limb(sh, sh.clone().lerp(el, 0.38), 0.085, mat.shirt);
      limb(el, wr, 0.058, hotSeg === 'fore' ? mat.skinHot : mat.skin); sphere(el, 0.062, mat.skin);
      sphere(wr, 0.07, mat.skin, 1, 1.1, 0.8);
    });
    // torso, neck, head
    const hipC = toV(J('hip')), shC = toV(J('sh'));
    limb(hipC, shC, 0.17, hotSeg === 'torso' ? mat.shirtHot : mat.shirt, 0.75).scale.z = 0.3;
    sphere(hipC, 0.17, mat.shorts, 0.9, 0.8, 1.45);
    sphere(shC, 0.16, mat.shirt, 0.8, 0.75, 1.75);
    const head = toV(J('head'));
    limb(shC, head.clone().lerp(shC, 0.45), 0.055, mat.skin);
    sphere(head, 0.19, mat.skin, 0.95, 1.12, 0.9);
    sphere(head.clone().add(new THREE.Vector3(-0.03, 0.06, 0)), 0.19, mat.hair, 0.98, 0.95, 0.94).scale.y *= 0.62;
    // grip highlight on the near hand
    const g = toV(J('wr'), hw); ring.position.copy(g); ring.visible = P.handle !== 'none'; ring.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.15); ring.lookAt(camera.position);
    // movement arrows: direction the moving joint is travelling right now (both sides)
    arrow.visible = arrow2.visible = false;
    if (nextP && moveJoint && P[moveJoint] && nextP[moveJoint]) {
      const z = moveJoint === 'wr' ? hw : SW * 0.85;
      const a0 = toV(P[moveJoint]), a1 = toV(nextP[moveJoint]), d = a1.clone().sub(a0);
      if (d.length() > 0.004) { d.normalize(); [[arrow, z + 0.18], [arrow2, -z - 0.18]].forEach(([ar, zz]) => { ar.position.copy(a0).setZ(zz).addScaledVector(d, 0.1); ar.quaternion.setFromUnitVectors(UP, d); ar.visible = true; }); }
    }
    for (let i = used; i < pool.length; i++) pool[i].visible = false;
    // camera orbit (the "5D" depth): slow swing around the athlete
    const ang = 0.55 + Math.sin(elapsed * 0.35) * 0.45;
    const cx = (hipC.x + shC.x + toV(J('kn')).x) / 3, cy = Math.max(0.9, (hipC.y + head.y) / 2 - 0.1);
    camera.position.set(cx + Math.sin(ang) * 7.4, cy + 1.1, Math.cos(ang) * 7.4);
    camera.lookAt(cx, cy, 0);
    renderer.render(scene, camera);
  }
  // ---------- R25: corpo humano com captura de movimento real (CC0, Mesh2Motion/Quaternius) ----------
  let human = null, humanLoading = false, mixer = null, clips = {}, curClip = null, humanFail = false;
  function loadHuman() {
    if (human || humanLoading || humanFail) return;
    humanLoading = true;
    import('./three/addons/GLTFLoader.js').then(({ GLTFLoader }) => {
      const L = new GLTFLoader();
      L.load('./vendor/avatar/wt_human.glb', g => {
        const m = g.scene;
        m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material = dressedSkin(o.geometry); o.frustumCulled = false; } });
        g.animations.forEach(a => { clips[a.name] = a; });
        L.load('./vendor/avatar/wt_human_anims2.glb', g2 => { g2.animations.forEach(a => { clips[a.name] = a; }); }, undefined, () => {});
        m.visible = false; scene.add(m); human = m; mixer = new THREE.AnimationMixer(m); humanLoading = false;
      }, undefined, () => { humanFail = true; humanLoading = false; });
    }).catch(() => { humanFail = true; humanLoading = false; });
  }
  // R26: clothes painted by bind-pose height (shirt, shorts, shoes) so they follow the skinned motion
  function dressedSkin(geo) {
    geo.computeBoundingBox(); const bb = geo.boundingBox, axis = (bb.max.y - bb.min.y) >= (bb.max.z - bb.min.z) ? 'y' : 'z';
    const lo = bb.min[axis], hi = bb.max[axis];
    const mat = new THREE.MeshStandardMaterial({ color: 0xc58a64, roughness: 0.48, metalness: 0 });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uLo = { value: lo }; sh.uniforms.uHi = { value: hi };
      const NL = '\n';
      sh.vertexShader = 'varying float vH; varying float vX;' + NL + 'uniform float uLo; uniform float uHi;' + NL + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>' + NL + 'vH = (position.' + axis + ' - uLo) / (uHi - uLo); vX = abs(position.x) / (uHi - uLo);');
      sh.fragmentShader = 'varying float vH; varying float vX;' + NL + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>' + NL +
        'vec3 shirt = vec3(0.04, 0.32, 0.85); vec3 shorts = vec3(0.07, 0.08, 0.11); vec3 shoe = vec3(0.92, 0.93, 0.95);' + NL +
        'float sh1 = smoothstep(0.535, 0.545, vH) * (1.0 - smoothstep(0.80, 0.81, vH)) * (1.0 - smoothstep(0.155, 0.165, vX));' + NL +
        'float sh2 = smoothstep(0.43, 0.44, vH) * (1.0 - smoothstep(0.545, 0.555, vH));' + NL +
        'float sh3 = 1.0 - smoothstep(0.045, 0.055, vH);' + NL +
        'diffuseColor.rgb = mix(diffuseColor.rgb, shirt, sh1); diffuseColor.rgb = mix(diffuseColor.rgb, shorts, sh2); diffuseColor.rgb = mix(diffuseColor.rgb, shoe, sh3);');
    };
    return mat;
  }
  // returns true when the mocap body was drawn; false = caller draws the procedural avatar
  function renderMocap(clipName, elapsed, speed) {
    loadHuman();
    if (!human || !clips[clipName]) return false;
    if (curClip !== clipName) { mixer.stopAllAction(); mixer.clipAction(clips[clipName]).play(); curClip = clipName; }
    const c = clips[clipName]; mixer.setTime((elapsed * (speed || 1)) % c.duration);
    human.visible = true; root.visible = false; arrow.visible = arrow2.visible = false;
    const box = new THREE.Box3().setFromObject(human), ctr = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    // frame on a stable target (the clip's ground footprint), not the animated box, so the camera does not bob
    if (!human.userData.frame || human.userData.frame.clip !== clipName) { human.userData.frame = { clip: clipName, x: ctr.x, z: ctr.z, h: sz.y, low: sz.y < 1 }; }
    const F = human.userData.frame, ang = 0.75 + Math.sin(elapsed * 0.3) * 0.45, d = F.low ? 3.6 : 5.6, ty = F.low ? 0.35 : 0.95;
    camera.position.set(F.x + Math.sin(ang) * d, ty + (F.low ? 1.1 : 0.6), F.z + Math.cos(ang) * d);
    camera.lookAt(F.x, ty - (F.low ? 0 : 0.12), F.z);
    renderer.render(scene, camera);
    return true;
  }
  function resize() { const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function dispose() { renderer.dispose(); cv.remove(); }
  return { render, renderMocap, loadHuman, resize, dispose, canvas: cv, mocapReady: () => !!human };
}
