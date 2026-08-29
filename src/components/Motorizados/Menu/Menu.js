import './Menu.scss';

import CloseIcon from '@mui/icons-material/Close';
import logoAllpa from '../../../assets/img/allpafood_logo.png';

import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useEffect } from 'react';

const MotorizadoMenu = ({ menuOpen, handleCloseMenu, ordList, setOrdList }) => {

  const { token, baseUrl } = useAuthContext();

  const sendComplete = (item,indxObj) =>{
    axios.post(baseUrl+'delivery/motorized/complete-order',
        [item],
        {
          headers: {"Authorization" : `Bearer ${token}`} 
        }
    ).then((resp)=>{
      //console.log(resp);
      setOrdList(prev =>
        prev.map((user, index) =>
          index === indxObj ? { ...user, status: 'COMPLETED' } : user
        )
      );
    }).catch((error) =>{
      console.log(error);
    })
  }

  useEffect(()=>{
    
  },[sendComplete])

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
      {ordList && ordList.length && ordList.length > 0 &&
        <div className="motMenuList">
          {ordList.map((item,indx)=>(
            <div className="motMenuItem">
              <p>
                {item.name} {item.lastName}
              </p>
              {item.status === 'IN PROGRESS' ?
                <div className="inlineFlex">
                  <div className="motBtn" onClick={()=>sendComplete(item.id,indx)}>
                    Entregado
                  </div>
                </div>
              : item.status === "COMPLETED" ?
                <CheckCircleIcon/>
              :
                <ErrorIcon/>
              }
              { 
                // no entregado 
              }
            </div>
          ))}
        </div>
      }
      
    </div>
  )
};

export default MotorizadoMenu;
