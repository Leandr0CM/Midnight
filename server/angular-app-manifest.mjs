
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Midnight/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/Midnight/login",
    "route": "/Midnight"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/login"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/projetos"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/financeiro"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/membros"
  },
  {
    "renderMode": 2,
    "route": "/Midnight/perfil"
  },
  {
    "renderMode": 2,
    "redirectTo": "/Midnight/login",
    "route": "/Midnight/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1101, hash: 'b577a7cdbf77cfb735b5381214bea56edf118d7d3b5fd522d8c7d3414f4dd0e7', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1133, hash: 'd376ed24fde541926631cfec82108767642715f30db44c9cfd654578c30a311e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 6556, hash: 'daf984e81cfd2fa2644f8d41c043ddfa25aa7509bcaf107a3f0355d5c914bce8', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'membros/index.html': {size: 24950, hash: '3ef42bcc245183fb0c2c77a7fe38c9abbf7618f5cc577a313f26ec5b728c52d8', text: () => import('./assets-chunks/membros_index_html.mjs').then(m => m.default)},
    'projetos/index.html': {size: 29149, hash: 'ecca56d85d1e14fe05a35d0f9f3811e749e8a75ec605f969f2f8adc8736b8abe', text: () => import('./assets-chunks/projetos_index_html.mjs').then(m => m.default)},
    'perfil/index.html': {size: 15275, hash: '44cb512c613a7157b36d8ae8cb2a1121b147a0ed6f94f97e8dd9688e4193ee24', text: () => import('./assets-chunks/perfil_index_html.mjs').then(m => m.default)},
    'financeiro/index.html': {size: 29562, hash: '2899df3bc5e9a5bdc39177f29e76a199a413ffc2daa8a8ea1e4b95d540becd8c', text: () => import('./assets-chunks/financeiro_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 21189, hash: 'b33b498da241d8b61cbd95c1b8aa96fe6abd21c6c93839b11c520fd623c88a9c', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'styles-WYHJPIR7.css': {size: 4600, hash: 'VgqRnlD48gc', text: () => import('./assets-chunks/styles-WYHJPIR7_css.mjs').then(m => m.default)}
  },
};
