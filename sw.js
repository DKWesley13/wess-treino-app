const CACHE_NAME = 'wess-treino-offline-v7';
const ASSETS = [
  './',
  './index.html',
  './icons/apple-touch-icon.png',
  './vendor/wt3d.js',
  './vendor/three/three.module.js',
  './vendor/three/three.core.js',
  './vendor/three/addons/GLTFLoader.js',
  './vendor/three/addons/BufferGeometryUtils.js',
  './vendor/three/addons/SkeletonUtils.js',
  './vendor/avatar/wt_human.glb',
  './vendor/avatar/wt_human_anims2.glb',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/ref_legpress45_detail.jpg',
  './img/ref_meu_treino.jpg',
  './img/ref_treino_hoje.jpg',
  './img/ref_perfil.jpg',
  './img/ref_10_telas.jpg',
  './img/ref_overview_completo.jpg',
  './img/ref_16_maquinas.jpg',
  './img/ref_painel_maquinas.jpg',
  // R18: equipment images and licensed photos, so the library works offline
  './img/equip/ab_crunch.jpg',
  './img/equip/air_bike.jpg',
  './img/equip/back_ext.jpg',
  './img/equip/bike.jpg',
  './img/equip/bike_recumbent.jpg',
  './img/equip/bike_spinning.jpg',
  './img/equip/calfseated.jpg',
  './img/equip/calf_standing.jpg',
  './img/equip/chestpress.jpg',
  './img/equip/crossover.jpg',
  './img/equip/dumbbells_bench.jpg',
  './img/equip/dumbbell_rack.jpg',
  './img/equip/elliptical.jpg',
  './img/equip/ghd_bench.jpg',
  './img/equip/glute_bridge_machine.jpg',
  './img/equip/graviton.jpg',
  './img/equip/hack.jpg',
  './img/equip/hip_thrust.jpg',
  './img/equip/inclinepress.jpg',
  './img/equip/lateral_raise.jpg',
  './img/equip/latpulldown.jpg',
  './img/equip/legcurl.jpg',
  './img/equip/legcurllying.jpg',
  './img/equip/legextension.jpg',
  './img/equip/leghorizontal.jpg',
  './img/equip/legpress45.jpg',
  './img/equip/legpress_vertical.jpg',
  './img/equip/lunge_machine.jpg',
  './img/equip/multi_hip.jpg',
  './img/equip/pecdeck.jpg',
  './img/equip/pendulum_squat.jpg',
  './img/equip/power_rack.jpg',
  './img/equip/power_tower.jpg',
  './img/equip/preacher_bench.jpg',
  './img/equip/preacher_curl_machine.jpg',
  './img/equip/pulldown_lever.jpg',
  './img/equip/rotary_torso.jpg',
  './img/equip/rowcable.jpg',
  './img/equip/rower.jpg',
  './img/equip/row_artic.jpg',
  './img/equip/shoulderpress.jpg',
  './img/equip/smith.jpg',
  './img/equip/squat_machine.jpg',
  './img/equip/stairs.jpg',
  './img/equip/standing_abductor.jpg',
  './img/equip/tbar_row.jpg',
  './img/equip/treadmill.jpg',
  './img/equip/triceps_dip.jpg',
  './img/real/abductor_0.jpg',
  './img/real/ab_crunch_0.jpg',
  './img/real/bw_inverted_row_0.jpg',
  './img/real/bw_jumping_jack_0.jpg',
  './img/real/bw_lunge_0.jpg',
  './img/real/bw_plank_0.jpg',
  './img/real/bw_pullup_0.jpg',
  './img/real/bw_squat_0.jpg',
  './img/real/bw_walk_0.jpg',
  './img/real/calfseated_0.jpg',
  './img/real/calfseated_1.jpg',
  './img/real/calf_standing_0.jpg',
  './img/real/calf_standing_1.jpg',
  './img/real/chestpress_0.jpg',
  './img/real/crossover_0.jpg',
  './img/real/dumbbells_bench_0.jpg',
  './img/real/dumbbells_bench_1.jpg',
  './img/real/elliptical_0.jpg',
  './img/real/fw_bb_bench_0.jpg',
  './img/real/fw_db_curl_0.jpg',
  './img/real/fw_db_lateral_0.jpg',
  './img/real/fw_db_lateral_1.jpg',
  './img/real/fw_db_press_0.jpg',
  './img/real/fw_db_rdl_0.jpg',
  './img/real/hack_0.jpg',
  './img/real/hack_1.jpg',
  './img/real/inclinepress_0.jpg',
  './img/real/latpulldown_0.jpg',
  './img/real/legcurllying_0.jpg',
  './img/real/legcurllying_1.jpg',
  './img/real/legextension_0.jpg',
  './img/real/legextension_1.jpg',
  './img/real/legpress45_0.jpg',
  './img/real/pecdeck_0.jpg',
  './img/real/power_rack_0.jpg',
  './img/real/rowcable_0.jpg',
  './img/real/row_artic_0.jpg',
  './img/real/shoulderpress_0.jpg',
  './img/real/treadmill_0.jpg',
  './img/real/triceps_dip_0.jpg',
  './img/real/triceps_pulley_0.jpg',
  './img/real/triceps_pulley_1.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const isNav = event.request.mode === 'navigate' || (event.request.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    event.respondWith(
      fetch(event.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone)).catch(() => {});
        return resp;
      }).catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      if (resp && resp.ok && new URL(event.request.url).origin === self.location.origin) { const copy = resp.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(() => {}); }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
