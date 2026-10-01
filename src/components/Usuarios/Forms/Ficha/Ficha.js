// Ficha del cliente, ordenada para dar soporte rapido por WhatsApp.
//
// El orden es el de las preguntas que llegan: "¿que me llega esta semana?",
// "¿cuantos envios me quedan?", "¿a donde me lo mandan?". Lo que se consulta
// menos —preferencias, historial viejo, contraseña— va debajo y plegado.

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';

import axios from 'axios';
import { useAuthContext } from '../../../../context/authContext';

/* "2026-09-21" con new Date() se lee como medianoche UTC, que en Lima es
   todavia el 20: todas las fechas salian con un dia menos. */
const aFecha = (valor) => {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(valor);
  return Number.isNaN(d.valueOf()) ? null : d;
};
const fecha = (valor) => {
  const d = aFecha(valor);
  return d ? d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Lunes a viernes de la semana que importa: en sabado y domingo, la que viene. */
const diasDeLaSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay(); // 0 domingo
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (dia === 6) lunes.setDate(lunes.getDate() + 2);
  else if (dia === 0) lunes.setDate(lunes.getDate() + 1);
  else lunes.setDate(lunes.getDate() - (dia - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
};

const Dato = ({ label, children }) => (
  <Box>
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{children || '—'}</Typography>
  </Box>
);

const Titulo = ({ children, extra }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="caption" sx={{
      fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary',
    }}>
      {children}
    </Typography>
    {extra}
  </Box>
);

/** Bloque plegable: lo que se consulta poco no empuja hacia abajo lo urgente. */
const Plegable = ({ titulo, resumen, children, abierto: inicial = false }) => {
  const [abierto, setAbierto] = useState(inicial);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
      <Box component="button" type="button" onClick={() => setAbierto(!abierto)}
        sx={{
          all: 'unset', boxSizing: 'border-box', width: '100%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5,
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
        }}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>{titulo}</Typography>
        {resumen && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{resumen}</Typography>}
        <Typography sx={{ color: 'text.secondary', fontSize: 18, lineHeight: 1 }}>{abierto ? '−' : '+'}</Typography>
      </Box>
      {abierto && <Box sx={{ px: 2, pb: 2 }}>{children}</Box>}
    </Box>
  );
};

/* El estado en color: lo unico que se busca de un vistazo es si algo fallo. */
const COLOR_ESTADO = {
  'Entregado': { color: 'success.dark', bgcolor: 'success.lighter' },
  'En ruta': { color: 'info.dark', bgcolor: 'info.lighter' },
  'Programado': { color: 'primary.dark', bgcolor: 'primary.lighter' },
  'No entregado': { color: 'error.dark', bgcolor: 'error.lighter' },
  'Cancelado': { color: 'grey.700', bgcolor: 'grey.200' },
  'Sin envío': { color: 'warning.dark', bgcolor: 'warning.lighter' },
  'Sin pedido': { color: 'grey.600', bgcolor: 'grey.100' },
};

const NOMBRE_TIPO = { lunch: 'Almuerzo', dinner: 'Cena', breakfast: 'Desayuno', drinks: 'Bebida', snacks: 'Snack' };
/* Primero lo que se reclama. Una bebida equivocada no genera un reclamo;
   un almuerzo equivocado, si. */
const ORDEN_TIPO = ['lunch', 'dinner', 'breakfast', 'snacks', 'drinks'];

const Platos = ({ platos, soloPrincipales }) => {
  const lista = [...(platos || [])]
    .filter((p) => !soloPrincipales || ['lunch', 'dinner', 'breakfast'].includes(p.tipo))
    .sort((a, b) => ORDEN_TIPO.indexOf(a.tipo) - ORDEN_TIPO.indexOf(b.tipo));
  return lista.map((plato, i) => (
    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
      {/* El numero de opcion es lo que se compara contra el rotulado y la comanda. */}
      <Typography variant="caption" sx={{
        minWidth: 44, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: plato.opcion ? 'primary.dark' : 'text.disabled',
      }}>
        {plato.opcion ? `OP ${plato.opcion}` : '—'}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        <b style={{ fontWeight: 600 }}>{NOMBRE_TIPO[plato.tipo] || plato.tipo}:</b> {plato.nombre}
      </Typography>
    </Box>
  ));
};

const UsuarioFicha = ({ data, onAccion, getUsuarios }) => {

  const { token, baseUrl } = useAuthContext();
  const cabecera = { headers: { Authorization: `Bearer ${token}` } };

  /* Las preferencias viajan dentro del JSON del perfil. Si viniera roto, se
     parte de vacio en vez de tumbar la ficha entera. */
  const info = (() => {
    try { return data?.information ? JSON.parse(data.information) : {}; }
    catch { return {}; }
  })();

  const [restricciones, setRestricciones] = useState(info.alimentsRestrictions || '');
  /* Los clientes cargados con la hoja tienen 0/1 en vez de false/true: sin
     esto la ficha les mostraba "acepta azucar" a quienes pidieron sin azucar. */
  const [azucar, setAzucar] = useState(![false, 0, '0', 'false'].includes(info.sugar));
  const [dobleProteina, setDobleProteina] = useState([true, 1, '1', 'true'].includes(info.doubleProtein));
  const [guardandoPref, setGuardandoPref] = useState(false);

  const [clave, setClave] = useState('');
  const [pedirCambio, setPedirCambio] = useState(true);
  const [guardandoClave, setGuardandoClave] = useState(false);

  const [fechaRegistro, setFechaRegistro] = useState(data?.fecreg || '');
  const [editandoRegistro, setEditandoRegistro] = useState(false);

  const [aviso, setAviso] = useState('');

  /* Las direcciones del cliente, para poder corregirlas desde aquí. Por bien
     hecha que esté la pantalla del cliente, siempre hay quien deja el pin
     donde no es: hay clientes con su punto en zonas sin reparto, y hasta
     ahora eso solo se arreglaba pidiéndoles que lo movieran ellos. */
  const [direcciones, setDirecciones] = useState(null);
  const [editandoDir, setEditandoDir] = useState(null);
  const [guardandoDir, setGuardandoDir] = useState(false);
  const [error, setError] = useState('');

  const [historial, setHistorial] = useState(null);
  const [sinEnvio, setSinEnvio] = useState([]);

  const usados = Number(data?.consumedCount);
  const total = Number(data?.consumedTotal);
  const validos = Number.isFinite(usados) && Number.isFinite(total) && total > 0;
  const quedan = validos ? Math.max(total - usados, 0) : null;

  useEffect(() => {
    if (!data?.id) return;
    axios.get(`${baseUrl}admin/users/${data.id}/orders`, cabecera)
      .then((r) => setHistorial(Array.isArray(r.data?.data) ? r.data.data : (r.data || [])))
      .catch(() => setHistorial([]));
    axios.get(`${baseUrl}admin/users/${data.id}/direcciones`, cabecera)
      .then((r) => setDirecciones(r.data?.data ?? r.data ?? []))
      .catch(() => setDirecciones([]));

    axios.get(`${baseUrl}admin/users/${data.id}/sin-envio`, cabecera)
      .then((r) => setSinEnvio(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
      .catch(() => setSinEnvio([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const dias = diasDeLaSemana();
  const clavesSemana = new Set(dias.map(iso));
  const porFecha = {};
  (historial || []).forEach((p) => { porFecha[String(p.fecha).slice(0, 10)] = p; });
  const anteriores = (historial || []).filter((p) => !clavesSemana.has(String(p.fecha).slice(0, 10)));
  const pedidosSemana = dias.filter((d) => porFecha[iso(d)]).length;

  const guardarPreferencias = () => {
    setGuardandoPref(true); setAviso(''); setError('');
    axios.put(`${baseUrl}admin/users/${data.id}/preferences`,
      { alimentsRestrictions: restricciones, sugar: azucar, doubleProtein: dobleProteina },
      cabecera)
      .then(() => { setAviso('Preferencias guardadas.'); if (getUsuarios) getUsuarios(); })
      .catch((e) => setError(e?.response?.data?.message || 'No pudimos guardar las preferencias.'))
      .finally(() => setGuardandoPref(false));
  };

  const guardarClave = () => {
    if (clave.trim().length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setGuardandoClave(true); setAviso(''); setError('');
    axios.put(`${baseUrl}admin/users/${data.id}/password`,
      { password: clave.trim(), pedirCambio },
      cabecera)
      .then(() => {
        setAviso(`Listo. Dile al cliente que entre con: ${clave.trim()}`);
        setClave('');
      })
      .catch((e) => setError(e?.response?.data?.message || 'No pudimos cambiar la contraseña.'))
      .finally(() => setGuardandoClave(false));
  };

  const guardarRegistro = () => {
    if (!fechaRegistro) return;
    setAviso(''); setError('');
    axios.patch(`${baseUrl}admin/users/${data.id}/register-date`, { fecha: fechaRegistro }, cabecera)
      .then(() => { setAviso('Fecha de registro actualizada.'); setEditandoRegistro(false); if (getUsuarios) getUsuarios(); })
      .catch(() => setError('No pudimos cambiar la fecha de registro.'));
  };

  const telefono = String(data?.phone || '').replace(/\D/g, '');

  const guardarDireccion = () => {
    setGuardandoDir(true);
    setAviso('');
    axios.put(`${baseUrl}admin/users/${data.id}/direcciones/${editandoDir.id}`, {
      direccion: editandoDir.direccion,
      referencia: editandoDir.referencia,
      distrito: editandoDir.distrito,
      lat: editandoDir.lat === '' ? null : Number(editandoDir.lat),
      lng: editandoDir.lng === '' ? null : Number(editandoDir.lng),
    }, cabecera)
      .then(() => {
        setAviso('Dirección corregida. Los pedidos ya programados salen con el punto nuevo.');
        setEditandoDir(null);
        return axios.get(`${baseUrl}admin/users/${data.id}/direcciones`, cabecera)
          .then((r) => setDirecciones(r.data?.data ?? r.data ?? []));
      })
      .catch(() => setAviso('No pudimos guardar la dirección.'))
      .finally(() => setGuardandoDir(false));
  };

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>

      {/* Quien es y como contactarlo */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {`${data?.name || ''} ${data?.lastName || ''}`.trim() || 'Cliente'}
          </Typography>
          {data?.state && <Chip size="small" label={data.state}
            color={data.state === 'Activo' ? 'success' : 'default'} variant="outlined" />}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {telefono
            ? <a href={`https://wa.me/${telefono}`} target="_blank" rel="noreferrer">+{telefono}</a>
            : 'sin teléfono'}
          {' · '}{data?.mail || 'sin correo'}
          {data?.dni ? ` · DNI ${data.dni}` : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
          {!editandoRegistro ? (
            <>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Registrado el {fecha(data?.fecreg)}
              </Typography>
              <Button size="small" sx={{ minWidth: 0, p: 0, fontSize: 12 }}
                onClick={() => { setFechaRegistro(String(data?.fecreg || '').slice(0, 10)); setEditandoRegistro(true); }}>
                Cambiar
              </Button>
            </>
          ) : (
            <>
              <TextField type="date" size="small" value={fechaRegistro}
                onChange={(e) => setFechaRegistro(e.target.value)} />
              <Button size="small" variant="contained" onClick={guardarRegistro}>Guardar</Button>
              <Button size="small" onClick={() => setEditandoRegistro(false)}>Cancelar</Button>
            </>
          )}
        </Box>
      </Box>

      {/* Lo que se hace con el cliente, a mano y arriba */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip label="Renovar plan" color="primary" onClick={() => onAccion('renovar')} sx={{ cursor: 'pointer' }} />
        <Chip label="Corregir envíos o vencimiento" onClick={() => onAccion(2)} sx={{ cursor: 'pointer' }} />
        <Chip label="Cambiar de plan" onClick={() => onAccion(3)} sx={{ cursor: 'pointer' }} />
        <Chip label="Editar sus datos" onClick={() => onAccion(1)} sx={{ cursor: 'pointer' }} />
      </Box>

      {aviso && <Alert severity="success">{aviso}</Alert>}
      {error && <Alert severity="warning">{error}</Alert>}

      {/* Su plan: LA pregunta del cliente que escribe es cuantos le quedan */}
      <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'grey.100' }}>
        {validos && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{quedan}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                de {total} envíos disponibles · {usados} ya pedidos
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={Math.min((usados / total) * 100, 100)}
              sx={{ height: 7, borderRadius: 999, mb: 1.5 }} />
          </>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Dato label="Plan">{data?.plan || 'Sin plan'}</Dato>
          <Dato label="Inició">{fecha(data?.inicia)}</Dato>
          <Dato label="Vence">{fecha(data?.expira)}</Dato>
          <Dato label="Pagó">{data?.metpago && data.metpago !== '--' ? data.metpago : 'sin registro'}</Dato>
        </Box>
      </Box>

      {/* Esta semana, dia por dia: lo primero que se mira ante un reclamo */}
      <Box>
        <Titulo extra={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{pedidosSemana} de 5 días con pedido</Typography>}>
          Esta semana
        </Titulo>
        {historial === null
          ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Cargando…</Typography>
          : (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              {dias.map((d) => {
                const clave = iso(d);
                const pedido = porFecha[clave];
                const estado = pedido ? pedido.estado : (sinEnvio.includes(clave) ? 'Sin envío' : 'Sin pedido');
                const esHoy = clave === iso(new Date());
                return (
                  <Box key={clave} sx={{
                    display: 'grid', gridTemplateColumns: '72px 1fr', gap: 1.5, px: 1.5, py: 1.25,
                    borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 },
                    bgcolor: esHoy ? 'primary.lighter' : 'transparent',
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                        {d.toLocaleDateString('es-PE', { weekday: 'short' })} {d.getDate()}
                      </Typography>
                      {esHoy && <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700 }}>Hoy</Typography>}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: pedido ? 0.5 : 0 }}>
                        <Chip size="small" label={estado}
                          sx={{ height: 20, fontSize: 11, ...(COLOR_ESTADO[estado] || {}) }} />
                        {pedido?.motorizado && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{pedido.motorizado}</Typography>
                        )}
                        {estado === 'Sin envío' && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>El cliente pidió no recibir</Typography>
                        )}
                      </Box>
                      {pedido && <Platos platos={pedido.platos} soloPrincipales />}
                      {pedido?.direccion && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.25 }}>
                          {pedido.direccion}
                        </Typography>
                      )}
                      {pedido?.nota && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'error.dark' }}>
                          Motivo: {pedido.nota}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
      </Box>

      <Box>
        <Titulo>Dónde se le entrega</Titulo>
        <Typography variant="body2">{data?.dirreg || 'Todavía no registró una dirección.'}</Typography>
      </Box>

      <Plegable titulo="Semanas anteriores"
        resumen={historial ? `${anteriores.length} pedidos` : ''}>
        {anteriores.length === 0
          ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No tiene pedidos en las últimas seis semanas.</Typography>
          : (
            <Box sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
              {anteriores.map((pedido) => (
                <Box key={pedido.orderId} sx={{
                  py: 1.25, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{fecha(pedido.fecha)}</Typography>
                    <Chip size="small" label={pedido.estado}
                      sx={{ height: 20, fontSize: 11, ...(COLOR_ESTADO[pedido.estado] || {}) }} />
                    {pedido.motorizado && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{pedido.motorizado}</Typography>
                    )}
                  </Box>
                  <Platos platos={pedido.platos} />
                  {pedido.nota && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'error.dark' }}>
                      Motivo: {pedido.nota}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
      </Plegable>

      <Plegable titulo="Lo que cocina tiene que respetar"
        resumen={[restricciones ? 'con restricciones' : null, !azucar ? 'sin azúcar' : null, dobleProteina ? 'doble proteína' : null].filter(Boolean).join(' · ') || 'nada especial'}>
        <TextField fullWidth multiline minRows={2} variant="filled"
          label="Restricciones (sale tal cual en la comanda)"
          placeholder="Sin lactosa, sin cerdo…"
          value={restricciones} onChange={(e) => setRestricciones(e.target.value)} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <FormControlLabel
            control={<Switch checked={!azucar} onChange={(e) => setAzucar(!e.target.checked)} />}
            label="Sin azúcar (sale en el rotulado)" />
          <FormControlLabel
            control={<Switch checked={dobleProteina} onChange={(e) => setDobleProteina(e.target.checked)} />}
            label="Doble proteína" />
        </Box>
        <button type="button" className={guardandoPref ? 'btnPrimary btnDisabled' : 'btnPrimary'}
          disabled={guardandoPref} onClick={guardarPreferencias}>
          {guardandoPref ? 'Guardando…' : 'Guardar preferencias'}
        </button>
      </Plegable>

      <Plegable
        titulo="Dónde le entregamos"
        resumen={direcciones === null ? 'cargando…' : `${direcciones.length} dirección${direcciones.length === 1 ? '' : 'es'}`}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Si el cliente dejó el pin donde no es, corrígelo aquí. El cambio afecta
          también a los pedidos que ya tiene programados: la ruta sale de esta
          dirección, no de una copia.
        </Typography>

        {(direcciones || []).map((d) => (
          <Box key={d.id} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1.5 }}>
            {editandoDir?.id === d.id ? (
              <Box sx={{ display: 'grid', gap: 1 }}>
                <input className="fiInput" placeholder="Dirección"
                  value={editandoDir.direccion || ''}
                  onChange={(e) => setEditandoDir({ ...editandoDir, direccion: e.target.value })} />
                <input className="fiInput" placeholder="Referencia para el motorizado"
                  value={editandoDir.referencia || ''}
                  onChange={(e) => setEditandoDir({ ...editandoDir, referencia: e.target.value })} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <input className="fiInput" placeholder="Distrito" style={{ flex: '1 1 140px' }}
                    value={editandoDir.distrito || ''}
                    onChange={(e) => setEditandoDir({ ...editandoDir, distrito: e.target.value })} />
                  <input className="fiInput" placeholder="Latitud" style={{ flex: '1 1 110px' }}
                    value={editandoDir.lat ?? ''}
                    onChange={(e) => setEditandoDir({ ...editandoDir, lat: e.target.value })} />
                  <input className="fiInput" placeholder="Longitud" style={{ flex: '1 1 110px' }}
                    value={editandoDir.lng ?? ''}
                    onChange={(e) => setEditandoDir({ ...editandoDir, lng: e.target.value })} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Para sacar las coordenadas: en Google Maps, clic derecho sobre el
                  punto exacto y copia los dos números que aparecen arriba.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" disabled={guardandoDir}
                    onClick={guardarDireccion}>
                    {guardandoDir ? 'Guardando…' : 'Guardar'}
                  </Button>
                  <Button size="small" onClick={() => setEditandoDir(null)}>Cancelar</Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {d.nombre || d.direccion || 'Sin dirección'}
                    {Number(d.principal) === 1 && (
                      <Chip size="small" label="principal" sx={{ ml: 1 }} variant="outlined" />
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {d.direccion}{d.distrito ? ` · ${d.distrito}` : ''}
                    {d.referencia ? ` · ${d.referencia}` : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {d.motorizado ? `Lo lleva ${d.motorizado}` : 'Sin motorizado asignado'}
                  </Typography>
                </Box>
                {d.lat && d.lng && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`}
                     target="_blank" rel="noreferrer" style={{ fontSize: 12.5 }}>
                    Ver en Maps
                  </a>
                )}
                <Button size="small" onClick={() => setEditandoDir({ ...d })}>Corregir</Button>
              </Box>
            )}
          </Box>
        ))}

        {direcciones !== null && direcciones.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Este cliente no tiene ninguna dirección guardada.
          </Typography>
        )}
      </Plegable>

      <Plegable titulo="Contraseña" resumen="poner una nueva">
        {/* Lo guardado es un hash, no la clave: no hay nada que mostrar. */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          La contraseña del cliente no se puede ver: se guarda cifrada. Lo que sí
          puedes es ponerle una nueva y dictársela.
        </Typography>
        <TextField fullWidth variant="filled" label="Contraseña nueva"
          value={clave} onChange={(e) => setClave(e.target.value)}
          helperText="Mínimo 8 caracteres, con una letra y un número." />
        <FormControlLabel
          control={<Checkbox checked={pedirCambio} onChange={(e) => setPedirCambio(e.target.checked)} />}
          label="Pedirle que elija una suya al entrar" />
        <button type="button" className={guardandoClave ? 'btnPrimary btnDisabled' : 'btnPrimary'}
          disabled={guardandoClave} onClick={guardarClave}>
          {guardandoClave ? 'Guardando…' : 'Poner contraseña nueva'}
        </button>
      </Plegable>

    </Box>
  );
};

export default UsuarioFicha;
