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
import DataState from "./../../components/ui/DataState";
import useDataStatus from "./../../components/ui/useDataStatus";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TableroCocina from '../../sections/comanda/TableroCocina';
import { armarCocina } from '../../sections/comanda/cocina';
import BloqueEmpresas from '../../sections/comanda/BloqueEmpresas';
import ConnectionStatus from '../../sections/comanda/ConnectionStatus';
import DispatchTimer from '../../sections/comanda/DispatchTimer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useNavigate } from 'react-router';

const ComandaPage = (props) => {

    moment.locale('es');

    const formatNow = () => {
        const text = moment().format('dddd D [de] MMMM, h:mm:ss a');
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const [today,setToday] = useState(formatNow);

    // La pantalla vive encendida toda la jornada: el reloj tiene que avanzar,
    // si no da la falsa sensacion de que la comanda sigue viva.
    useEffect(() => {
        const timer = setInterval(() => setToday(formatNow()), 1000);
        return () => clearInterval(timer);
    }, []);


    const navigate = useNavigate();
    const [comanda,setComanda] = useState();
    /* Detalle por pedido (el del rotulado): opcion, azucar, doble proteina y
       restricciones. De aqui salen las bebidas sin azucar y la lista de cocina. */
    const [detalle,setDetalle] = useState([]);
    const { token, baseUrl } = useAuthContext();
    const { status, start, done, fail } = useDataStatus();
    
    /* Que semana se abre por defecto. Igual que siempre: la actual, y la
       siguiente desde el viernes a las 6 pm. */
    const semanaInicial = () => {
        const now = moment();
        const day = now.isoWeekday(); // 1=Lunes ... 7=Domingo
        if (day >= 6 || (day === 5 && now.hour() >= 18)) return 1;
        return 0;
    };

    /* Cuantas semanas adelante o atras se esta mirando. Antes no existia: la
       pantalla mostraba cinco dias fijos y no habia forma de ver mas alla.
       Los viernes hay que mirar el lunes siguiente para hacer las compras del
       fin de semana, y eso obligaba a esperar a las 6 pm. */
    const [desfaseSemana, setDesfaseSemana] = useState(semanaInicial());

    const getWeekDays = (desfase = 0) => {
        const monday = moment().add(desfase, "week").startOf("isoWeek");

        return Array.from({ length: 5 }, (_, index) => ({
            label: monday.clone().add(index, "days").format("dddd"),
            date: monday.clone().add(index, "days").format("YYYY-MM-DD"),
            full: monday.clone().add(index, "days").format("DD/MM/YYYY")
        }));
    };

    const weekDaysData = getWeekDays(semanaInicial());
    const todayDate = moment().format("YYYY-MM-DD");
    const initialSelectedDay =
        weekDaysData.find(day => day.date === todayDate)?.date ??
        weekDaysData[0].date;

    const [weekDays, setWeekDays] = useState(weekDaysData);

    /* Moverse de semana: se recalculan los cinco dias y se cae en el lunes,
       que es por donde se empieza a mirar una semana que todavia no llega. */
    const moverSemana = (paso) => {
        const nuevo = desfaseSemana + paso;
        const dias = getWeekDays(nuevo);
        setDesfaseSemana(nuevo);
        setWeekDays(dias);
        const hoy = moment().format("YYYY-MM-DD");
        setSelectedDay(dias.find((d) => d.date === hoy)?.date ?? dias[0].date);
    };
    const [selectedDay, setSelectedDay] = useState(initialSelectedDay);

    const selectedDayRef = useRef(selectedDay);
    
    const [message, setMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const stompClientRef = useRef(null);

    // silent: true -> refresca sin pasar por el estado de carga.
    // Lo usa el WebSocket: en una pantalla proyectada, mostrar el esqueleto
    // con cada pedido nuevo produce un parpadeo constante.
    const getComanda = (date, { silent = false } = {}) => {
        if (!silent) start();
        axios.get(
            `${baseUrl}admin/command/dashboard?date=${date}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((resp)=>{
            axios.get(`${baseUrl}admin/orders/export?date=${date}`, { headers: { Authorization: `Bearer ${token}` } })
                .then((r) => setDetalle(Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : [])))
                .catch(() => setDetalle([]));
            setComanda(resp.data.data);
            setLastUpdate(new Date());
            done();
        })
        .catch((err)=>{
            console.log(err);
            if (!silent) fail();
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
                    setConnected(true);
                    stompClient.subscribe('/topic/orders/notifications', (response) => {
                        //console.log('Received message:', response.body);
                        getComanda(selectedDayRef.current, { silent: true });
                        setMessage(JSON.parse(response.body).content);
                    });
                },
                onDisconnect: () => setConnected(false),
                onWebSocketClose: () => setConnected(false),
                onStompError: (frame) => {
                    setConnected(false);
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
        <Box
            sx={{
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '1vw',
                p: '1.1vw',
                bgcolor: '#0B1F16',
            }}
        >
            {/* Cabecera: fecha viva, marca, dia y estado de la conexion */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    px: 3,
                    py: 2,
                    borderRadius: 4,
                    bgcolor: '#163226',
                    border: '1px solid rgba(255,255,255,.08)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    {/* Salida. Esta pantalla vive fuera del layout, asi que sin
                        esto no hay forma de volver. Se mantiene discreta para no
                        competir con la comanda en la TV de cocina. */}
                    <Tooltip title="Volver al panel">
                        <IconButton
                            onClick={() => navigate('/')}
                            aria-label="Volver al panel"
                            sx={{
                                color: 'rgba(252,252,250,.45)',
                                border: '1px solid rgba(255,255,255,.12)',
                                transition: 'color .18s ease, background-color .18s ease',
                                '&:hover': {
                                    color: '#FCFCFA',
                                    bgcolor: 'rgba(255,255,255,.08)',
                                },
                                '&.Mui-focusVisible': {
                                    outline: '2px solid #3CFB9F',
                                    outlineOffset: 2,
                                },
                            }}
                        >
                            <ArrowBackRoundedIcon />
                        </IconButton>
                    </Tooltip>

                    <Box component="img" src={logoAllpa} alt="Allpa Food" sx={{ height: 'max(44px, 3.6vw)', width: 'auto' }} />
                    <Box>
                        <Typography sx={{ fontSize: 21, fontWeight: 700, color: '#FCFCFA', lineHeight: 1.2 }}>
                            {today}
                        </Typography>
                        <ConnectionStatus connected={connected} lastUpdate={lastUpdate} />
                    </Box>
                </Box>

                <DispatchTimer selectedDay={selectedDay} />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Moverse de semana. Los viernes hay que ver el lunes
                        siguiente para hacer las compras del fin de semana. */}
                    <Box
                        component="button"
                        onClick={() => moverSemana(-1)}
                        title="Semana anterior"
                        sx={{
                            cursor: 'pointer', px: 1.6, py: 1.1, borderRadius: 999,
                            fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                            border: '1px solid rgba(255,255,255,.16)',
                            color: 'rgba(252,252,250,.75)', background: 'transparent',
                        }}
                    >
                        ‹
                    </Box>

                    {weekDays.map((day) => {
                        const active = selectedDay === day.date;
                        return (
                            <Box
                                key={day.date}
                                component="button"
                                onClick={() => setSelectedDay(day.date)}
                                sx={{
                                    cursor: 'pointer',
                                    px: 2.5,
                                    py: 1.1,
                                    borderRadius: 999,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    fontFamily: 'inherit',
                                    textTransform: 'capitalize',
                                    border: '1px solid',
                                    borderColor: active ? '#3CFB9F' : 'rgba(255,255,255,.16)',
                                    color: active ? '#0F2A1E' : 'rgba(252,252,250,.75)',
                                    bgcolor: active ? '#3CFB9F' : 'transparent',
                                    transition: 'background-color .18s ease',
                                    '&:hover': { bgcolor: active ? '#3CFB9F' : 'rgba(255,255,255,.08)' },
                                }}
                            >
                                {day.label}
                            </Box>
                        );
                    })}
                
                    <Box
                        component="button"
                        onClick={() => moverSemana(1)}
                        title="Semana siguiente"
                        sx={{
                            cursor: 'pointer', px: 1.6, py: 1.1, borderRadius: 999,
                            fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                            border: '1px solid rgba(255,255,255,.16)',
                            color: 'rgba(252,252,250,.75)', background: 'transparent',
                        }}
                    >
                        ›
                    </Box>

                    {/* Sin esto es facil quedarse mirando otra semana sin
                        darse cuenta: los dias se llaman igual. */}
                    {desfaseSemana !== 0 && (
                        <Box
                            component="button"
                            onClick={() => moverSemana(-desfaseSemana)}
                            title="Volver a la semana de hoy"
                            sx={{
                                cursor: 'pointer', px: 2, py: 1.1, borderRadius: 999,
                                fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
                                border: '1px solid rgba(60,251,159,.45)',
                                color: '#3CFB9F', background: 'rgba(60,251,159,.10)',
                            }}
                        >
                            {desfaseSemana > 0 ? 'Semana siguiente' : 'Semana anterior'} · volver a hoy
                        </Box>
                    )}
                </Box>
            </Box>

            <DataState
                status={status}
                isEmpty={!comanda}
                onRetry={() => getComanda(selectedDayRef.current)}
                variant="list"
                skeletonCount={3}
                emptyTitle="No hay comanda para esta fecha"
                emptyDescription="Elige otro día o espera a que se registren pedidos."
            >
                <TableroCocina cocina={armarCocina(comanda, detalle)} />

                {/* El desglose por empresa va despues del tablero: la cocina
                    arma por olla, y recien al empacar importa a que oficina
                    va cada taper. */}
                <BloqueEmpresas fecha={selectedDay} platos={armarCocina(comanda, detalle).platos} />
            </DataState>
        </Box>
    )
};

export default ComandaPage;
