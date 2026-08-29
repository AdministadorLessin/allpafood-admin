import React,{ useState, useEffect } from "react";
import './asignar-rutas.scss';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import TitlePage from '../../components/Pages/Title/Title';

import { Calendar, momentLocalizer,Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'
import axios from 'axios';
import { useAuthContext } from '../../context/authContext';

import Modal from '@mui/material/Modal';
import AsignarRuta from '../../components/asignar-rutas/Asignar/Asignar';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import ModalRightCont from './../../components/ModalRightCont/ModalRightCont';

const localizer = momentLocalizer(moment);

const PageAsignarRutas = (props) => {
    
    const { token, baseUrl } = useAuthContext();
    const [orderList,setOrderList] = useState();
    const [dateSelect,setDateSelect] = useState();
    const [eventList,setEventList] = useState([]);
    const [driverList,setDriverList] = useState();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    
    const getDrivers = ()=>{
        axios.get(baseUrl+'delivery/motorized/find-users',
            {headers: {"Authorization" : `Bearer ${token}`} }
        ).then((resp)=>{

            setDriverList(resp.data.data)
        }).catch((error)=>{
            console.log(error)
        })
    }

    moment.locale('es');

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return '#2196f3'; // blue
            case 'IN PROGRESS':
                return '#f44336'; // red
            default:
                return '#5AD178'; // verde por defecto
        }
    };

    function stringAvatar(name, status) {
        const names = name.split(' ');

        return {
            sx: {
                bgcolor: getStatusColor(status),
            },
            children: `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`,
        };
    }
    const CustomEvent = ({ event }) => {
        return (
            <Avatar
                sx={{
                    width: 20,
                    height: 20,
                    fontSize: 10
                }}
                {...stringAvatar(event.title, event.status)}
            />
        );
    };

    const getOrders = () =>{
        axios.get(baseUrl+'delivery/motorized/find-all-orders?startDate=2024-12-12&endDate=2026-12-12',
            {headers: {"Authorization" : `Bearer ${token}`} }
        ).then((resp)=>{
            //console.log('get orders ===>',resp.data.data)
            setOrderList(resp.data.data);
            const tmpList = resp.data.data;
            let eventsTmp = [];

            if(tmpList){
                tmpList.map((item)=>{
                    //console.log(item)
                    eventsTmp.push({
                        title: item.userProfile.name + ' ' + item.userProfile.lastname ,
                        idProfile: item.userProfile.userId ,
                        status:item.orderEntity.status,
                        idOrder: item.orderEntity.id,
                        idDelivery: item.orderEntity.deliveryUserId,
                        start: new Date(moment(item.orderEntity.deliveryDate)),
                        end: new Date(moment(item.orderEntity.deliveryDate)),
                        //colorEvento:'#9cfbb1'
                    })
                })
            }
            setEventList(eventsTmp)
        }).catch((error)=>{
            console.log(error)
        })
    }


    const assignarOrdenesAutomaticas = () =>{
        axios.post(
            `${baseUrl}delivery/motorized/assign-default`,
            {},
            {
                headers: {"Authorization" : `Bearer ${token}`}
            }
        ).then((respp)=>{
            console.log('las ordenes fueron asignadas')
        }).catch((error)=>{
            console.log(error)
        });
    }

    useEffect(()=>{
        getDrivers();
        getOrders();
    },[])

    return (
        <LayoutPages>

            <TitlePage title={'Asignar rutas'} />
            {false &&
                <button
                    onClick={()=>assignarOrdenesAutomaticas()}
                >
                    Asignar ordenes
                </button>
            }
            <div className="inlineBlock pageMenuCont pageAsinarCont">
                <Calendar
                    localizer={localizer}
                    events={eventList}
                    components={{
                        event: CustomEvent
                    }}
                    onSelectSlot={(slotInfo) => {
                        const { start, end } = slotInfo;

                        const eventsOfDay = eventList.filter(event =>
                            moment(event.start).isSame(start, 'day')
                        );

                        setDateSelect({
                            date: moment(start).format('YYYY-MM-DD'),
                            events: eventsOfDay
                        });

                        handleOpen();
                    }}
                    selectable
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 1500 }}
                    eventPropGetter={(myEventsList) => {
                        const backgroundColor = myEventsList.colorEvento ? myEventsList.colorEvento : 'blue';
                        const color = myEventsList.color ? myEventsList.color : 'blue';
                        return { style: { backgroundColor ,color} }
                    }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    defaultView={view}
                    view={view}
                    date={date}
                    onView={(view) => setView(view)}
                    onNavigate={(date) => {
                        setDate(new Date(date));
                    }}
                />
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <ModalRightCont
                    addClass="pageProgramModal"
                >

                    <AsignarRuta 
                        getOrders={getOrders}
                        dateSelect={dateSelect}
                        driverList={driverList}
                    />

                </ModalRightCont>
            </Modal>

        </LayoutPages>
    )
};

export default PageAsignarRutas;
