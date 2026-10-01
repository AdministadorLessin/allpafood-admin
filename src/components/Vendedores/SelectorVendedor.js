// Quien hizo la venta. El admin se usa con una sola cuenta, asi que el
// vendedor se elige aqui y queda anotado con la venta: de eso sale su comision.

import { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useAuthContext } from '../../context/authContext';

const NUEVO = '__nuevo__';
const RECORDADO = 'af_ultimo_vendedor';

const SelectorVendedor = ({ value, onChange, error }) => {
  const { token, baseUrl } = useAuthContext();
  const cabecera = { headers: { Authorization: `Bearer ${token}` } };

  const [vendedores, setVendedores] = useState([]);
  const [agregando, setAgregando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = (elegirNombre) =>
    axios.get(`${baseUrl}admin/sellers`, cabecera)
      .then((r) => {
        const lista = Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []);
        setVendedores(lista);
        if (elegirNombre) {
          const nuevo = lista.find((v) => v.nombre === elegirNombre.trim());
          if (nuevo) onChange(nuevo.id);
        } else if (!value) {
          // Casi siempre vende la misma persona desde el mismo equipo.
          let ultimo = null;
          try { ultimo = Number(localStorage.getItem(RECORDADO)); } catch { /* sin almacenamiento */ }
          if (ultimo && lista.some((v) => v.id === ultimo)) onChange(ultimo);
        }
      })
      .catch(() => setVendedores([]));

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const elegir = (id) => {
    if (id === NUEVO) { setAgregando(true); return; }
    try { localStorage.setItem(RECORDADO, String(id)); } catch { /* sin almacenamiento */ }
    onChange(id);
  };

  const agregar = () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    axios.post(`${baseUrl}admin/sellers`, { nombre: nombre.trim() }, cabecera)
      .then(() => cargar(nombre).then(() => { setAgregando(false); setNombre(''); }))
      .finally(() => setGuardando(false));
  };

  if (agregando) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField fullWidth variant="filled" label="Nombre del vendedor" autoFocus
          value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Button variant="contained" disabled={guardando || !nombre.trim()} onClick={agregar}>
          {guardando ? '…' : 'Agregar'}
        </Button>
        <Button onClick={() => { setAgregando(false); setNombre(''); }}>Cancelar</Button>
      </Box>
    );
  }

  return (
    <TextField
      select fullWidth variant="filled"
      label="Vendedor (quién hizo la venta)"
      value={value || ''}
      error={!!error}
      helperText={error || 'Se usa para calcular su comisión.'}
      onChange={(e) => elegir(e.target.value)}
    >
      {vendedores.map((v) => <MenuItem key={v.id} value={v.id}>{v.nombre}</MenuItem>)}
      <MenuItem value={NUEVO}><b>+ Agregar vendedor</b></MenuItem>
    </TextField>
  );
};

export default SelectorVendedor;
