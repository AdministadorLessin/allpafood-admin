import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';
import { useAuthContext } from '../../context/authContext';
import './Accesos.scss';

const ROLES = [
  { valor: 'ADMIN', etiqueta: 'CEO', detalle: 'Ve todo, incluidas ventas y cifras del negocio' },
  { valor: 'COORDINADOR', etiqueta: 'Coordinador / Vendedor', detalle: 'Operación del día, sin ver dinero' },
  { valor: 'DELIVERY', etiqueta: 'Motorizado', detalle: 'Solo su ruta del día' },
];

/**
 * Quien entra al panel y que ve.
 *
 * Hasta ahora habia una sola cuenta con acceso a todo: la misma persona que
 * mira el ingreso del mes abria la comanda. Con un vendedor o un coordinador
 * dentro eso deja de ser aceptable, y la separacion tiene que poder verse y
 * cambiarse desde aqui, no pidiendola por WhatsApp.
 */
const AccesosPage = () => {
  const { token, baseUrl, planInfo } = useAuthContext();

  const [usuarios, setUsuarios] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState('');
  const [creando, setCreando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [forma, setForma] = useState({
    nombre: '', apellido: '', celular: '', correo: '', rol: 'COORDINADOR', clave: '',
  });

  /* Editar una cuenta. Antes los datos de la persona estaban en una pantalla
     y los distritos del motorizado en otra: es la misma cuenta. */
  const [editando, setEditando] = useState(null);

  /* El panel de edicion se dibuja debajo de la lista de cuentas. Con diez
     cuentas queda fuera de pantalla, asi que al tocar "Editar" no pasaba nada
     visible y parecia trabado. Ahora la pantalla baja sola hasta el. */
  const panelEdicion = useRef(null);

  useEffect(() => {
    if (editando && panelEdicion.current) {
      panelEdicion.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editando?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cab = { headers: { Authorization: `Bearer ${token}` } };

  const cargar = () => {
    setCargando(true);
    Promise.all([
      axios.get(`${baseUrl}admin/accesos`, cab).then((r) => r.data?.data ?? r.data ?? []),
      axios.get(`${baseUrl}admin/accesos/permisos`, cab).then((r) => r.data?.data ?? r.data ?? []),
    ])
      .then(([u, p]) => { setUsuarios(u); setPermisos(p); setError(null); })
      .catch(() => setError('No pudimos cargar los accesos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const crear = (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setAviso('');
    axios.post(`${baseUrl}admin/accesos`, forma, cab)
      .then(() => {
        setAviso(`Cuenta creada. Dale el celular y la clave a ${forma.nombre || 'la persona'} `
          + 'y que la cambie al entrar.');
        setForma({ nombre: '', apellido: '', celular: '', correo: '', rol: 'COORDINADOR', clave: '' });
        setCreando(false);
        cargar();
      })
      .catch((err) => setError(
        err?.response?.data?.message || 'No pudimos crear la cuenta.'))
      .finally(() => setGuardando(false));
  };

  const vacio = (v) => v === '' || v === null || v === undefined;

  const guardarEdicion = () => {
    setGuardando(true);
    setError(null);
    axios.put(`${baseUrl}admin/accesos/${editando.id}`, {
      nombre: editando.nombreSolo,
      apellido: editando.apellido,
      celular: editando.celular,
      correo: editando.correo,
      distritos: editando.distritos,
      cupo: vacio(editando.cupo) ? null : Number(editando.cupo),
      orden: vacio(editando.orden) ? null : Number(editando.orden),
      /* Solo viaja si se escribio algo: un campo vacio no le cambia la clave
         a nadie por accidente. */
      clave: editando.clave ? editando.clave : null,
    }, cab)
      .then(() => {
        setAviso(editando.clave
          ? `Listo. Su usuario es ${editando.celular} y ya puede entrar con la clave nueva.`
          : 'Cuenta actualizada.');
        setEditando(null);
        cargar();
      })
      .catch((err) => setError(err?.response?.data?.message || 'No pudimos guardar.'))
      .finally(() => setGuardando(false));
  };

  const cambiarRol = (u, rol) => {
    setError(null);
    axios.put(`${baseUrl}admin/accesos/${u.id}/rol`, { rol }, cab)
      .then(() => { setAviso(`${u.nombre || 'La cuenta'} ahora es ${etiqueta(rol)}.`); cargar(); })
      .catch((err) => setError(err?.response?.data?.message || 'No pudimos cambiar el rol.'));
  };

  const cambiarEstado = (u) => {
    setError(null);
    const activo = Number(u.activo) !== 1;
    axios.put(`${baseUrl}admin/accesos/${u.id}/estado`, { activo }, cab)
      .then(() => {
        setAviso(`${u.nombre || 'La cuenta'} quedó ${activo ? 'activa' : 'sin acceso'}.`);
        cargar();
      })
      .catch((err) => setError(err?.response?.data?.message || 'No pudimos cambiar el estado.'));
  };

  const etiqueta = (rol) => ROLES.find((r) => r.valor === rol)?.etiqueta || rol;

  return (
    <LayoutPages>
      <TitlePage title={'Accesos:'} />

      {error && <p className="acError">{error}</p>}
      {aviso && <p className="acAviso">{aviso}</p>}

      <div className="acBarra">
        <p className="acBarra__txt">
          Quién entra al panel y qué puede ver. Solo tú, como CEO, administras esto.
        </p>
        <button className="acBtn" onClick={() => setCreando(!creando)}>
          {creando ? 'Cancelar' : 'Dar acceso a alguien'}
        </button>
      </div>

      {creando && (
        <form className="acForma" onSubmit={crear}>
          <div className="acForma__campos">
            <input placeholder="Nombre" value={forma.nombre}
              onChange={(e) => setForma({ ...forma, nombre: e.target.value })} />
            <input placeholder="Apellido" value={forma.apellido}
              onChange={(e) => setForma({ ...forma, apellido: e.target.value })} />
            <input placeholder="Celular (con el que entra)" value={forma.celular}
              onChange={(e) => setForma({ ...forma, celular: e.target.value })} />
            <input placeholder="Correo (opcional)" value={forma.correo}
              onChange={(e) => setForma({ ...forma, correo: e.target.value })} />
            <select value={forma.rol} onChange={(e) => setForma({ ...forma, rol: e.target.value })}>
              {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
            </select>
            <input placeholder="Clave temporal (mín. 8)" value={forma.clave}
              onChange={(e) => setForma({ ...forma, clave: e.target.value })} />
          </div>
          <p className="acForma__nota">
            {ROLES.find((r) => r.valor === forma.rol)?.detalle}
          </p>
          <button className="acBtn" type="submit" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
      )}

      <div className="acTabla">
        {cargando && <p className="acVacio">Cargando…</p>}
        {!cargando && usuarios.length === 0 && <p className="acVacio">No hay cuentas del panel.</p>}

        {usuarios.map((u) => {
          const activo = Number(u.activo) === 1;
          const yo = u.id === planInfo?.userId;
          return (
            <div className={`acFila ${activo ? '' : 'acFila--off'}`} key={u.id}>
              <div className="acFila__quien">
                <b>{u.nombre || '(sin nombre)'}{yo && <span className="acYo">tú</span>}</b>
                <small>{u.celular}{u.correo ? ` · ${u.correo}` : ''}</small>
              </div>

              <select
                className="acRol"
                value={u.rol}
                disabled={yo}
                title={yo ? 'No puedes cambiarte el rol a ti mismo' : 'Cambiar el rol'}
                onChange={(e) => cambiarRol(u, e.target.value)}
              >
                {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
              </select>

              <span className="acDesde">
                {u.desde ? `desde ${moment(u.desde).format('DD/MM/YYYY')}` : ''}
              </span>

              <div className="acAcciones">
                <button className="acEditar" onClick={() => setEditando({ ...u })}>
                  Editar
                </button>
                <button
                  className={`acEstado ${activo ? 'acEstado--on' : ''}`}
                  disabled={yo}
                  onClick={() => cambiarEstado(u)}
                  title={yo ? 'No puedes desactivar tu propia cuenta' : ''}
                >
                  {activo ? 'Con acceso' : 'Sin acceso'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editando && (
        <div className="acEdicion" ref={panelEdicion}>
          <h3>Editar a {editando.nombre || 'esta cuenta'}</h3>
          <div className="acEdicion__campos">
            <input placeholder="Nombre" value={editando.nombreSolo || ''}
              onChange={(e) => setEditando({ ...editando, nombreSolo: e.target.value })} />
            <input placeholder="Apellido" value={editando.apellido || ''}
              onChange={(e) => setEditando({ ...editando, apellido: e.target.value })} />
            <input placeholder="Celular" value={editando.celular || ''}
              onChange={(e) => setEditando({ ...editando, celular: e.target.value })} />
            <input placeholder="Correo" value={editando.correo || ''}
              onChange={(e) => setEditando({ ...editando, correo: e.target.value })} />
          </div>

          {/* La clave. Hasta ahora esta pantalla editaba todo menos lo unico
              que la gente olvida, y cada olvido terminaba en la base de datos. */}
          <p className="acEdicion__nota">
            Su usuario para entrar es el celular <b>{editando.celular || '—'}</b> o su correo.
            Deja la clave en blanco si no quieres cambiarla.
          </p>
          <div className="acEdicion__campos">
            <input className="acEdicion__ancho" placeholder="Clave nueva (mín. 8 caracteres)"
              value={editando.clave || ''}
              onChange={(e) => setEditando({ ...editando, clave: e.target.value })} />
          </div>

          {/* Los distritos y el cupo solo existen para un motorizado. */}
          {editando.rol === 'DELIVERY' && (
            <>
              <p className="acEdicion__nota">
                Distritos que cubre, separados por coma. Es lo que el tablero usa
                para proponerle clientes.
              </p>
              <div className="acEdicion__campos">
                <input className="acEdicion__ancho" placeholder="Miraflores,San Isidro,Surquillo"
                  value={editando.distritos || ''}
                  onChange={(e) => setEditando({ ...editando, distritos: e.target.value })} />
                <input placeholder="Cupo por día" type="number" value={editando.cupo ?? ''}
                  onChange={(e) => setEditando({ ...editando, cupo: e.target.value })} />
                {/* El numero con el que le hablas por radio. El tablero de
                    rutas ordena las columnas por esto. */}
                <input placeholder="N° de moto" type="number" min="1" max="99"
                  value={editando.orden ?? ''}
                  onChange={(e) => setEditando({ ...editando, orden: e.target.value })} />
              </div>
            </>
          )}

          <div className="acEdicion__pie">
            <button className="acBtn" onClick={guardarEdicion} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button className="acEditar" onClick={() => setEditando(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* La tabla de permisos no es decorativa: es la respuesta a "¿qué ve el
          vendedor exactamente?", que hoy había que ir a buscar al código. */}
      <h3 className="acTitulo">Qué ve cada rol</h3>
      <div className="acPermisos">
        <div className="acPermisos__cab">
          <span>Sección</span>
          <b>CEO</b><b>Coordinador</b><b>Motorizado</b>
        </div>
        {permisos.map((p) => (
          <div className="acPermisos__fila" key={p.seccion}>
            <span>{p.seccion}</span>
            <b className={p.ADMIN ? 'si' : 'no'}>{p.ADMIN ? '✓' : '—'}</b>
            <b className={p.COORDINADOR ? 'si' : 'no'}>{p.COORDINADOR ? '✓' : '—'}</b>
            <b className={p.DELIVERY ? 'si' : 'no'}>{p.DELIVERY ? '✓' : '—'}</b>
          </div>
        ))}
      </div>
    </LayoutPages>
  );
};

export default AccesosPage;
