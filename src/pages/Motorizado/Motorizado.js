import { useState, useEffect } from "react";
import { useNavigate } from 'react-router';

import axios from 'axios';

import { useAuthContext } from '../../context/authContext';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin
} from '@vis.gl/react-google-maps';

import './motorizado.scss';
import moment from 'moment';

import icoMarkerPin from '../../assets/img/ico_marker_pin.png';
import icoMarkerPin2 from '../../assets/img/ico_marker_pin2.png';
import MotorizadoDirections from './../../components/Motorizados/Directions/Directions';
import MotorizadoMenu from './../../components/Motorizados/Menu/Menu';

import logoAllpa from '../../assets/img/isotipo_allpafood.png';

import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import { MAPS_KEY, MAPS_ID } from '../../config';



const PageMotorizado = (props) => {

    const { token,planInfo,baseUrl,setToken,setPlanInfo } = useAuthContext();
    const navigate = useNavigate();

    /* Cerrar sesion no existia en esta pantalla. La cabecera del motorizado es
       propia —no la del panel— y la opcion vivia solo alla, asi que el
       motorizado que entraba en un telefono prestado, o el que se equivocaba
       de cuenta, no tenia forma de salir. */
    const [cuentaAbierta,setCuentaAbierta] = useState(false);

    const cerrarSesion = () => {
        window.localStorage.removeItem('aftkn');
        window.localStorage.removeItem('inf');
        setPlanInfo(null);
        setToken();
        navigate('/ingresar');
    };
    const [ordList,setOrdList] = useState();
    const [startRoute, setStartRoute] = useState(false);
    const [menuOpen,setMenuOpen] = useState(false);
    const [infoMot,setInfoMot] = useState(planInfo);
    const centralDelivery = {
        lat: -12.11409204198735, 
        lng: -76.97328958749658
    }

    const [coordenadasList,setCoordenadasList] = useState();


    const getOrders = () =>{
        axios.get(baseUrl+'delivery/motorized/find-my-orders?date='+moment().format("YYYY-MM-DD"),
                {headers: {"Authorization" : `Bearer ${token}`}}
            )
            .then((resp)=>{
                //console.log('==>',resp.data.data);
                const listCoordTmp =  [];
                const listOrders = [];
                if(resp.data.data){
                    resp.data.data.map((item)=>{

                        const lat = item.orderEntity.deliveryPoint.geoLocation.latitude;
                        const lng = item.orderEntity.deliveryPoint.geoLocation.longitude;
                        
                        const userName = item.userProfile.name;
                        const userLastName= item.userProfile.lastname;
                        const userId = item.orderEntity.id;
                        const statusOrder = item.orderEntity.status

                        listCoordTmp.push({lat:lat,lng:lng});
                        listOrders.push({
                            name:userName,
                            lastName: userLastName,
                            id: userId,
                            status:statusOrder
                        })
                        
                    })
                }
                setCoordenadasList(listCoordTmp);
                setOrdList(listOrders);
            }).catch((errr)=>{
                console.log(errr);
            })
    }

    const handleOpenMenu = () =>{
        setMenuOpen(true);
    }

    const handleCloseMenu = () =>{
        setMenuOpen(false);
    }

    useEffect(()=>{
        //console.log(planInfo)
        console.log('el dia de hoy es',moment().format("YYYY-MM-DD"))
        getOrders();
    },[])

    return (
        <div className="inlineFlex motorizadoPage">

            <div className="motorizadoHeader">
                <div className="mhItem icoHam" onClick={handleOpenMenu}>
                    <NotificationsNoneIcon />
                    <span>Ordenes</span>
                </div>

                <figure>
                    <img src={logoAllpa} alt="" />
                </figure>

                <button
                    type="button"
                    className="mhItem icoProfile"
                    onClick={() => setCuentaAbierta((v) => !v)}
                    title="Tu cuenta"
                >
                    <SentimentSatisfiedAltIcon />
                    <span>Hola {infoMot?.profile?.name}</span>
                </button>

                {cuentaAbierta && (
                    <>
                        {/* Tapa toda la pantalla para que un toque afuera cierre
                            el menu. En el telefono no hay "clic fuera" comodo de
                            otra forma. */}
                        <div className="motTapa" onClick={() => setCuentaAbierta(false)} />
                        <div className="motCuenta">
                            <p className="motCuenta__quien">
                                {[infoMot?.profile?.name, infoMot?.profile?.lastname]
                                    .filter(Boolean).join(' ') || 'Motorizado'}
                            </p>
                            <button type="button" className="motCuenta__salir" onClick={cerrarSesion}>
                                <LogoutIcon fontSize="small" />
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                )}
            </div>

            <MotorizadoMenu 
                setStartRoute={setStartRoute} 
                menuOpen={menuOpen} 
                ordList={ordList}
                setOrdList={setOrdList}
                handleCloseMenu={handleCloseMenu}
            />

            <div className="inlineFlex motorizadoActions">
                <button
                    className="btnPrimary"
                    onClick={() => setStartRoute(true)}
                >
                    Iniciar Entregas
                </button>
            </div>
            
            <div className="inlineFlex motorizadoMap">
                <APIProvider 
                    apiKey={MAPS_KEY}
                    libraries={['marker', 'routes', 'geometry']}
                >
                    <Map
                        mapId={MAPS_ID}
                        defaultZoom={12}
                        className={'dmResumenMapStyle'}
                        defaultCenter={{lat: -12.043254706755375, lng: -77.00264368149209}}
                        gestureHandling={'greedy'}
                        disableDefaultUI
                    >
                        <AdvancedMarker position={centralDelivery}>
                            {false &&
                                <Pin background="#5AD178" />
                            }
                            <img width={40} height={49.68} src={icoMarkerPin} />

                        </AdvancedMarker>

                        {coordenadasList?.map((pos, index) => (
                            <AdvancedMarker key={index} position={pos}>
                                <img width={40} height={49.68} src={icoMarkerPin2} />
                            </AdvancedMarker>
                        ))}

                        {startRoute && coordenadasList?.length > 0 && (
                        <MotorizadoDirections
                            points={[centralDelivery, ...coordenadasList]}
                        />
                        )}
                    </Map>

                </APIProvider>
            </div>
        </div>
    )
};

export default PageMotorizado;
