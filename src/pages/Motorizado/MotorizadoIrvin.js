import { useState, useEffect } from "react";

import axios from 'axios';

import { useAuthContext } from '../../context/authContext';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';

import './motorizado.scss';
import moment from 'moment';

import icoMarkerPin from '../../assets/img/ico_marker_pin.png';
import icoMarkerPin2 from '../../assets/img/ico_marker_pin2.png';

import icoMarkerError from '../../assets/img/ico_marker_error.png';
import icoMarkerWarning from '../../assets/img/ico_marker_warning.png';
import icoMarkerSusses from '../../assets/img/ico_marker_susses.png';
import icoMarkerPrimary from '../../assets/img/ico_marker_primary.png';

import logoAllpa from '../../assets/img/isotipo_allpafood.png';

import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MotorizadoMenuIrvin from "../../components/Motorizados/Menu/MenuIrvin";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CallIcon from '@mui/icons-material/Call';
import CheckIcon from '@mui/icons-material/Check';
import ReportIcon from '@mui/icons-material/Report';
import RoomIcon from '@mui/icons-material/Room';

import MotorizadoDirectionsIrvin from "../../components/Motorizados/Directions/DirectionsIrvin";


const API_KEY = 'AIzaSyA2RQfrTKIQNzphsuq06Czy5u-BH2XBFsI';

const PageMotorizadoIrvin = (props) => {

    const { token,planInfo,baseUrl } = useAuthContext();
    const [ordList,setOrdList] = useState();
    const [startRoute, setStartRoute] = useState(false);
    const [menuOpen,setMenuOpen] = useState(false);

    const [selectedMarker, setSelectedMarker] = useState(null);
    const centralDelivery = {
        lat: -12.233126815463315, 
        lng: -76.91805792653477
    }

    const [coordenadasList,setCoordenadasList] = useState([]);

    const handleOpenMenu = () =>{
        setMenuOpen(true);
    }

    const handleCloseMenu = () =>{
        setMenuOpen(false);
    }

    const getRutas = () =>{
        
        axios.get('https://www.webing.pe/wp-json/mis-rutas/v1/lista')
            .then((resp)=>{
                console.log('GET ROUTE',resp)
                const listTmp = [];
                const dataTmp = resp?.data;

                if(dataTmp && dataTmp.length){
                    dataTmp.map((item)=>{
                        listTmp.push(
                            {
                                id:item.id,
                                lat:parseFloat(item.acf?.ruta_latitud),
                                lng:parseFloat(item.acf?.ruta_longitud),
                                name:item.acf?.ruta_nombre,
                                phone:item.acf?.ruta_telefono,
                                state:item.acf?.ruta_estado
                            }
                        )
                    })
                }
                setCoordenadasList(listTmp)

            }).catch((errr)=>{
                console.log(errr)
            })
    }

    const updateRuta = (id,action) =>{
        axios.post('https://www.webing.pe/wp-json/mis-rutas/v1/actualizar-estado',{
            id: id,
            estado: action
        })
            .then((resp)=>{
                console.log('UPDATE ROUTE',resp)
                setCoordenadasList(prev => 
                    prev.map(item => item.id === id ? { ...item, state: action } : item)
                );
            }).catch((error)=>{
                console.log(error)
            })
    }

    useEffect(()=>{
        getRutas();
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
                    <span>Hola Irvin</span>
                </div>
            </div>

            <MotorizadoMenuIrvin 
                setStartRoute={setStartRoute} 
                menuOpen={menuOpen} 
                handleCloseMenu={handleCloseMenu}
                pointsList={coordenadasList}
                updateRuta={updateRuta}
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
                        defaultZoom={18}
                        className={'dmResumenMapStyle'}
                        defaultCenter={{lat: -12.164924, lng: -76.955978}}
                        gestureHandling={'greedy'}
                        disableDefaultUI
                    >
                        <AdvancedMarker position={centralDelivery}>
                            <img width={40} height={49.68} src={icoMarkerPin} />
                        </AdvancedMarker>

                        {coordenadasList?.map((pos, index) => (
                            <AdvancedMarker
                                key={index}
                                position={pos}
                                onClick={() => setSelectedMarker(pos)}
                            >
                                <img 
                                    width={40} 
                                    height={49.68} 
                                    //src={pos.state === 'entregado'icoMarkerPin2} 
                                    src={ pos.state === 'pendiente' ? icoMarkerWarning : 
                                            pos.state === 'entregado' ? icoMarkerSusses : 
                                            pos.state === 'reportado' ? icoMarkerError :
                                            icoMarkerPin2
                                    }
                                />
                            </AdvancedMarker>
                        ))}

                        {selectedMarker && (
                            <InfoWindow
                                position={selectedMarker}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <div className="markerInfo">
                                    <h4>{selectedMarker.name}</h4>
                                    <div className="inlineFlex btnBox">
                                        {selectedMarker.phone &&
                                            <a
                                                href={'https://api.whatsapp.com/send?phone=51'+selectedMarker.phone}
                                                target="_blank"
                                                className="btnMarker phone"
                                            >
                                                <WhatsAppIcon />
                                            </a>
                                        }
                                        {selectedMarker.phone &&
                                            <a
                                                href={'tel:+51'+selectedMarker.phone}
                                                className="btnMarker phone"
                                            >
                                                <CallIcon />
                                            </a>
                                        }

                                        <div className="btnMarker entregado">
                                            <CheckIcon />
                                        </div>
                                        <div className="btnMarker reportado">
                                            <ReportIcon />
                                        </div>

                                        <a
                                            href={`https://waze.com/ul?ll=${selectedMarker.lat},${selectedMarker.lng}&navigate=yes`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btnMarker waze"
                                        >
                                            <RoomIcon />
                                        </a>
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                        
                        {startRoute && coordenadasList?.length > 0 && (
                            <MotorizadoDirectionsIrvin
                                points={[centralDelivery, ...coordenadasList]}
                            />
                        )}
                    </Map>

                </APIProvider>
            </div>
        </div>
    )
};

export default PageMotorizadoIrvin;
