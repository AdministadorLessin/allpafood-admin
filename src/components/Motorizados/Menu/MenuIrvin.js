
import './MenuIrvin.scss';

import CloseIcon from '@mui/icons-material/Close';
import logoAllpa from '../../../assets/img/allpafood_logo.png';

import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ReportIcon from '@mui/icons-material/Report';
import Chip from '@mui/material/Chip';

const MotorizadoMenuIrvin = ({ menuOpen, handleCloseMenu, pointsList,updateRuta }) => {

  const { token, baseUrl } = useAuthContext();

  const [pointListDom,setPointListDom] = useState([]);
  const [stado,setStado] = useState({
    reportados:0,
    pendiente:0,
    entregado:0,
    total:0,
  });

  useEffect(()=>{
    const coordenadasOrdenadas = [...pointsList].sort((a, b) => {
        // enviar los que no tienen order al final
        if (a.order == null) return 1;
        if (b.order == null) return -1;

        return a.order - b.order;
    });
    setPointListDom(coordenadasOrdenadas);
  
    const pendienteTmp = coordenadasOrdenadas.filter(item => item.state === 'pendiente').length;
    const EntregadoTmp = coordenadasOrdenadas.filter(item => item.state === 'entregado').length;
    const reportadoTmp = coordenadasOrdenadas.filter(item => item.state === 'reportado').length;

    setStado({
      reportados:reportadoTmp,
      pendiente:pendienteTmp,
      entregado:EntregadoTmp,
      total:pendienteTmp + EntregadoTmp
    })
  },[pointsList]);

  return (
    <div className={menuOpen ? "irvMenuCont irvMenuContAct" : "irvMenuCont"}>
      <div className="titleAllpa">
        <figure>
          <img src={logoAllpa} alt="" />
        </figure>
        <div className="irvMenuClose" onClick={handleCloseMenu}>
          <CloseIcon />
        </div>
      </div>
      <div className="inlineBlock irvMenuStado">
        <p>Estado:</p>
        <Chip variant="outlined" size="small" label={"Total - " + stado.total} color="primary" />
        <Chip variant="outlined" size="small" label={"Pendientes - " + stado.pendiente } color="warning" />
        <Chip variant="outlined" size="small" label={"Entregados - " + stado.entregado } color="success" />
        <Chip variant="outlined" size="small" label={"Reportados - " + stado.reportados } color="error" />

      </div>
      {pointListDom && pointListDom.length && pointListDom.length > 0 &&
        <div className="irvMenuList">

          {pointListDom.map((item,indx)=>(
            <div 
              className={ item.state === 'pendiente' ? 'irvMenuItem irvMenuItemPendiente' : 
                          item.state === 'entregado' ? 'irvMenuItem irvMenuItemEntregado' : 
                          item.state === 'reportado' && 'irvMenuItem irvMenuItemReportado'
                        }
            >
              <p>
                {item.name}
              </p>
              <div className="irvBtn">
                <div 
                  className="check"
                  onClick={()=>updateRuta(item.id,'entregado')}
                >
                  <CheckIcon/>
                </div>
                <div 
                  className="rep"
                  onClick={()=>updateRuta(item.id,'reportado')}
                >
                  <ReportIcon/>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
      
    </div>
  )
};

export default MotorizadoMenuIrvin;
