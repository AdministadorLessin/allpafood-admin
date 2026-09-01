// DATOS SIMULADOS del panel de control.
//
// El backend todavia no expone un endpoint de metricas de administracion:
// los /dashboard/* que existen son de rol USER y devuelven las metricas del
// propio usuario, no del negocio.
//
// Todo lo que el panel necesita esta aqui y solo aqui. Cuando exista el
// endpoint, se reemplaza la fuente de este objeto y las tarjetas no cambian.
//
// Estructura sugerida para pedirle al backend:
//   GET /admin/dashboard/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD  ->  este objeto.

export const DASHBOARD_MOCK = {
  mrr: {
    value: 48650,
    changePercent: 12.4,
  },
  activeClients: {
    value: 342,
    newThisMonth: 18,
  },
  renewalsDue: {
    value: 27,
  },
  averageTicket: {
    value: 142,
  },
  pendingDeliveries: {
    value: 34,
  },
  revenueTrend: {
    months: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    renewals: [28400, 30100, 32800, 35900, 39200, 42600],
    newClients: [4200, 4600, 5100, 5400, 5800, 6050],
  },
  retention: {
    percent: 85,
    renewed: 268,
    churned: 14,
    pending: 60,
  },
  planDistribution: [
    { label: 'Nutrivital', value: 178 },
    { label: 'Nutrivital Plus', value: 96 },
    { label: 'Fitfuel', value: 68 },
  ],
  paymentMethods: [
    { label: 'Yape / Plin', value: 62 },
    { label: 'Transferencia', value: 28 },
    { label: 'Efectivo', value: 10 },
  ],
  // Miniaturas de tendencia de cada tarjeta KPI.
  sparklines: {
    mrr: [32600, 34100, 36800, 40200, 44100, 48650],
    activeClients: [286, 297, 309, 318, 331, 342],
    renewalsDue: [12, 15, 19, 22, 24, 27],
    averageTicket: [131, 134, 136, 139, 140, 142],
  },
};

export default DASHBOARD_MOCK;
