import { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '../../context/authContext';

/* Traduce la respuesta del API a la forma que ya esperaban las tarjetas.
   Se hace aqui y no en cada tarjeta para que, si el backend cambia un nombre,
   solo haya que tocar este archivo. */
const traducir = (d) => {
  const retencion = d.retencion || {};
  // Renovaron sobre los que YA decidieron. Los que todavia no vencen no
  // cuentan: incluirlos hundiria el porcentaje a principio de mes sin que
  // nadie se haya dado de baja.
  const decidieron = (retencion.renovaron || 0) + (retencion.baja || 0);

  return {
    mrr: {
      value: Number(d.mrr ?? 0),
      changePercent: d.mrrVariacion ?? null,
    },
    activeClients: {
      value: d.clientesActivos ?? 0,
      newThisMonth: d.nuevosDelMes ?? 0,
    },
    renewalsDue: { value: d.porVencerEn7Dias ?? 0 },
    averageTicket: { value: Number(d.ticketPromedio ?? 0) },
    pendingDeliveries: { value: d.entregasPendientes ?? 0 },
    retention: {
      percent: decidieron ? Math.round((retencion.renovaron / decidieron) * 100) : null,
      renewed: retencion.renovaron ?? 0,
      churned: retencion.baja ?? 0,
      pending: retencion.porVencer ?? 0,
    },
    porPlan: Object.entries(d.porPlan || {}).map(([label, value]) => ({ label, value })),
    porDistrito: Object.entries(d.porDistrito || {})
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    porObjetivo: Object.entries(d.porObjetivo || {}).map(([label, value]) => ({
      label: { LOSE: 'Bajar de peso', IMPROVE: 'Mejorar salud', GAIN: 'Subir de peso' }[label] || label,
      value,
    })),
  };
};

/**
 * Las metricas del negocio, del endpoint del backend.
 *
 * Sustituye a DASHBOARD_MOCK. Mientras no responda, las tarjetas no pintan
 * nada: es preferible un panel vacio a uno con cifras inventadas, porque
 * sobre estos numeros se toman decisiones de plata.
 */
export default function useMetricasNegocio() {
  const { token, baseUrl } = useAuthContext();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;

    axios.get(`${baseUrl}admin/analytics/business-metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      // El API envuelve todo en {code, message, data}: lo de verdad esta un
      // nivel adentro.
      .then((r) => { if (vivo) setDatos(traducir(r.data?.data ?? r.data)); })
      .catch((e) => {
        if (!vivo) return;
        const estado = e?.response?.status;
        setError(
          estado === 401 || estado === 403
            ? 'Tu sesión no tiene permiso para ver estas métricas.'
            : !e?.response
              ? 'No pudimos conectarnos con el servidor.'
              : 'El servidor no pudo calcular las métricas. Revisa que las tablas de analítica existan.'
        );
      })
      .finally(() => { if (vivo) setCargando(false); });

    return () => { vivo = false; };
  }, [token, baseUrl]);

  return { datos, cargando, error };
}
