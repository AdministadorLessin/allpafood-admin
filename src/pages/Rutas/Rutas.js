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
 * Una tarjeta del tablero.
 *
 * Vive FUERA del componente de la pagina a proposito. Declarada adentro, cada
 * render creaba un tipo de componente distinto y React desmontaba la tarjeta
 * para volver a montarla. Como el nodo desaparecia justo al empezar a
 * arrastrar —el propio onDragStart cambia el estado—, el navegador cancelaba
 * el arrastre: se podia traer un punto desde la bandeja, que se pinta suelta,
 * pero no mover uno que ya estaba en una columna ni reordenar dentro de ella.
 *
 * Por eso recibe todo por props en vez de tomarlo del entorno.
 */
const Punto = ({ p, motorizadoId, indice, apagado, moviendo, onInicio, onFin, onSoltar }) => (
  <div
    className={`ruPunto ${apagado ? 'ruPunto--apagado' : ''} ${moviendo ? 'ruPunto--moviendo' : ''}`}
    draggable
    onDragStart={() => onInicio(p.orderId, motorizadoId)}
    onDragEnd={onFin}
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => { e.stopPropagation(); onSoltar(motorizadoId, indice); }}
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
  // Ruta cuyo aviso esta esperando confirmacion, y el ultimo resultado.
  const [porAvisar, setPorAvisar] = useState(null);
  const [avisando, setAvisando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [repartiendo, setRepartiendo] = useState(false);

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
          /* Lo que la cocina lee para armar la bolsa: "OP 1", o "OP 1 y 2"
             cuando el plan trae almuerzo y cena, con el almuerzo primero.
             Va pegado al nombre porque es lo que se compara contra el Excel
             de la operacion mientras dure la migracion. */
          Opción: o.option || '',
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

  /**
   * Corre el reparto automatico, el mismo que se ejecuta cada noche.
   *
   * Reparte segun la ruta que ya tiene guardada cada direccion y respeta los
   * cupos; lo que no tiene ruta lo deja sin asignar para que lo decidas tu.
   *
   * El servidor siempre trabaja sobre MANANA, sin mirar la fecha del tablero.
   * Por eso el boton solo aparece cuando estas parado en manana: en otro dia
   * repartiria algo que no estas viendo.
   */
  const repartirAutomatico = () => {
    setRepartiendo(true);
    setError(null);
    setAviso('');

    axios
      .post(`${baseUrl}delivery/motorized/assign-default`, {}, cabecera)
      .then(() => {
        setAviso('Reparto automatico ejecutado. Lo que quedo sin asignar no tenia ruta guardada.');
        cargar();
      })
      .catch(() => setError('No pudimos correr el reparto automatico.'))
      .finally(() => setRepartiendo(false));
  };

  /**
   * Avisa a los clientes de una ruta que su pedido salio.
   *
   * Esto antes lo hacia la asignacion por su cuenta: arrastrar una tarjeta le
   * mandaba el WhatsApp al cliente en ese instante, fuera la hora que fuera, y
   * moverla de nuevo se lo repetia. Ahora es una accion del coordinador, y
   * pide confirmacion porque manda mensajes a gente real.
   *
   * El servidor ignora a los que ya tenian aviso, asi que apretar dos veces no
   * molesta a nadie dos veces.
   */
  const avisarSalida = (ruta) => {
    setAvisando(true);
    setError(null);
    setAviso('');

    axios
      .post(
        `${baseUrl}delivery/motorized/notify-route`,
        ruta.puntos.map((p) => p.orderId),
        cabecera
      )
      .then((r) => {
        const avisados = r.data?.data?.avisados ?? r.data?.avisados ?? 0;
        setAviso(
          avisados === 0
            ? `Los clientes de ${ruta.nombre} ya tenian el aviso. No se repitio ninguno.`
            : `Aviso enviado a ${avisados} cliente${avisados === 1 ? '' : 's'} de ${ruta.nombre}.`
        );
      })
      .catch(() => setError(`No pudimos avisar a los clientes de ${ruta.nombre}.`))
      .finally(() => {
        setAvisando(false);
        setPorAvisar(null);
      });
  };

  /**
   * Excel de cruce del dia entero.
   *
   * Mientras una parte de los clientes siga en la hoja de calculo de siempre,
   * conviven dos comandas. Esta hoja es la que permite ponerlas una al lado de
   * la otra: usa el mismo vocabulario que el Excel de la operacion —"OP 1",
   * "OP 1 y 2"— y lleva el nombre del plato al costado, que es lo unico que no
   * se mueve si alguien reordena el menu del dia despues de que los clientes
   * ya eligieron.
   *
   * Va ordenada por cliente y no por recorrido: se lee contra una lista de
   * nombres, no contra una ruta. Por eso tampoco se acota a un motorizado.
   */
  const descargarCruce = () => {
    axios
      .get(`${baseUrl}admin/orders/export?date=${fecha}`, cabecera)
      .then((resp) => {
        const pedidos = resp.data?.data ?? resp.data ?? [];
        if (!pedidos.length) {
          setError(`No hay pedidos programados para el ${moment(fecha).format('D [de] MMMM')}.`);
          return;
        }

        const nombre = (n, a) => `${n || ''} ${a || ''}`.trim();

        const filas = [...pedidos]
          .sort((a, b) =>
            nombre(a.clientName, a.clientLastname)
              .localeCompare(nombre(b.clientName, b.clientLastname), 'es')
          )
          .map((o) => ({
            Fecha: moment(fecha).format('DD/MM/YYYY'),
            Cliente: nombre(o.clientName, o.clientLastname),
            Opción: o.option || '',
            Almuerzo: o.lunchName || '',
            Cena: o.dinnerName || '',
            Bebida: o.drinkName || '',
            Snack: o.snackName || '',
            Distrito: o.district || '',
            Motorizado: nombre(o.motorizedName, o.motorizedLastname),
            'Restricciones Alimentarias': o.alimentsRestrictions || '',
            'N° Orden': o.orderId,
          }));

        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'Cruce');
        XLSX.writeFile(libro, `cruce-${fecha}.xlsx`);
      })
      .catch(() => setError('No pudimos generar el Excel de cruce.'));
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
      {aviso && <div className="ruAviso ruAviso--ok">{aviso}</div>}
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
            {fecha === moment().add(1, 'day').format('YYYY-MM-DD') && (
              <button
                className="ruCruce"
                onClick={repartirAutomatico}
                disabled={repartiendo}
                title="Reparte los puntos que tienen ruta guardada, respetando el cupo de cada motorizado"
              >
                {repartiendo ? 'Repartiendo…' : 'Repartir automático'}
              </button>
            )}
            <button
              className="ruCruce"
              onClick={descargarCruce}
              title="Todos los pedidos del dia con su numero de opcion, para cruzar contra el Excel de la operacion"
            >
              Excel de cruce
            </button>
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
                      <>
                        <button
                          className="ruRotulado"
                          onClick={() => descargarRotulado(r)}
                          title="Hoja de rotulado de esta ruta, en orden de recorrido"
                        >
                          Rotulado
                        </button>

                        {/* Dos pasos a proposito: manda WhatsApp a clientes
                            reales y no hay forma de desmandarlo. */}
                        {porAvisar === r.motorizadoId ? (
                          <div className="ruAvisar__confirma">
                            <button
                              className="ruAvisar ruAvisar--si"
                              disabled={avisando}
                              onClick={() => avisarSalida(r)}
                            >
                              {avisando ? 'Avisando…' : `Avisar a ${r.puntos.length}`}
                            </button>
                            <button
                              className="ruAvisar ruAvisar--no"
                              disabled={avisando}
                              onClick={() => setPorAvisar(null)}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="ruAvisar"
                            onClick={() => { setAviso(''); setPorAvisar(r.motorizadoId); }}
                            title="Manda el WhatsApp de salida a los clientes de esta ruta"
                          >
                            Avisar salida
                          </button>
                        )}
                      </>
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
                      <Punto
                        key={p.orderId}
                        p={p}
                        motorizadoId={r.motorizadoId}
                        indice={i}
                        apagado={!coincide(p)}
                        moviendo={arrastrando?.orderId === p.orderId}
                        onInicio={(orderId, desde) => setArrastrando({ orderId, desde })}
                        onFin={() => setArrastrando(null)}
                        onSoltar={soltarEn}
                      />
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
