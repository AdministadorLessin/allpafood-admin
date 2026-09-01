// Hook minimo para manejar el estado de una carga. Evita repetir el trio
// loading/error/ready en cada pagina.
//
//   const { status, start, done, fail } = useDataStatus();
//   const getLista = () => { start(); axios.get(...).then(r => { setLista(r.data.data); done(); }).catch(fail); }

import { useCallback, useState } from 'react';

import { STATUS } from './DataState';

export default function useDataStatus(initial = STATUS.loading) {
  const [status, setStatus] = useState(initial);

  const start = useCallback(() => setStatus(STATUS.loading), []);
  const done = useCallback(() => setStatus(STATUS.ready), []);
  const fail = useCallback(() => setStatus(STATUS.error), []);

  return { status, setStatus, start, done, fail };
}
