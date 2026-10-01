import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import './Tarjetas.scss';

const SEGMENTOS = [
  { v: 'todos',        t: 'Todos los clientes' },
  { v: 'activos',      t: 'Con plan vigente' },
  { v: 'por_vencer',   t: 'Por vencer (3 almuerzos o 5 días)' },
  { v: 'nuevos',       t: 'Nuevos (primeras 2 semanas)' },
  { v: 'sin_plan',     t: 'Sin plan' },
  { v: 'corporativos', t: 'De empresa' },
];

const LUGARES = [
  { v: 'inicio',       t: 'Inicio' },
  { v: 'menu',         t: 'Al elegir sus platos' },
  { v: 'confirmacion', t: 'Después de confirmar' },
];

const COLORES = ['#E2F3E9', '#FFF6DF', '#E4EFFA', '#F9E5E1', '#177A4C', '#16211B'];
const ICONOS = ['idea', 'nevera', 'calendario', 'reloj', 'corazon', 'pesa', 'agua', 'regalo'];

const VACIA = {
  etiqueta: 'Tip', titulo: '', texto: '', pie: '', color: '#E2F3E9', icono: 'idea',
  imagenUrl: '', enlace: '', enlaceTexto: '', segmento: 'todos', lugar: 'inicio',
  orden: 10, activo: true, desde: '', hasta: '',
};

/**
 * Tarjetas: los tips y avisos que ve el cliente dentro del app.
 *
 * 210 de 215 clientes entran cada semana a elegir sus platos. Es el canal
 * propio mas usado del negocio y hasta ahora no servia para decirles nada.
 *
 * Lo que de verdad se mira aqui no es el texto: es la columna de efectividad.
 * Una tarjeta que nadie toca ocupa el mismo sitio que una que vende.
 */
const TarjetasPage = () => {
  const { token, baseUrl } = useAuthContext();

  const [lista, setLista] = useState([]);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const cab = { headers: { Authorization: `Bearer ${token}` } };

  const cargar = useCallback(() => {
    axios.get(`${baseUrl}admin/tarjetas`, cab)
      .then((r) => setLista(r.data?.data ?? r.data ?? []))
      .catch(() => setError('No pudimos cargar las tarjetas.'));
  }, [token, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const cuerpo = {
      ...editando,
      orden: Number(editando.orden) || 10,
      desde: editando.desde || null,
      hasta: editando.hasta || null,
    };
    const peticion = editando.id
      ? axios.put(`${baseUrl}admin/tarjetas/${editando.id}`, cuerpo, cab)
      : axios.post(`${baseUrl}admin/tarjetas`, cuerpo, cab);

    peticion
      .then(() => { setAviso('Guardada.'); setEditando(null); cargar(); })
      .catch((err) => setError(err.response?.data?.message || 'No pudimos guardarla.'))
      .finally(() => setGuardando(false));
  };

  /* Subir la imagen desde la computadora. Antes el campo pedia una direccion
     de internet, que obliga a tener la foto publicada en otro sitio: nadie
     tiene eso a mano cuando esta armando una tarjeta. */
  const subirImagen = (archivo) => {
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen pesa más de 5 MB. Redúcela y vuelve a intentar.');
      return;
    }
    setSubiendo(true);
    setError(null);
    const cuerpo = new FormData();
    cuerpo.append('file', archivo);
    axios.post(`${baseUrl}admin/tarjetas/imagen`, cuerpo,
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const url = (r.data?.data ?? r.data)?.url;
        if (url) setEditando((e) => ({ ...e, imagenUrl: url }));
      })
      .catch((err) => setError(err.response?.data?.message
        || 'No pudimos subir la imagen. Prueba con un JPG o PNG.'))
      .finally(() => setSubiendo(false));
  };

  const borrar = (t) => {
    if (!window.confirm(`¿Borrar "${t.titulo}"? No se puede deshacer.`)) return;
    axios.delete(`${baseUrl}admin/tarjetas/${t.id}`, cab)
      .then(() => { setAviso('Borrada.'); cargar(); })
      .catch(() => setError('No pudimos borrarla.'));
  };

  const claro = (hex) => {
    const c = String(hex || '').replace('#', '');
    if (c.length !== 6) return true;
    return (0.2126 * parseInt(c.slice(0, 2), 16)
          + 0.7152 * parseInt(c.slice(2, 4), 16)
          + 0.0722 * parseInt(c.slice(4, 6), 16)) > 150;
  };

  const nombreDe = (lista_, v) => lista_.find((x) => x.v === v)?.t || v;

  return (
    <LayoutPages>
      <TitlePage title={'Tarjetas del app'} />

      {error && <div className="tjAviso tjAviso--rojo">{error}</div>}
      {aviso && <div className="tjAviso" onClick={() => setAviso('')}>{aviso}</div>}

      <div className="tjCab">
        <p>
          Lo que el cliente ve dentro del app. Cada tarjeta elige a quién le habla:
          un cliente de empresa nunca ve avisos de renovación.
        </p>
        <button type="button" className="tjBtn tjBtn--fuerte"
          onClick={() => setEditando({ ...VACIA })}>Nueva tarjeta</button>
      </div>

      <div className="tjLista">
        {lista.map((t) => (
          <article key={t.id} className={`tjFila ${t.activo ? '' : 'tjFila--off'}`}>
            {/* La miniatura con el color y el titulo reales: es como la va a
                ver el cliente, no una fila de texto. */}
            <div className={`tjMini ${claro(t.color) ? '' : 'tjMini--oscura'}`}
                 style={{ background: t.color }}>
              {t.etiqueta && <span>{t.etiqueta}</span>}
              <b>{t.titulo}</b>
            </div>

            <div className="tjDatos">
              <p className="tjDatos__quien">
                <b>{nombreDe(SEGMENTOS, t.segmento)}</b> · {nombreDe(LUGARES, t.lugar)}
              </p>
              {t.texto && <p className="tjDatos__texto">{t.texto}</p>}
              <p className="tjDatos__num">
                {t.vistas} vistas · {t.clics} toques
                {t.efectividad !== null && t.efectividad !== undefined &&
                  <b className={t.efectividad >= 5 ? 'tjOk' : ''}> · {t.efectividad}% la toca</b>}
              </p>
            </div>

            <div className="tjAcc">
              <button type="button" onClick={() => setEditando({
                ...VACIA, ...t, activo: !!t.activo,
                desde: t.desde ? String(t.desde).slice(0, 10) : '',
                hasta: t.hasta ? String(t.hasta).slice(0, 10) : '',
              })}>Editar</button>
              <button type="button" className="tjAcc__borrar" onClick={() => borrar(t)}>Borrar</button>
            </div>
          </article>
        ))}

        {lista.length === 0 && <p className="tjVacio">Todavía no hay ninguna tarjeta.</p>}
      </div>

      {editando && (
        <form className="tjForma" onSubmit={guardar}>
          <h3>{editando.id ? 'Editar tarjeta' : 'Nueva tarjeta'}</h3>

          <div className="tjForma__campos">
            <label>Etiqueta
              <input value={editando.etiqueta || ''} maxLength={30} placeholder="Tip"
                onChange={(e) => setEditando({ ...editando, etiqueta: e.target.value })} />
            </label>
            <label className="tjAncho">Título
              <input value={editando.titulo} required maxLength={80}
                placeholder="Tu almuerzo rinde más si desayunas"
                onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />
            </label>
            <label className="tjAncho">Texto
              <textarea rows={3} value={editando.texto || ''} maxLength={220}
                placeholder="Tres líneas como máximo. Si necesita más, ponle un enlace."
                onChange={(e) => setEditando({ ...editando, texto: e.target.value })} />
            </label>
            <label>Línea del pie
              <input value={editando.pie || ''} maxLength={60} placeholder="1 min de lectura"
                onChange={(e) => setEditando({ ...editando, pie: e.target.value })} />
            </label>
            <label>Orden
              <input type="number" value={editando.orden} min={1} max={99}
                onChange={(e) => setEditando({ ...editando, orden: e.target.value })} />
            </label>

            <label>¿A quién?
              <select value={editando.segmento}
                onChange={(e) => setEditando({ ...editando, segmento: e.target.value })}>
                {SEGMENTOS.map((s) => <option key={s.v} value={s.v}>{s.t}</option>)}
              </select>
            </label>
            <label>¿Dónde?
              <select value={editando.lugar}
                onChange={(e) => setEditando({ ...editando, lugar: e.target.value })}>
                {LUGARES.map((s) => <option key={s.v} value={s.v}>{s.t}</option>)}
              </select>
            </label>

            <label>Enlace
              <input value={editando.enlace || ''} placeholder="/planes  o  https://…"
                onChange={(e) => setEditando({ ...editando, enlace: e.target.value })} />
            </label>
            <label className="tjAncho">Imagen de fondo (opcional)
              <div className="tjImagen">
                {editando.imagenUrl
                  ? <img src={editando.imagenUrl} alt="" className="tjImagen__vista" />
                  : <span className="tjImagen__hueco">Sin imagen</span>}

                <div className="tjImagen__acc">
                  <label className="tjImagen__boton">
                    {subiendo ? 'Subiendo…' : (editando.imagenUrl ? 'Cambiar imagen' : 'Elegir imagen')}
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden
                      disabled={subiendo}
                      onChange={(ev) => subirImagen(ev.target.files?.[0])} />
                  </label>

                  {editando.imagenUrl &&
                    <button type="button" className="tjImagen__quitar"
                      onClick={() => setEditando({ ...editando, imagenUrl: '' })}>Quitar</button>}

                  <small>Vertical, 600 × 780 px. La tarjeta la usa de fondo y el texto va encima.</small>
                </div>
              </div>
            </label>

            <label>Desde
              <input type="date" value={editando.desde || ''}
                onChange={(e) => setEditando({ ...editando, desde: e.target.value })} />
            </label>
            <label>Hasta
              <input type="date" value={editando.hasta || ''}
                onChange={(e) => setEditando({ ...editando, hasta: e.target.value })} />
            </label>
          </div>

          <div className="tjPaleta">
            <span>Color</span>
            {COLORES.map((c) => (
              <button key={c} type="button" style={{ background: c }}
                className={editando.color === c ? 'act' : ''}
                onClick={() => setEditando({ ...editando, color: c })} aria-label={c} />
            ))}
          </div>

          <div className="tjPaleta">
            <span>Ícono</span>
            {ICONOS.map((i) => (
              <button key={i} type="button" className={`tjIco ${editando.icono === i ? 'act' : ''}`}
                onClick={() => setEditando({ ...editando, icono: i })}>{i}</button>
            ))}
          </div>

          <label className="tjActiva">
            <input type="checkbox" checked={!!editando.activo}
              onChange={(e) => setEditando({ ...editando, activo: e.target.checked })} />
            Mostrarla en el app
          </label>

          <div className="tjForma__pie">
            <button type="submit" className="tjBtn tjBtn--fuerte" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="tjBtn" onClick={() => setEditando(null)}>Cancelar</button>
          </div>
        </form>
      )}
    </LayoutPages>
  );
};

export default TarjetasPage;
