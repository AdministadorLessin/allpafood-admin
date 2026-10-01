// Ventas por vendedor. Es la hoja de donde sale la comision: cada venta
// cargada desde el admin queda con el vendedor que se eligio al subirla.

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import './Ventas.scss';

const dosDigitos = (n) => String(n).padStart(2, '0');
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`; };
const inicioDeMesISO = () => { const d = new Date(); return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-01`; };
const soles = (n) => `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fechaCorta = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(String(v || ''));
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : '—';
};

const PageVentas = () => {
  const { token, baseUrl } = useAuthContext();
  const cabecera = { headers: { Authorization: `Bearer ${token}` } };

  const [desde, setDesde] = useState(inicioDeMesISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [ventas, setVentas] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [error, setError] = useState('');

  const cargar = () => {
    setError('');
    axios.get(`${baseUrl}admin/sales?desde=${desde}&hasta=${hasta}`, cabecera)
      .then((r) => setVentas(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
      .catch(() => { setVentas([]); setError('No pudimos cargar las ventas.'); });
    axios.get(`${baseUrl}admin/sellers?todos=true`, cabecera)
      .then((r) => setVendedores(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
      .catch(() => setVendedores([]));
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [desde, hasta]);

  const resumen = useMemo(() => {
    const porVendedor = {};
    (ventas || []).forEach((v) => {
      const k = v.vendedor;
      porVendedor[k] = porVendedor[k] || { vendedor: k, ventas: 0, nuevos: 0, renovaciones: 0, monto: 0 };
      porVendedor[k].ventas += 1;
      porVendedor[k].monto += Number(v.monto || 0);
      if (v.tipo === 'NUEVO') porVendedor[k].nuevos += 1; else porVendedor[k].renovaciones += 1;
    });
    return Object.values(porVendedor).sort((a, b) => b.monto - a.monto);
  }, [ventas]);

  const visibles = (ventas || []).filter((v) => filtro === 'todos' || v.vendedor === filtro);

  const reasignar = (venta, vendedorId) => {
    axios.patch(`${baseUrl}admin/sales/${venta.id}`, { vendedorId }, cabecera)
      .then(cargar)
      .catch(() => setError('No pudimos cambiar el vendedor de esa venta.'));
  };

  const descargar = () => {
    const filas = visibles.map((v) => ({
      Fecha: fechaCorta(v.fecha),
      Cliente: v.cliente,
      Teléfono: v.telefono,
      Plan: v.plan,
      Tipo: v.tipo === 'NUEVO' ? 'Nuevo' : 'Renovación',
      'Cómo pagó': v.metodoPago || '',
      Monto: Number(v.monto || 0),
      Vendedor: v.vendedor,
    }));
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'Ventas');
    XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(resumen.map((r) => ({
      Vendedor: r.vendedor, Ventas: r.ventas, Nuevos: r.nuevos, Renovaciones: r.renovaciones, Monto: r.monto,
    }))), 'Por vendedor');
    XLSX.writeFile(libro, `ventas-${desde}-al-${hasta}.xlsx`);
  };

  return (
    <LayoutPages>
      <TitlePage title="Ventas por vendedor" />

      <div className="inlineBlock">
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <TextField type="date" size="small" label="Desde" value={desde}
            onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField type="date" size="small" label="Hasta" value={hasta}
            onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="outlined" onClick={descargar} disabled={!visibles.length}>Descargar Excel</Button>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
          Resumen del periodo
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5, mb: 3 }}>
          {resumen.length === 0 && ventas !== null && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No hay ventas cargadas en estas fechas.
            </Typography>
          )}
          {resumen.map((r) => (
            <Box key={r.vendedor} onClick={() => setFiltro(filtro === r.vendedor ? 'todos' : r.vendedor)}
              sx={{
                p: 2, borderRadius: 1.5, cursor: 'pointer',
                bgcolor: filtro === r.vendedor ? 'primary.lighter' : 'grey.100',
                border: '1px solid', borderColor: filtro === r.vendedor ? 'primary.main' : 'transparent',
              }}>
              <Typography variant="subtitle2">{r.vendedor}</Typography>
              <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>{soles(r.monto)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {r.ventas} {r.ventas === 1 ? 'venta' : 'ventas'} · {r.nuevos} nuevos · {r.renovaciones} renovaciones
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
            Detalle
          </Typography>
          {filtro !== 'todos' && <Chip size="small" label={`${filtro} ✕`} onClick={() => setFiltro('todos')} />}
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table className="afTablaVentas">
            <thead>
              <tr>
                <th>Fecha</th><th>Cliente</th><th>Plan</th><th>Tipo</th><th>Pagó con</th>
                <th style={{ textAlign: 'right' }}>Monto</th><th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((v) => (
                <tr key={v.id}>
                  <td>{fechaCorta(v.fecha)}</td>
                  <td>{v.cliente || '—'}<br /><small>{v.telefono}</small></td>
                  <td>{v.plan}</td>
                  <td>{v.tipo === 'NUEVO' ? 'Nuevo' : 'Renovación'}</td>
                  <td>{v.metodoPago || '—'}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{soles(v.monto)}</td>
                  <td>
                    <TextField select size="small" variant="standard" value={v.vendedorId || ''}
                      onChange={(e) => reasignar(v, e.target.value || null)} sx={{ minWidth: 140 }}>
                      <MenuItem value=""><em>Sin vendedor</em></MenuItem>
                      {vendedores.map((s) => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                    </TextField>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </div>
    </LayoutPages>
  );
};

export default PageVentas;
