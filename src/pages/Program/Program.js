import {useState,useEffect} from "react";
import LayoutPages from './../../components/LayoutPages/LayoutPages';
import DataState from "./../../components/ui/DataState";
import useDataStatus from "./../../components/ui/useDataStatus";
import TitlePage from './../../components/Pages/Title/Title';

import { Calendar, momentLocalizer,Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment'

import Modal from '@mui/material/Modal';

import './Program.scss';
import ProgramAddDay from './../../components/Programar/AddDay/AddDay';
import 'moment/locale/es';

import axios from 'axios';
import { useAuthContext } from './../../context/authContext';
import ModalRightCont from './../../components/ModalRightCont/ModalRightCont';

const localizer = momentLocalizer(moment);

const PageProgram = (props) => {

    const { token, baseUrl } = useAuthContext();
    const { status, start, done, fail } = useDataStatus();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    moment.locale('es');
    const [dateSelect,setDateSelect] = useState();
    const [eventList,setEventList] = useState([]);

    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const getEvents = () =>{
        start();
        const iniDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const endDate = moment().add(30, 'days').format('YYYY-MM-DD');
        
        axios.get(baseUrl+'menu/schedule?startDate='+iniDate+'&endDate='+endDate,
            {headers: {"Authorization" : `Bearer ${token}`} }
        )
        .then((resp)=>{
            //console.log(resp.data.data)
            const tmpData = resp.data.data;
            let eventsTmp = [];
            tmpData.map((item)=>{
                item.menuTypeGroups.map((subItem)=>{
                    //console.log('subItem  get events',subItem)

                    subItem.menuTypes.map((subItem2)=>{
                        //console.log('subItem2 ===>',subItem2)

                        if(subItem.type === 'drinks' ){
                            eventsTmp.push({
                                title: subItem2.menu.name,
                                start: new Date(moment(item.localDate)),
                                end: new Date(moment(item.localDate)),
                                colorEvento:'#9af2ff'
                            })
                        }else if(subItem.type === 'lunch' ){
                            eventsTmp.push({
                                title: subItem2.menu.name,
                                start: new Date(moment(item.localDate)),
                                end: new Date(moment(item.localDate)),
                                colorEvento:'#9cfbb1'
                            })
                        }else if(subItem.type === 'dinner' ){
                            eventsTmp.push({
                                title: subItem2.menu.name,
                                start: new Date(moment(item.localDate)),
                                end: new Date(moment(item.localDate)),
                                colorEvento:'#c1daff'
                            })
                        }else if(subItem.type === 'breakfast' ){
                            eventsTmp.push({
                                title: subItem2.menu.name,
                                start: new Date(moment(item.localDate)),
                                end: new Date(moment(item.localDate)),
                                colorEvento:'#ffcb6d'
                            })
                        }else{
                            eventsTmp.push({
                                title: subItem2.menu.name,
                                start: new Date(moment(item.localDate)),
                                end: new Date(moment(item.localDate)),
                                colorEvento:'yellow'
                            })
                        }

                    })

                })
            })
            //console.log(eventsTmp)
            setEventList(eventsTmp)
            done();
        }).catch((errr)=>{
            console.log(errr)
            fail();
        })
    }

    const [menusList,setMenusList] = useState();
    const [menusListFilter,setMenusListFilter] = useState();
    const [catList,setCatList] = useState();
    const [catSelect,setCatSelect] = useState();

    const [searchTxt,setSearchTxt] = useState('');

    const getMenus = ()=>{
        axios.get(baseUrl+'menu',{
            headers: {"Authorization" : `Bearer ${token}`} 
        }).then((resp)=>{

            setMenusList(resp.data.data);
            setMenusListFilter(resp.data.data);

            const listTmp = resp.data.data;

            const uniqueTypes = [...new Set(
                listTmp.flatMap(item => item.types || [])
            )];


            setCatList(uniqueTypes);

        }).catch((error)=>{
            console.log('===>',error)
        });
    }

    const filterMenus = (cat, txtField) => {
        const filtered = menusList.filter((item) => {
        const matchCategory = !cat || item.types?.includes(cat);

        const matchText =
            !txtField ||
            item.name.toLowerCase().includes(txtField.toLowerCase());

        return matchCategory && matchText;
        });

        setMenusListFilter(filtered);
    };

    const searchChange = (e) =>{
        const lowerCase = e.target.value.toLowerCase();
        setSearchTxt(lowerCase);
        filterMenus(catSelect,lowerCase);
    }

    const changeFilterMenu = (cat) =>{
        setCatSelect(cat)
        filterMenus(cat,searchTxt);
    }


    useEffect(()=>{
        getEvents();
        getMenus();
    },[])

    return (
        <LayoutPages>
            <TitlePage title={'Programe sus menus'} />

            <div className="inlineBlock pageMenuCont">
                <DataState
                    status={status}
                    isEmpty={false}
                    onRetry={getEvents}
                    variant="list"
                    skeletonCount={4}
                >
                <Calendar
                    localizer={localizer}
                    events={eventList}
                    onSelectSlot={(slotInfo) => {
                        //console.log(moment(slotInfo.slots[0]).format('YYYY-MM-DD'));

                        setDateSelect(slotInfo);
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
                    view={view} // Include the view prop
                    date={date} // Include the date prop
                    onView={(view) => setView(view)}
                    onNavigate={(date) => {
                        
                        setDate(new Date(date));
                    }}
                />
                </DataState>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <ModalRightCont>
                
                    <ProgramAddDay 
                        date={dateSelect && moment(dateSelect.slots[0]).format('dddd, MMMM Do YYYY')} 
                        menus={menusListFilter} 
                        catFunc={changeFilterMenu}
                        dateSelect={dateSelect}
                        updateEvents={getEvents}
                        eventList={eventList}
                        closeModal={handleClose}
                    />
                
                </ModalRightCont>
            </Modal>
        </LayoutPages>
    )
};

export default PageProgram;
