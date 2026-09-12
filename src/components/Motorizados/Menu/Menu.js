import './Menu.scss';

import { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import logoAllpa from '../../../assets/img/allpafood_logo.png';

import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Lista de puntos del motorizado, con el cierre de cada entrega.
 *
 * Hay dos botones y no uno porque hay dos finales distintos, y el cliente
 * necesita saber cual le toco. Cuando la bolsa queda en recepcion y nadie
 * avisa, el cliente da por hecho que no llego y eso termina en reclamo. Al
 * separarlo en dos botones el aviso sale solo, con el texto que corresponde.
 */
const MotorizadoMenu = ({ menuOpen, handleCloseMenu, ordList, setOrdList }) => {

  const { token, baseUrl } = useAuthContext();

  // El id del pedido que se esta cerrando. Bloquea los dos botones de esa
  // fila: en un celular, en la calle y con una mano, el doble toque es la
  // regla y no la excepcion, y cada toque de mas es un WhatsApp de mas.
  const [cerrando, setCerrando] = useState(null);
  const [error, setError] = useState('');

  const cerrarEntrega = (item, indxObj, endpoint) => {
    if (cerrando !== null) return;
    setCerrando(item);
    setError('');

    axios.post(`${baseUrl}delivery/motorized/${endpoint}`,
        [item],
        { headers: { "Authorization": `Bearer ${token}` } }
    ).then(() => {
      setOrdList(prev =>
        prev.map((user, index) =>
          index === indxObj ? { ...user, status: 'COMPLETED' } : user
        )
      );
    }).catch(() => {
      setError('No se pudo cerrar la entrega. Revisa la señal e intenta de nuevo.');
    }).finally(() => setCerrando(null));
  };

  return (
    <div className={menuOpen ? "motMenuCont motMenuContAct" : "motMenuCont"}>
      <div className="titleAllpa">
        <figure>
          <img src={logoAllpa} alt="" />
        </figure>
        <div className="motClose" onClick={handleCloseMenu}>
          <CloseIcon />
        </div>
      </div>

      {error && <p className="motError">{error}</p>}

      {ordList && ordList.length && ordList.length > 0 &&
        <div className="motMenuList">
          {ordList.map((item,indx)=>(
            <div className="motMenuItem" key={item.id ?? indx}>
              <p>
                {item.name} {item.lastName}
              </p>
              {item.status === 'IN PROGRESS' ?
                <div className="motAcciones">
                  <button
                    className="motBtn"
                    disabled={cerrando !== null}
                    onClick={()=>cerrarEntrega(item.id,indx,'complete-order')}
                  >
                    {cerrando === item.id ? 'Enviando…' : 'Entregado'}
                  </button>
                  <button
                    className="motBtn motBtn--recepcion"
                    disabled={cerrando !== null}
                    onClick={()=>cerrarEntrega(item.id,indx,'reception-order')}
                  >
                    En recepción
                  </button>
                </div>
              : item.status === "COMPLETED" ?
                <CheckCircleIcon/>
              :
                <ErrorIcon/>
              }
            </div>
          ))}
        </div>
      }

    </div>
  )
};

export default MotorizadoMenu;
