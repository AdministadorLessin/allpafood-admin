import { useEffect, useState } from 'react';
import axios from 'axios';

import { useAuthContext } from '../../context/authContext';
import './BloqueEmpresas.scss';

/* Misma limpieza que usa el tablero de cocina para el nombre del plato, para
   que los dos lados crucen por el mismo texto. */
const limpio = (n) => String(n || '').replace(/\s+/g, ' ').replace(/\.$/, '').trim();

const ETIQUETA = {
  starter: 'Entradas',
  drinks: 'Bebidas',
  snacks: 'Snacks',
  breakfast: 'Desayunos',
  dinner: 'Cenas',
};

/**
 * Lo que sale para cada empresa, dentro de la comanda del dia.
 *
 * La cocina arma todo junto —el conteo general no cambia—, pero el que empaca
 * necesita saber cuantos tapers van a la misma oficina y con que opcion cada
 * uno. Sin esto habia que contar a mano cruzando la lista de clientes.
 *
 * El numero de opcion NO se calcula aqui: se toma del tablero de cocina. Si
 * cada pantalla numerara por su cuenta terminarian diciendo cosas distintas,
 * que es exactamente lo que paso cuando la comanda decia "opcion 1" y el CSV
 * exportado decia "opcion 2".
 */
const BloqueEmpresas = ({ fecha, platos }) => {
  const { token, baseUrl } = useAuthContext();
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    if (!fecha) return;
    axios.get(`${baseUrl}admin/empresas/comanda?fecha=${fecha}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setFilas(r.data?.data ?? r.data ?? []))
      .catch(() => setFilas([]));
  }, [fecha, token, baseUrl]);

  if (!filas.length) return null;

  const opcionDe = (nombre) =>
    (platos || []).find((p) => limpio(p.nombre) === limpio(nombre))?.op;

  // Una entrada por empresa, conservando el orden que trajo el servidor.
  const empresas = [];
  filas.forEach((f) => {
    let e = empresas.find((x) => x.id === f.empresaId);
    if (!e) {
      e = { id: f.empresaId, nombre: f.empresa, color: f.color, principales: [], extras: [] };
      empresas.push(e);
    }
    const cantidad = Number(f.cantidad) || 0;
    if (f.tipo === 'lunch' || f.tipo === 'dinner') {
      e.principales.push({ plato: f.plato, cantidad, op: opcionDe(f.plato), tipo: f.tipo });
    } else {
      e.extras.push({ tipo: f.tipo, plato: f.plato, cantidad });
    }
  });

  return (
    <section className="cmEmp">
      <h3 className="cmEmp__tit">Para empresas</h3>

      <div className="cmEmp__lista">
        {empresas.map((e) => {
          const total = e.principales.reduce((s, p) => s + p.cantidad, 0);
          return (
            <article className="cmEmp__card" key={e.id} style={{ '--emp': e.color || '#3CFB9F' }}>
              <header>
                <b>{e.nombre}</b>
                <span>{total} {total === 1 ? 'almuerzo' : 'almuerzos'}</span>
              </header>

              <ul className="cmEmp__platos">
                {e.principales
                  .slice()
                  .sort((a, b) => (a.op || 99) - (b.op || 99))
                  .map((p) => (
                    <li key={`${p.tipo}-${p.plato}`}>
                      <span className="cmEmp__op">{p.op ? `Opción ${p.op}` : p.tipo === 'dinner' ? 'Cena' : '—'}</span>
                      <span className="cmEmp__nom">{limpio(p.plato)}</span>
                      <span className="cmEmp__cant">{p.cantidad}</span>
                    </li>
                  ))}
              </ul>

              {e.extras.length > 0 &&
                <p className="cmEmp__extras">
                  {e.extras.map((x) => (
                    <span key={`${x.tipo}-${x.plato}`}>
                      <i>{ETIQUETA[x.tipo] || x.tipo}</i> {x.cantidad} · {limpio(x.plato)}
                    </span>
                  ))}
                </p>}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default BloqueEmpresas;
