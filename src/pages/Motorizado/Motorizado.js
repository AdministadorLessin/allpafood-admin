import { useState, useEffect } from "react";

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


const API_KEY = 'AIzaSyA2RQfrTKIQNzphsuq06Czy5u-BH2XBFsI';

const PageMotorizado = (props) => {

    const { token,planInfo,baseUrl } = useAuthContext();
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

                <div className="mhItem icoProfile">
                    <SentimentSatisfiedAltIcon />
                    <span>Hola {infoMot?.profile?.name}</span>
                </div>
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
                    apiKey={API_KEY}
                    libraries={['marker', 'routes', 'geometry']}
                >
                    <Map
                        mapId={'8f1d9e42cf8834cfb88cbcd3'}
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
