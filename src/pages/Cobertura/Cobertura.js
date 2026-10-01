import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';

/* El componente se importa con otro nombre a proposito: se llama Map, igual
   que el Map de JavaScript, y al importarlo tal cual tapaba al del lenguaje.
   El `new Map()` de mas abajo intentaba construir un componente de React y la
   pantalla se quedaba en blanco sin decir nada. */
import { APIProvider, Map as MapaGoogle, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import './Cobertura.scss';
import { MAPS_KEY, MAPS_ID } from '../../config';

const LIMA = { lat: -12.075, lng: -77.03 };

/* Un color por moto. Son ocho rutas y tienen que distinguirse de un vistazo
   sobre un mapa gris: se eligieron separados en tono, no una escala. */
const COLORES = [
  '#E8453C', '#1A73E8', '#0F9D58', '#F9AB00', '#9334E6',
  '#00ACC1', '#EA80FC', '#795548', '#546E7A',
];

/**
 * El mapa de cobertura.
 *
 * El tablero de rutas dice a quien lleva cada moto, pero en columnas de texto.
 * Ahi no se ve que una ruta cruza la ciudad de punta a punta, ni donde hay un
 * cliente solo a veinte cuadras del resto. Eso solo se ve en un mapa.
 *
 * Dos vistas:
 *   Del dia    lo que se reparte esa fecha, cada punto del color de su moto.
 *              Es la vista del coordinador.
 *   Cobertura  todas las direcciones activas, sin importar si hoy les toca.
 *              Es donde esta concentrado el negocio y a donde no llega.
 */
/**
 * Pinta los poligonos de las zonas sobre el mapa.
 *
 * Va aparte porque necesita el mapa ya creado: la libreria de React no trae
 * componente de poligono, asi que se dibujan con la API de Google directamente
 * y se limpian al desmontar para que no queden encima al cambiar de vista.
 */
const Zonas = ({ zonas, visible, motoActiva }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google) return;
    const dibujadas = (visible ? zonas : [])
      .filter((z) => !motoActiva || z.motorizadoId === motoActiva)
      .filter((z) => Array.isArray(z.vertices) && z.vertices.length >= 3)
      .map((z) => new window.google.maps.Polygon({
        paths: z.vertices,
        map,
        strokeColor: z.color || '#1A73E8',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: z.color || '#1A73E8',
        fillOpacity: 0.12,
        clickable: false,
      }));
    return () => dibujadas.forEach((p) => p.setMap(null));
  }, [map, zonas, visible, motoActiva]);

  return null;
};

/** Centra el mapa cuando se elige un cliente desde el buscador. */
const Centrar = ({ centro }) => {
  const map = useMap();
  useEffect(() => {
    if (map && centro) { map.panTo(centro); map.setZoom(16); }
  }, [map, centro]);
  return null;
};

const CoberturaPage = () => {
  const { token, baseUrl } = useAuthContext();

  const [vista, setVista] = useState('dia');
  const [fecha, setFecha] = useState(moment().format('YYYY-MM-DD'));
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [motoActiva, setMotoActiva] = useState(null);
  const [elegido, setElegido] = useState(null);

  /* Zonas de cobertura: un poligono por moto. Sugieren, no deciden. */
  const [zonas, setZonas] = useState([]);
  const [verZonas, setVerZonas] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [avisoZona, setAvisoZona] = useState('');

  /* Importar los polígonos que ya están dibujados en el mapa de Google. Lo
     que generaba el sistema desde los puntos salía como manchas enormes que
     se cruzaban: un cliente suelto al otro lado de la ciudad estira el
     contorno hasta allá. La cobertura la sabe quien arma las rutas. */
  const [enlaceMapa, setEnlaceMapa] = useState('');
  const [importados, setImportados] = useState(null);
  const [importando, setImportando] = useState(false);
  const [asignacion, setAsignacion] = useState({});

  /* El buscador: la pregunta que el vendedor se hace veinte veces al dia. */
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [centro, setCentro] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    const url = vista === 'dia'
      ? `${baseUrl}admin/cobertura?vista=dia&fecha=${fecha}`
      : `${baseUrl}admin/cobertura?vista=todos`;

    axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const lista = r.data?.data ?? r.data ?? [];
        setPuntos(Array.isArray(lista) ? lista : []);
      })
      .catch(() => setError('No pudimos cargar los puntos. Vuelve a intentarlo.'))
      .finally(() => setCargando(false));
  }, [vista, fecha, token, baseUrl]);

  const cargarZonas = () => {
    axios.get(`${baseUrl}admin/zonas`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setZonas(r.data?.data ?? r.data ?? []))
      .catch(() => setZonas([]));
  };

  useEffect(() => { cargarZonas(); }, [token, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Propone una zona por moto a partir de donde reparte de verdad. Dibujar
     ocho poligonos en un mapa en blanco es una tarde; esto parte de los
     puntos reales y despues se ajusta. */
  const generarZonas = (reemplazar) => {
    setGenerando(true);
    setAvisoZona('');
    axios.post(`${baseUrl}admin/zonas/generar?reemplazar=${reemplazar ? 'true' : 'false'}`, {},
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        setAvisoZona(d.creadas
          ? `Se dibujaron ${d.creadas} zonas desde tus puntos actuales.`
          : 'Todas las motos ya tenían zona. Usa "Rehacer" si quieres volver a calcularlas.');
        cargarZonas();
      })
      .catch(() => setAvisoZona('No pudimos generar las zonas.'))
      .finally(() => setGenerando(false));
  };

  /* Empezar de cero. Hizo falta porque las zonas que el sistema calculaba
     solo quedaban guardadas y se seguían pintando encima de las de verdad. */
  const borrarTodas = () => {
    setGenerando(true);
    axios.delete(`${baseUrl}admin/zonas`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const d = r.data?.data ?? r.data ?? {};
        setAvisoZona(`Se borraron ${d.borradas ?? 0} zonas. Importa las tuyas.`);
        cargarZonas();
      })
      .catch(() => setAvisoZona('No pudimos borrar las zonas.'))
      .finally(() => setGenerando(false));
  };

  const importarMapa = () => {
    if (!enlaceMapa.trim()) { setAvisoZona('Pega el enlace de tu mapa de Google.'); return; }
    setImportando(true);
    setAvisoZona('');
    axios.get(`${baseUrl}admin/zonas/importar?mapa=${encodeURIComponent(enlaceMapa.trim())}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const lista = r.data?.data ?? r.data ?? [];
        setImportados(lista);
        setAvisoZona(lista.length
          ? `Encontramos ${lista.length} zonas en tu mapa. Dile cuál es de cada moto.`
          : 'Ese mapa no tiene polígonos dibujados.');
      })
      .catch((e) => setAvisoZona(
        e?.response?.data?.message || 'No pudimos leer tu mapa.'))
      .finally(() => setImportando(false));
  };

  /* Guardar una zona importada con la moto que le corresponde. */
  const asignarZona = (zona, motorizadoId) => {
    if (!motorizadoId) return;
    axios.put(`${baseUrl}admin/zonas/${motorizadoId}`, zona.vertices,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setAsignacion((a) => ({ ...a, [zona.nombre]: motorizadoId }));
        setAvisoZona(`"${zona.nombre}" quedó como zona de esa moto.`);
        cargarZonas();
      })
      .catch(() => setAvisoZona('No pudimos guardar esa zona.'));
  };

  const buscar = (e) => {
    e?.preventDefault?.();
    const q = busqueda.trim();
    if (q.length < 2) { setResultados(null); return; }
    setBuscando(true);
    axios.get(`${baseUrl}admin/cobertura/buscar?q=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setResultados(r.data?.data ?? r.data ?? []))
      .catch(() => setResultados([]))
      .finally(() => setBuscando(false));
  };

  /* Ir a un cliente: centra el mapa en su punto y abre su ficha. */
  const irA = (p) => {
    setCentro({ lat: Number(p.lat), lng: Number(p.lng) });
    setElegido({ ...p, id: p.puntoId });
  };

  /* Las motos que aparecen en el mapa, con su color y su conteo. El color se
     asigna por posicion en esta lista y no al azar: asi el mismo motorizado
     conserva su color mientras no cambie el equipo. */
  const motos = useMemo(() => {
    const mapa = new Map();
    puntos.forEach((p) => {
      const id = p.motorizadoId || 'sin';
      const nombre = (p.motorizado || '').trim() || 'Sin asignar';
      const actual = mapa.get(id) || { id, nombre, n: 0 };
      actual.n += 1;
      mapa.set(id, actual);
    });
    return [...mapa.values()]
      .sort((a, b) => (a.id === 'sin' ? 1 : b.id === 'sin' ? -1 : a.nombre.localeCompare(b.nombre)))
      .map((m, i) => ({ ...m, color: m.id === 'sin' ? '#9AA4A0' : COLORES[i % COLORES.length] }));
  }, [puntos]);

  const colorDe = (p) =>
    motos.find((m) => m.id === (p.motorizadoId || 'sin'))?.color || '#9AA4A0';

  const visibles = motoActiva
    ? puntos.filter((p) => (p.motorizadoId || 'sin') === motoActiva)
    : puntos;

  /* Cuantos puntos por distrito: es la lectura de cobertura que sirve para
     decidir donde vale la pena crecer. */
  const distritos = useMemo(() => {
    const cuenta = {};
    puntos.forEach((p) => {
      const d = (p.distrito || 'Sin distrito').trim();
      cuenta[d] = (cuenta[d] || 0) + 1;
    });
    return Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  }, [puntos]);

  return (
    <LayoutPages>
      <TitlePage title={'Cobertura:'} />

      <div className="cobBarra">
        <div className="cobTabs">
          <button
            className={`cobTab ${vista === 'dia' ? 'cobTab--on' : ''}`}
            onClick={() => { setVista('dia'); setMotoActiva(null); }}
          >
            Del día
          </button>
          <button
            className={`cobTab ${vista === 'todos' ? 'cobTab--on' : ''}`}
            onClick={() => { setVista('todos'); setMotoActiva(null); }}
            title="Todas las direcciones activas, repartan hoy o no"
          >
            Cobertura total
          </button>
        </div>

        {vista === 'dia' && (
          <input
            type="date"
            className="cobFecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        )}

        <form className="cobBuscar" onSubmit={buscar}>
          <input
            type="search"
            placeholder="Buscar cliente por nombre, celular o dirección…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit" disabled={buscando}>
            {buscando ? '…' : 'Buscar'}
          </button>
          {resultados !== null && (
            <button type="button" className="cobBuscar__x"
              onClick={() => { setResultados(null); setBusqueda(''); }}>
              Limpiar
            </button>
          )}
        </form>

        <span className="cobConteo">
          {cargando ? 'Cargando…' : `${puntos.length} puntos · ${motos.length} rutas`}
        </span>
      </div>

      {/* Las zonas sugieren a quién asignar; no deciden. El cupo de cada moto
          cambia todos los días, así que la última palabra es del coordinador. */}
      <div className="cobZonas">
        <label className="cobCheck">
          <input type="checkbox" checked={verZonas} onChange={(e) => setVerZonas(e.target.checked)} />
          Ver zonas ({zonas.length} de {motos.filter((m) => m.id !== 'sin').length} motos)
        </label>
        <input
          className="cobEnlace"
          placeholder="Pega aquí el enlace de tu mapa de Google"
          value={enlaceMapa}
          onChange={(e) => setEnlaceMapa(e.target.value)}
        />
        <button className="cobBtn" disabled={importando} onClick={importarMapa}>
          {importando ? 'Leyendo…' : 'Importar mis zonas'}
        </button>
        {zonas.length > 0 && (
          <button className="cobBtn cobBtn--suave" disabled={generando} onClick={borrarTodas}>
            {generando ? 'Borrando…' : `Borrar las ${zonas.length} zonas`}
          </button>
        )}
        {avisoZona && <span className="cobAviso">{avisoZona}</span>}
      </div>

      {/* Cada polígono del mapa de Google, para decir de quién es. */}
      {importados !== null && importados.length > 0 && (
        <div className="cobImport">
          {importados.map((z) => (
            <div className="cobImport__fila" key={z.nombre}>
              <b>{z.nombre}</b>
              <small>{z.puntos} vértices</small>
              <select
                value={asignacion[z.nombre] || ''}
                onChange={(e) => asignarZona(z, e.target.value)}
              >
                <option value="">¿De qué moto es?</option>
                {motos.filter((m) => m.id !== 'sin').map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
              {asignacion[z.nombre] && (
                <span className="cobImport__ok">
                  ✓ {motos.find((m) => m.id === asignacion[z.nombre])?.nombre || 'guardada'}
                </span>
              )}
            </div>
          ))}
          <button className="cobBtn cobBtn--suave" onClick={() => setImportados(null)}>
            Terminar
          </button>
        </div>
      )}

      {/* Resultados de la búsqueda: un clic lleva al punto en el mapa. */}
      {resultados !== null && (
        <div className="cobResultados">
          {resultados.length === 0 && <p className="cobResultados__nada">Sin resultados.</p>}
          {resultados.map((r) => (
            <button className="cobRes" key={r.puntoId} onClick={() => irA(r)}>
              <b>{r.cliente || 'Sin nombre'}</b>
              <small>{r.direccion}{r.distrito ? ` · ${r.distrito}` : ''}</small>
              <span>
                {r.motorizado ? `Lleva: ${r.motorizado}` : 'Sin motorizado'}
                {r.zonaDe ? ` · zona de ${r.zonaDe}` : ' · fuera de toda zona'}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="cobError">{error}</p>}

      <div className="cobCuerpo">
        <aside className="cobLado">
          <p className="cobLado__tit">Motorizados</p>
          {motos.map((m) => (
            <button
              key={m.id}
              className={`cobMoto ${motoActiva === m.id ? 'cobMoto--on' : ''}`}
              onClick={() => setMotoActiva(motoActiva === m.id ? null : m.id)}
              title="Ver solo sus puntos"
            >
              <i style={{ background: m.color }} />
              <span>{m.nombre}</span>
              <b>{m.n}</b>
            </button>
          ))}
          {motoActiva && (
            <button className="cobTodos" onClick={() => setMotoActiva(null)}>
              Ver todas
            </button>
          )}

          <p className="cobLado__tit cobLado__tit--sep">Por distrito</p>
          {distritos.slice(0, 14).map(([d, n]) => (
            <div className="cobDist" key={d}>
              <span>{d}</span>
              <b>{n}</b>
            </div>
          ))}
        </aside>

        <div className="cobMapa">
          <APIProvider apiKey={MAPS_KEY} libraries={['marker']}>
            <MapaGoogle
              mapId={MAPS_ID}
              defaultZoom={12}
              defaultCenter={LIMA}
              gestureHandling={'greedy'}
              className="cobMapa__lienzo"
              disableDefaultUI={false}
            >
              <Zonas zonas={zonas} visible={verZonas} motoActiva={motoActiva} />
              <Centrar centro={centro} />

              {visibles.map((p) => (
                <AdvancedMarker
                  key={`${p.id}-${p.lat}-${p.lng}`}
                  position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                  onClick={() => setElegido(p)}
                >
                  {/* Un circulo y no un pin: con casi trescientos puntos los
                      pines se tapan entre si y el mapa deja de leerse. */}
                  <span className="cobPunto" style={{ background: colorDe(p) }} />
                </AdvancedMarker>
              ))}
            </MapaGoogle>
          </APIProvider>

          {elegido && (
            <div className="cobFicha">
              <button className="cobFicha__x" onClick={() => setElegido(null)}>×</button>
              <b>{elegido.cliente || 'Sin nombre'}</b>
              <small>{elegido.direccion || ''}{elegido.distrito ? ` · ${elegido.distrito}` : ''}</small>
              <span className="cobFicha__moto" style={{ color: colorDe(elegido) }}>
                {elegido.motorizado || 'Sin asignar'}
                {elegido.posicion ? ` · parada ${elegido.posicion}` : ''}
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${elegido.lat},${elegido.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir en Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </LayoutPages>
  );
};

export default CoberturaPage;
