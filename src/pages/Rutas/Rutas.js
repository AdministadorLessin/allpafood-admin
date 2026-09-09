import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Rutas.scss';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';
import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import * as XLSX from 'xlsx';

moment.locale('es');

/**
 * Tablero de rutas del dia.
 *
 * Reemplaza la hoja de calculo donde operaciones lleva una columna por
 * motorizado y mueve filas a mano. Lo que aporta encima de la hoja es que
 * mide: el cupo que le queda a cada uno, y a que ruta le cae mas cerca un
 * cliente nuevo —la cuenta que el coordinador hacia mirando el mapa—.
 *
 * El arrastre es el del navegador, sin libreria: las rutas son de veinticinco
 * puntos, no de miles, y no vale la pena sumar una dependencia por esto.
 */
const Rutas = () => {
  const { baseUrl, token } = useAuthContext();

  const [fecha, setFecha] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
  const [tablero, setTablero] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [arrastrando, setArrastrando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cabecera = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    axios
      .get(`${baseUrl}delivery/motorized/board?date=${fecha}`, cabecera)
      .then((r) => setTablero(r.data?.data ?? r.data))
      .catch(() => setError('No pudimos cargar el tablero. Intentalo de nuevo.'))
      .finally(() => setCargando(false));
  }, [baseUrl, cabecera, fecha]);

  useEffect(() => { cargar(); }, [cargar]);

  /* ------------------------------------------------------------ acciones */

  const asignar = (orderId, motorizadoId) => {
    setGuardando(true);
    axios
      .post(
        `${baseUrl}delivery/motorized/assign-route`,
        { userId: motorizadoId, orderIds: [orderId] },
        cabecera
      )
      .then(cargar)
      .catch(() => setError('No pudimos asignar ese punto.'))
      .finally(() => setGuardando(false));
  };

  /**
   * Hoja de rotulado de una ruta.
   *
   * Son los datos que van en la etiqueta de cada bolsa: restricciones,
   * azucar, doble proteina. Por eso NO lleva direccion ni telefono —eso es
   * cosa de la app del motorizado, no de la etiqueta— y el distrito va
   * recortado, que es lo que cabe.
   *
   * Sale en el orden del recorrido para que la pila de bolsas quede en el
   * orden en que se van a entregar.
   */
  const descargarRotulado = (ruta) => {
    axios
      .get(
        `${baseUrl}admin/orders/export?date=${fecha}&motorizadoId=${ruta.motorizadoId}`,
        cabecera
      )
      .then((resp) => {
        const pedidos = resp.data?.data ?? resp.data ?? [];
        if (!pedidos.length) {
          setError(`${ruta.nombre} no tiene puntos ese dia.`);
          return;
        }

        const nombreCorto = (n, a) => {
          if (!n) return '';
          const partes = n.trim().split(/\s+/);
          const segundo = partes.length > 1 ? ` ${partes[1].charAt(0)}.` : '';
          const apellido = a ? ` ${a.trim().split(/\s+/)[0]}` : '';
          return `${partes[0]}${segundo}${apellido}`;
        };

        /* El numero sale del orden de la hoja, no de routePosition.
           Un punto recien movido de otra ruta todavia no tiene posicion, y
           las etiquetas saldrian sin numerar. El servidor ya devuelve las
           filas en el orden del recorrido —el mismo que ve el motorizado en
           su app—, asi que numerar por indice siempre coincide. */
        const filas = pedidos.map((o, i) => ({
          'N°': i + 1,
          'N° Orden': o.orderId,
          Cliente: nombreCorto(o.clientName, o.clientLastname),
          Motorizado: nombreCorto(o.motorizedName, o.motorizedLastname),
          Distrito: o.district ? `${o.district.substring(0, 5)}.` : '',
          Azúcar: o.sugar === 'Sí' ? 'Sí' : '',
          'Restricciones Alimentarias': o.alimentsRestrictions || '',
          'Doble Proteína': o.doubleProtein === 'Sí' ? 'Sí' : '',
          Snack: o.snack === 'Sí' ? 'Snack' : '',
          Estado: o.status,
        }));

        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'Rotulado');
        const limpio = (ruta.nombre || 'ruta').replace(/[^\w]+/g, '-').toLowerCase();
        XLSX.writeFile(libro, `rotulado-${limpio}-${fecha}.xlsx`);
      })
      .catch(() => setError('No pudimos generar la hoja de rotulado.'));
  };

  /** Guarda el orden de una ruta tras soltar. El primero es el punto 1. */
  const guardarOrden = (motorizadoId, orderIds) => {
    axios
      .post(
        `${baseUrl}delivery/motorized/reorder-route`,
        { motorizadoId, orderIds },
        cabecera
      )
      .catch(() => setError('No pudimos guardar el orden del recorrido.'));
  };

  const soltarEn = (motorizadoId, indiceDestino) => {
    if (!arrastrando) return;
    const { orderId, desde } = arrastrando;
    setArrastrando(null);

    // Mismo motorizado: solo cambia el orden del recorrido.
    if (desde === motorizadoId) {
      const ruta = tablero.rutas.find((r) => r.motorizadoId === motorizadoId);
      const ids = ruta.puntos.map((p) => p.orderId).filter((id) => id !== orderId);
      ids.splice(indiceDestino, 0, orderId);
      // Se pinta de inmediato y se guarda detras: el coordinador reordena
      // varios puntos seguidos y esperar al servidor en cada uno lo frena.
      setTablero((t) => ({
        ...t,
        rutas: t.rutas.map((r) =>
          r.motorizadoId !== motorizadoId
            ? r
            : {
                ...r,
                puntos: ids.map((id, i) => ({
                  ...r.puntos.find((p) => p.orderId === id),
                  posicion: i + 1,
                })),
              }
        ),
      }));
      guardarOrden(motorizadoId, ids);
      return;
    }

    // Otro motorizado: cambia de ruta. Eso si se recarga, porque toca cupos.
    asignar(orderId, motorizadoId);
  };

  /* -------------------------------------------------------------- filtro */

  const coincide = (p) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.trim().toLowerCase();
    return [p.cliente, p.direccion, p.telefono, p.distrito]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  };

  /* -------------------------------------------------------------- pintado */

  const Punto = ({ p, motorizadoId, indice }) => (
    <div
      className={`ruPunto ${coincide(p) ? '' : 'ruPunto--apagado'} ${
        arrastrando?.orderId === p.orderId ? 'ruPunto--moviendo' : ''
      }`}
      draggable
      onDragStart={() => setArrastrando({ orderId: p.orderId, desde: motorizadoId })}
      onDragEnd={() => setArrastrando(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.stopPropagation(); soltarEn(motorizadoId, indice); }}
      title={p.telefono || ''}
    >
      <span className="ruPunto__pos">{p.posicion ?? '·'}</span>
      <span className="ruPunto__nom">{p.cliente}</span>
      <span className="ruPunto__dir">
        {p.direccion || 'sin direccion'}
        {p.distrito ? ` · ${p.distrito}` : ''}
      </span>
    </div>
  );

  const totalPuntos =
    (tablero?.rutas ?? []).reduce((n, r) => n + r.puntos.length, 0) +
    (tablero?.sinAsignar?.length ?? 0);

  return (
    <LayoutPages>
      <TitlePage title={'Rutas del dia'} />

      <div className="ruBarra">
        <input
          className="ruBuscar"
          placeholder="Buscar cliente, calle o telefono"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="ruNav">
          <button onClick={() => setFecha(moment(fecha).subtract(1, 'day').format('YYYY-MM-DD'))}>‹</button>
          <span className="ruFecha">{moment(fecha).format('dddd D [de] MMMM')}</span>
          <button onClick={() => setFecha(moment(fecha).add(1, 'day').format('YYYY-MM-DD'))}>›</button>
          <button
            className="ruNav__hoy"
            onClick={() => setFecha(moment().add(1, 'day').format('YYYY-MM-DD'))}
          >
            Mañana
          </button>
        </div>
      </div>

      {error && <div className="ruAviso ruAviso--rojo">{error}</div>}
      {cargando && <div className="ruAviso">Cargando el tablero…</div>}

      {tablero && !cargando && (
        <>
          <div className="ruResumen">
            {tablero.sinAsignar.length > 0 && (
              <span className="ruAviso ruAviso--rojo">
                <b>{tablero.sinAsignar.length}</b>&nbsp;sin asignar
              </span>
            )}
            <span className="ruResumen__total">
              {totalPuntos} puntos · {tablero.rutas.length} rutas
            </span>
          </div>

          {tablero.sinAsignar.length > 0 && (
            <section className="ruBandeja">
              <p className="ruBandeja__tit">
                Sin asignar <span>nadie los lleva todavia</span>
              </p>
              <div className="ruBandeja__fila">
                {tablero.sinAsignar.map((p) => (
                  <div
                    key={p.orderId}
                    className={`ruNuevo ${coincide(p) ? '' : 'ruPunto--apagado'}`}
                    draggable
                    onDragStart={() => setArrastrando({ orderId: p.orderId, desde: null })}
                    onDragEnd={() => setArrastrando(null)}
                  >
                    <span className="ruNuevo__nom">{p.cliente}</span>
                    <span className="ruNuevo__dir">{p.direccion || 'sin direccion'}</span>
                    <span className="ruNuevo__dis">{p.distrito}</span>
                    {p.sugerencia ? (
                      <div className="ruSug">
                        <span className="ruSug__txt">mas cerca:</span>
                        <span className="ruSug__val">{p.sugerencia.nombre}</span>
                        <span className="ruSug__km">
                          {p.sugerencia.metros < 1000
                            ? `${p.sugerencia.metros} m`
                            : `${(p.sugerencia.metros / 1000).toFixed(1)} km`}
                        </span>
                        <button
                          className="ruSug__btn"
                          disabled={guardando || !p.sugerencia.tieneCupo}
                          title={p.sugerencia.tieneCupo ? '' : 'Esa ruta llego a su tope'}
                          onClick={() => asignar(p.orderId, p.sugerencia.motorizadoId)}
                        >
                          {p.sugerencia.tieneCupo ? 'Asignar' : 'Sin cupo'}
                        </button>
                      </div>
                    ) : (
                      <div className="ruSug">
                        <span className="ruSug__txt">
                          sin sugerencia — arrastralo a una ruta
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="ruTablero">
            {tablero.rutas.map((r) => {
              const lleno = r.puntos.length >= r.capacidad;
              const casi = !lleno && r.puntos.length >= r.capacidad - 3;
              return (
                <div
                  key={r.motorizadoId}
                  className="ruRuta"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => soltarEn(r.motorizadoId, r.puntos.length)}
                >
                  <div className="ruRuta__cab">
                    <div className="ruRuta__nom">
                      <span>
                        {r.nombre}
                        {r.externo && <span className="ruExterno">externo</span>}
                      </span>
                      <span className={`ruCupo ${lleno ? 'ruCupo--lleno' : ''}`}>
                        {r.puntos.length}/{r.capacidad}
                      </span>
                    </div>
                    {r.puntos.length > 0 && (
                      <button
                        className="ruRotulado"
                        onClick={() => descargarRotulado(r)}
                        title="Hoja de rotulado de esta ruta, en orden de recorrido"
                      >
                        Rotulado
                      </button>
                    )}
                    <div className="ruBarraCupo">
                      <i
                        className={lleno ? 'tope' : casi ? 'alto' : ''}
                        style={{
                          width: `${Math.min(100, (r.puntos.length / r.capacidad) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ruRuta__puntos">
                    {r.puntos.map((p, i) => (
                      <Punto key={p.orderId} p={p} motorizadoId={r.motorizadoId} indice={i} />
                    ))}
                    {r.puntos.length === 0 && (
                      <p className="ruRuta__vacia">Sin puntos este dia</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </LayoutPages>
  );
};

export default Rutas;
