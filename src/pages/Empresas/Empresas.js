import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import './Empresas.scss';

moment.locale('es');

const soles = (v) => `S/${Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const lunesDe = (d) => moment(d).startOf('isoWeek');

/**
 * Las empresas que le pagan el almuerzo a su equipo.
 *
 * Son un cliente distinto al de siempre: el que come no paga y el que paga no
 * come. Por eso esta pantalla no habla de planes ni de renovaciones, habla de
 * quien eligio hoy y de cuanto se factura el viernes.
 *
 * La misma pantalla la usa la coordinadora de la empresa (rol EMPRESA). El
 * servidor le devuelve solo la suya y le niega el precio y el ciclo de
 * facturacion, que son del contrato; aqui simplemente no se le muestran.
 */
const EmpresasPage = () => {
  const { token, baseUrl, planInfo } = useAuthContext();
  const esCeo = planInfo?.role === 'ADMIN' || planInfo?.role === 'ROLE_ADMIN';

  const [empresas, setEmpresas] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [seccion, setSeccion] = useState('equipo');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');

  const [equipo, setEquipo] = useState([]);
  const [dia, setDia] = useState(moment().format('YYYY-MM-DD'));
  const [consumo, setConsumo] = useState(null);
  const [semana, setSemana] = useState(lunesDe(moment()).format('YYYY-MM-DD'));
  const [cierres, setCierres] = useState([]);
  const [sumando, setSumando] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', apellido: '', celular: '', correo: '', clave: '' });

  const cab = { headers: { Authorization: `Bearer ${token}` } };
  const datos = (r) => r.data?.data ?? r.data ?? [];

  const cargarEmpresas = useCallback(() => {
    setCargando(true);
    axios.get(`${baseUrl}admin/empresas`, cab)
      .then((r) => {
        const lista = datos(r);
        setEmpresas(lista);
        setElegida((prev) => prev ?? (lista.length === 1 ? lista[0].id : null));
        setError(null);
      })
      .catch(() => setError('No pudimos cargar las empresas.'))
      .finally(() => setCargando(false));
  }, [token, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarEmpresas(); }, [cargarEmpresas]);

  const cargarEquipo = useCallback(() => {
    if (!elegida) return;
    axios.get(`${baseUrl}admin/empresas/${elegida}/colaboradores?fecha=${dia}`, cab)
      .then((r) => setEquipo(datos(r)))
      .catch(() => setEquipo([]));
  }, [elegida, dia, token, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarConsumo = useCallback(() => {
    if (!elegida) return;
    const fin = moment(semana).add(4, 'day').format('YYYY-MM-DD');
    Promise.all([
      axios.get(`${baseUrl}admin/empresas/${elegida}/consumo?desde=${semana}&hasta=${fin}`, cab)
        .then((r) => r.data?.data ?? r.data),
      axios.get(`${baseUrl}admin/empresas/${elegida}/cierres`, cab).then(datos),
    ])
      .then(([c, h]) => { setConsumo(c); setCierres(h); })
      .catch(() => setConsumo(null));
  }, [elegida, semana, token, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargarEquipo(); }, [cargarEquipo]);
  useEffect(() => { if (seccion === 'factura') cargarConsumo(); }, [seccion, cargarConsumo]);

  const empresa = empresas.find((e) => e.id === elegida);

  // ------------------------------------------------------------------ acciones

  const agregar = (e) => {
    e.preventDefault();
    setSumando(true);
    setError(null);
    axios.post(`${baseUrl}admin/empresas/${elegida}/colaboradores`, nuevo, cab)
      .then(() => {
        setAviso(`${nuevo.nombre || 'El colaborador'} ya puede entrar al app con su celular y esa clave.`);
        setNuevo({ nombre: '', apellido: '', celular: '', correo: '', clave: '' });
        cargarEquipo();
        cargarEmpresas();
      })
      .catch((err) => setError(err.response?.data?.message || 'No pudimos darlo de alta.'))
      .finally(() => setSumando(false));
  };

  const marcarAusencia = (colaborador, nombre) => {
    const motivo = window.prompt(`${nombre} no viene el ${moment(dia).format('dddd D')}. ¿Motivo? (opcional)`);
    if (motivo === null) return;
    axios.post(`${baseUrl}admin/empresas/${elegida}/ausencias`,
      { userId: colaborador, fecha: dia, motivo }, cab)
      .then((r) => {
        const cancelado = (r.data?.data ?? r.data)?.pedidoCancelado;
        setAviso(cancelado
          ? `Listo. Se canceló su almuerzo del ${moment(dia).format('dddd D')} y no se va a facturar.`
          : 'Listo, queda registrado. Ese día no tenía almuerzo pedido.');
        cargarEquipo();
      })
      .catch((err) => setError(err.response?.data?.message || 'No pudimos registrar la ausencia.'));
  };

  const quitarAusencia = (colaborador) => {
    axios.delete(`${baseUrl}admin/empresas/${elegida}/ausencias?colaborador=${colaborador}&fecha=${dia}`, cab)
      .then(() => { setAviso('Vuelve a estar en la lista de ese día.'); cargarEquipo(); })
      .catch(() => setError('No pudimos quitar la ausencia.'));
  };

  const cerrarSemana = () => {
    const pendientes = consumo?.sinMarcar || 0;
    const texto = pendientes > 0
      ? `Ojo: hay ${pendientes} almuerzo${pendientes === 1 ? '' : 's'} sin marcar como entregado. `
        + 'Si los cierras así, no se facturan. ¿Cerrar igual?'
      : `Cerrar la semana del ${moment(semana).format('D [de] MMMM')} por ${soles(consumo?.total)}?`;
    if (!window.confirm(texto)) return;

    axios.post(`${baseUrl}admin/empresas/${elegida}/cierre?desde=${semana}`, {}, cab)
      .then(() => { setAviso('Semana cerrada. Ya puedes bajar el detalle para tu contador.'); cargarConsumo(); })
      .catch((err) => setError(err.response?.data?.message || 'No pudimos cerrar la semana.'));
  };

  const anotarFactura = (cierre) => {
    const numero = window.prompt('Número de la factura que emitió el contador:', cierre.facturaNumero || '');
    if (numero === null) return;
    axios.put(`${baseUrl}admin/empresas/cierres/${cierre.id}/factura`, { facturaNumero: numero }, cab)
      .then(() => { setAviso('Anotado.'); cargarConsumo(); })
      .catch(() => setError('No pudimos guardar el número.'));
  };

  /* El CSV es para el contador, no para el sistema: una fila por colaborador
     con lo que se le entrego y su importe, mas el resumen con IGV al pie. */
  const bajarDetalle = () => {
    if (!consumo) return;
    const filas = [['Colaborador', 'Almuerzos entregados', 'Ausencias', 'No entregados', 'Importe sin IGV']];
    (consumo.detalle || []).forEach((d) => filas.push([
      d.nombre, d.entregados, d.ausencias, d.fallidos, Number(d.importe || 0).toFixed(2),
    ]));
    filas.push([]);
    filas.push(['', '', '', 'Subtotal', Number(consumo.subtotal).toFixed(2)]);
    filas.push(['', '', '', `IGV ${consumo.empresa?.igvPorcentaje}%`, Number(consumo.igv).toFixed(2)]);
    filas.push(['', '', '', 'Total', Number(consumo.total).toFixed(2)]);

    const csv = filas.map((f) => f.map((c) => `"${String(c ?? '')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `${empresa?.nombreVisible || 'empresa'}-semana-${semana}.csv`;
    a.click();
  };

  // ------------------------------------------------------------------ pintado

  return (
    <LayoutPages>
      <TitlePage title={'Empresas'} />

      {error && <div className="emAviso emAviso--rojo">{error}</div>}
      {aviso && <div className="emAviso" onClick={() => setAviso('')}>{aviso}</div>}

      {cargando && <p className="emVacio">Cargando…</p>}

      {!cargando && empresas.length === 0 &&
        <p className="emVacio">Todavía no hay ninguna empresa registrada.</p>}

      {empresas.length > 1 &&
        <div className="emLista">
          {empresas.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`emTarjeta ${elegida === e.id ? 'emTarjeta--activa' : ''}`}
              onClick={() => setElegida(e.id)}
            >
              <span className="emTarjeta__marca" style={{ background: e.color }} />
              <b>{e.nombreVisible}</b>
              <small>{e.colaboradores} colaborador{e.colaboradores === 1 ? '' : 'es'} · {e.distrito}</small>
              <span className="emTarjeta__monto">{soles(e.montoSemana)}<i>esta semana</i></span>
            </button>
          ))}
        </div>}

      {empresa &&
        <>
          <header className="emCab">
            <div>
              <h2>{empresa.nombreVisible}</h2>
              <p>
                {empresa.razonSocial} · RUC {empresa.ruc}
                {esCeo && <> · {soles(empresa.precioUnitario)} + {Number(empresa.igvPorcentaje)}% por envío</>}
              </p>
            </div>
            <div className="emCab__nums">
              <span><b>{empresa.colaboradores}</b><i>en el equipo</i></span>
              <span><b>{empresa.enviosSemana}</b><i>almuerzos esta semana</i></span>
              {esCeo && <span><b>{soles(empresa.montoSemana)}</b><i>sin IGV</i></span>}
            </div>
          </header>

          <nav className="emTabs">
            <button type="button" className={seccion === 'equipo' ? 'act' : ''}
              onClick={() => setSeccion('equipo')}>El equipo</button>
            <button type="button" className={seccion === 'factura' ? 'act' : ''}
              onClick={() => setSeccion('factura')}>Consumo y facturación</button>
          </nav>

          {seccion === 'equipo' &&
            <section className="emPanel">
              <div className="emPanel__cab">
                <div>
                  <h3>Almuerzo del {moment(dia).format('dddd D [de] MMMM')}</h3>
                  <p>
                    {equipo.filter((c) => c.eligio).length} de {equipo.filter((c) => c.activo).length} ya eligieron
                    {' · '}cierra a las 10 p.m. del día anterior
                  </p>
                </div>
                <div className="emNav">
                  <button type="button" onClick={() => setDia(moment(dia).subtract(1, 'day').format('YYYY-MM-DD'))}>‹</button>
                  <button type="button" onClick={() => setDia(moment().format('YYYY-MM-DD'))}>Hoy</button>
                  <button type="button" onClick={() => setDia(moment(dia).add(1, 'day').format('YYYY-MM-DD'))}>›</button>
                </div>
              </div>

              <ul className="emEquipo">
                {equipo.map((c) => (
                  <li key={c.id} className={`${c.activo ? '' : 'emFila--baja'} ${c.ausenciaId ? 'emFila--fuera' : ''}`}>
                    <div className="emFila__quien">
                      <b>{c.nombre || 'Sin nombre'}</b>
                      <small>{c.celular}</small>
                    </div>

                    <div className="emFila__que">
                      {c.ausenciaId
                        ? <span className="emChip emChip--fuera">
                            No viene{c.motivoAusencia ? ` · ${c.motivoAusencia}` : ''}
                          </span>
                        : c.eligio
                          ? <span className="emChip emChip--ok">{c.eligio}</span>
                          : <span className="emChip emChip--falta">Todavía no elige</span>}
                    </div>

                    <div className="emFila__acc">
                      {c.ausenciaId
                        ? <button type="button" onClick={() => quitarAusencia(c.id)}>Sí viene</button>
                        : <button type="button" onClick={() => marcarAusencia(c.id, c.nombre)}>No viene</button>}
                    </div>
                  </li>
                ))}
              </ul>

              <form className="emAlta" onSubmit={agregar}>
                <h4>Sumar a alguien del equipo</h4>
                <div className="emAlta__campos">
                  <input placeholder="Nombre" value={nuevo.nombre} required
                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
                  <input placeholder="Apellido" value={nuevo.apellido}
                    onChange={(e) => setNuevo({ ...nuevo, apellido: e.target.value })} />
                  <input placeholder="Celular" value={nuevo.celular} required
                    onChange={(e) => setNuevo({ ...nuevo, celular: e.target.value })} />
                  <input placeholder="Correo (opcional)" type="email" value={nuevo.correo}
                    onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} />
                  <input placeholder="Clave para entrar" value={nuevo.clave} required minLength={8}
                    onChange={(e) => setNuevo({ ...nuevo, clave: e.target.value })} />
                  <button type="submit" disabled={sumando}>{sumando ? 'Dando de alta…' : 'Dar de alta'}</button>
                </div>
                <small>Entra al app con su celular y esa clave. Empieza a elegir desde el día siguiente.</small>
              </form>
            </section>}

          {seccion === 'factura' && consumo &&
            <section className="emPanel">
              <div className="emPanel__cab">
                <div>
                  <h3>Semana del {moment(semana).format('D [de] MMMM')} al {moment(semana).add(4, 'day').format('D [de] MMMM')}</h3>
                  <p>Se factura solo lo que se entregó.</p>
                </div>
                <div className="emNav">
                  <button type="button" onClick={() => setSemana(moment(semana).subtract(7, 'day').format('YYYY-MM-DD'))}>‹</button>
                  <button type="button" onClick={() => setSemana(lunesDe(moment()).format('YYYY-MM-DD'))}>Esta semana</button>
                  <button type="button" onClick={() => setSemana(moment(semana).add(7, 'day').format('YYYY-MM-DD'))}>›</button>
                </div>
              </div>

              {/* Lo que el motorizado no marco no se factura. Es plata que se
                  pierde sin que nadie se entere, asi que se avisa antes. */}
              {consumo.sinMarcar > 0 &&
                <div className="emAviso emAviso--naranja">
                  Hay <b>{consumo.sinMarcar}</b> almuerzo{consumo.sinMarcar === 1 ? '' : 's'} de esta semana
                  que el motorizado no marcó como entregado. Si cierras así, no entran en la factura.
                </div>}

              <table className="emTabla">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Entregados</th>
                    <th>No vino</th>
                    <th>Sin entregar</th>
                    {esCeo && <th>Importe</th>}
                  </tr>
                </thead>
                <tbody>
                  {(consumo.detalle || []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.nombre}</td>
                      <td><b>{d.entregados}</b></td>
                      <td>{d.ausencias || '—'}</td>
                      <td>{d.fallidos || '—'}</td>
                      {esCeo && <td>{soles(d.importe)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {esCeo &&
                <div className="emTotales">
                  <span>{consumo.envios} almuerzos × {soles(consumo.precioUnitario)}</span>
                  <span>Subtotal <b>{soles(consumo.subtotal)}</b></span>
                  <span>IGV {Number(consumo.empresa?.igvPorcentaje)}% <b>{soles(consumo.igv)}</b></span>
                  <span className="emTotales__total">Total <b>{soles(consumo.total)}</b></span>
                </div>}

              <div className="emAcciones">
                <button type="button" className="emBtn" onClick={bajarDetalle}>Bajar el detalle en Excel</button>
                {esCeo && <button type="button" className="emBtn emBtn--fuerte" onClick={cerrarSemana}>Cerrar la semana</button>}
              </div>

              {cierres.length > 0 &&
                <div className="emCierres">
                  <h4>Semanas cerradas</h4>
                  <ul>
                    {cierres.map((c) => (
                      <li key={c.id}>
                        <span>{moment(c.semanaInicio).format('D MMM')} – {moment(c.semanaFin).format('D MMM')}</span>
                        <span>{c.envios} almuerzos</span>
                        <span><b>{soles(c.total)}</b></span>
                        {esCeo &&
                          <button type="button" onClick={() => anotarFactura(c)}>
                            {c.facturaNumero ? `Factura ${c.facturaNumero}` : 'Anotar factura'}
                          </button>}
                      </li>
                    ))}
                  </ul>
                </div>}
            </section>}
        </>}
    </LayoutPages>
  );
};

export default EmpresasPage;
