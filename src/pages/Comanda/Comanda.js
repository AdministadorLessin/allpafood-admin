import React,{useState,useEffect,useCallback,useRef} from "react";

import moment from 'moment'
import 'moment/locale/es';

import icoArrow from '../../assets/img/icon_arrow.png';

import './Comanda.scss';

import logoAllpa from '../../assets/img/isotipo_allpafood.png';
import { useAuthContext } from './../../context/authContext';
import axios from 'axios';
import { useWebSocketService } from './../../socket';


import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import BackdropApp from './../../components/util/backdrop/backdrop';

const ComandaPage = (props) => {

    moment.locale('es');

    const [today,setToday] = useState(moment().format('MMMM Do YYYY, h:mm:ss a'));


    const [comanda,setComanda] = useState();
    const { token, baseUrl } = useAuthContext();
    
    const getWeekDays = () => {
        const now = moment();

        let monday;

        const day = now.isoWeekday(); // 1=Lunes ... 7=Domingo
        const hour = now.hour();

        // Sábado o domingo -> siguiente semana
        if (day >= 6) {
            monday = now.clone().add(1, "week").startOf("isoWeek");
        }
        // Viernes después de las 6:00 pm -> siguiente semana
        else if (day === 5 && hour >= 18) {
            monday = now.clone().add(1, "week").startOf("isoWeek");
        }
        // Lunes a viernes antes de las 6 pm -> semana actual
        else {
            monday = now.clone().startOf("isoWeek");
        }

        return Array.from({ length: 5 }, (_, index) => ({
            label: monday.clone().add(index, "days").format("dddd"),
            date: monday.clone().add(index, "days").format("YYYY-MM-DD"),
            full: monday.clone().add(index, "days").format("DD/MM/YYYY")
        }));
    };

    const weekDaysData = getWeekDays();
    const todayDate = moment().format("YYYY-MM-DD");
    const initialSelectedDay =
        weekDaysData.find(day => day.date === todayDate)?.date ??
        weekDaysData[0].date;

    const [weekDays] = useState(weekDaysData);
    const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

    const selectedDayRef = useRef(selectedDay);
    
    const [message, setMessage] = useState('');
    const stompClientRef = useRef(null);

    const getComanda = (date) => {
        axios.get(
            `${baseUrl}admin/command/dashboard?date=${date}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((resp)=>{
            
            setComanda(resp.data.data);
        })
        .catch((err)=>{
            console.log(err);
        });
    }

    const abreviarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return "";

    // 1. Limpiar espacios de más y separar por palabras
    const palabras = nombreCompleto.trim().split(/\s+/);

    // Si solo hay una palabra (ej. "Diana"), la devuelve tal cual
    if (palabras.length <= 1) return nombreCompleto;

    // 2. Mantener la primera palabra intacta
    const primerNombre = palabras[0];

    // 3. Convertir el resto de palabras en inicial + punto
    const iniciales = palabras
        .slice(1)
        .map(palabra => `${palabra.charAt(0).toUpperCase()}.`)
        .join(" ");

    // 4. Unir el primer nombre con las iniciales
    return `${primerNombre} ${iniciales}`;
    };

    
    useEffect(() => {
        selectedDayRef.current = selectedDay;
    }, [selectedDay]);

    useEffect(() => {
        getComanda(selectedDay);
    }, [selectedDay]);

    useEffect(()=>{
        const socket = new SockJS(baseUrl+'ws');

        try {
            const stompClient = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                debug: (str) => {
                    console.log(str);
                },
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    stompClient.subscribe('/topic/orders/notifications', (response) => {
                        //console.log('Received message:', response.body);
                        getComanda(selectedDayRef.current);
                        setMessage(JSON.parse(response.body).content);
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });

            stompClient.activate();
            stompClientRef.current = stompClient;

            //getComanda();
            return () => {
                stompClient.deactivate();
            };
        } catch (error) {
            console.log('=============>',error)
        }


    },[]);


    return (
        <div className={'inlineFlex comandaPage'}>
            
            <BackdropApp />


            <div className="inlineFlex comandaPageCont">
                <div className="inlineFlex comandaHeader">



                    <div className="chDay">
                        <h3>{today}</h3>
                    </div>
                    <figure>
                        <img src={logoAllpa} alt="" />
                    </figure>
                    <div className=" weekTabs">
                        {weekDays.map((day) => (
                            <button
                                key={day.date}
                                className={selectedDay === day.date ? "active" : ""}
                                onClick={() => setSelectedDay(day.date)}
                            >
                                <span>{day.label}</span>
                                {false &&
                                    <small>{day.full}</small>
                                }
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="inlineFlex comandaBody">



                    {message}
                    <div className="comandaPanel comandaPanelPlatos">
                        <h3>Platos</h3>
                        {comanda?.general?.length > 0 &&
                            <div className="comandaPanelList">
                                <h4>Allpafood</h4>
                                <ul>
                                    {comanda.general.map((item)=>{
                                        if(item.menuType === 'lunch'){
                                            return (
                                                <li>
                                                    <p>{item.menuName}</p>
                                                    <img src={icoArrow} alt="" />
                                                    <strong>{item.count}</strong>
                                                </li>
                                            )
                                        }

                                    })}
                                </ul>
                            </div>
                         }
                    </div>
                    <div className="comandaPanel  comandaPanelComp">
                        <h3>Complementos</h3>
                        {comanda?.complements?.length > 0  &&
                            <div className="comandaPanelList">
                                <h4>Drinks</h4>
                                <ul>
                                    {comanda.complements.map((item)=>{
                                        if(item.menuType === 'drinks'){
                                            return (
                                                <li>
                                                    <p>{item.menuName}</p>
                                                    <img src={icoArrow} alt="" />
                                                    <strong>{item.count}</strong>
                                                </li>
                                            )
                                        }

                                    })}
                                </ul>
                            </div>
                         }
                        {comanda?.complements?.length > 0 &&
                            <div className="comandaPanelList">
                                <h4>Snacks</h4>
                                <ul>
                                    {comanda.complements.map((item)=>{
                                        if(item.menuType === 'snacks'){
                                            return (
                                                <li>
                                                    <p>{item.menuName}</p>
                                                    <img src={icoArrow} alt="" />
                                                    <strong>{item.count}</strong>
                                                </li>
                                            )
                                        }

                                    })}
                                </ul>
                            </div>
                         }
                    </div>
                    <div className="comandaPanel comandaPanelRestricciones">
                        <h3>Restricciones</h3>
                        {comanda?.restrictions?.length > 0 &&
                            <div className="comandaPanelRest">
                                <ul>
                                    {comanda.restrictions
                                    .filter(item => item.restriction !== 'ninguna')
                                    .map((item) => (
                                        <li key={item.id}>
                                            <div className="line">
                                                <p><strong>{abreviarNombre(item.fullName)}</strong> - {item.restriction}</p>
                                            </div>
                                            <div className="line linePlatos">
                                                <p>
                                                    {item.menus.map((ritem) => (
                                                        <span key={ritem.id}>{ritem.name} </span>
                                                    ))}
                                                </p>
                                            </div>

                                        </li>
                                    ))}

                                </ul>
                            </div>
                         }
                    </div>
                </div>

            </div>
        </div>
    )
};

export default ComandaPage;
