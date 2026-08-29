import {useState,useEffect} from "react";
import axios from 'axios';
import './Asignar.scss'
import { useAuthContext } from './../../../context/authContext';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import RoomIcon from '@mui/icons-material/Room';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';

import Modal from '@mui/material/Modal';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import * as XLSX from 'xlsx';
import Button from '@mui/material/Button';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const AsignarRuta = ({dateSelect,driverList,getOrders}) => {

    const { token, baseUrl } = useAuthContext();
    const [rutasList,setRutasList] = useState(dateSelect);

    const [motorizadosList,setMotorizadosList] = useState(driverList);

    const [ordersDays,setOrdersDays] = useState(dateSelect?.events);

    const [idMotorizado,setIdMotorizado] = useState();

    const [openModal, setOpenModal] = useState(false);
    const handleOpenModal = (id) => {
        setIdMotorizado(id);
        setOpenModal(true)
    };
    const handleCloseModal = () => setOpenModal(false);

    const asignarRutas =  (data) => {
        //console.log('asignar rutas',data);
        const payload = {
            orderIds: [data.idOrder],
            userId:idMotorizado,
        };

        axios.post(
            `${baseUrl}delivery/motorized/assign-route`,
            payload,
            {
                headers: {"Authorization" : `Bearer ${token}`}
            }
        ).then((respp)=>{
            getOrders();
            setOrdersDays(prev =>
                prev.map((item, index) =>
                    item.idOrder === data.idOrder
                    ? { ...item, status: 'IN PROGRESS',idDelivery: idMotorizado } 
                    : item
                )
            );
        }).catch((error)=>{
            console.log(error);
        });

    };

    const reAsignedMotorizado = (idMotorizadoRe,idOrder)=>{
        axios.post(
            `${baseUrl}delivery/motorized/unassign-route`,
            {
                userId: idMotorizadoRe,
                orderIds: [idOrder]
            },
            {
                headers: {"Authorization" : `Bearer ${token}`}
            }
        ).then((respp)=>{
            getOrders();
            setOrdersDays(prev =>
                prev.map((item, index) =>
                    item.idOrder === idOrder
                    ? { ...item, status: 'PENDING',idDelivery: idMotorizadoRe } 
                    : item
                )
            );
        }).catch((error)=>{
            console.log(error)
        });
    }


    const getOrdersPrint = () => {

        axios.get(
            `${baseUrl}admin/orders/export?date=${dateSelect.date}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        .then((resp) => {
            console.log(resp)


            const orders = resp.data.data;

            // -----------------------------------------
            // Formatear nombre
            // -----------------------------------------
            const formatName = (name, lastname) => {

                if (!name) return '';

                const nameParts = name.trim().split(/\s+/);

                // Primer nombre
                const firstName = nameParts[0];

                // Si existe un segundo nombre,
                // usamos su inicial
                let secondName = '';

                if (nameParts.length > 1) {
                    secondName = ` ${nameParts[1].charAt(0)}.`;
                }

                return `${firstName}${secondName}.`;
            };


            // -----------------------------------------
            // Formatear nombre + apellido
            // -----------------------------------------
            const formatFullName = (name, lastname) => {

                if (!name) return '';

                const nameParts = name.trim().split(/\s+/);

                const lastnameParts = lastname
                    ? lastname.trim().split(/\s+/)
                    : [];

                // Primer nombre
                const firstName = nameParts[0];

                // Capitalizar primera letra
                const formattedFirstName =
                    firstName.charAt(0).toUpperCase() +
                    firstName.slice(1).toLowerCase();

                // -----------------------------------------
                // Si tiene segundo nombre
                //
                // Jose Miguel -> Jose M.
                // Juan Carlos -> Juan C.
                // -----------------------------------------
                if (nameParts.length > 1) {

                    const secondNameInitial =
                        nameParts[1].charAt(0).toUpperCase();

                    return `${formattedFirstName} ${secondNameInitial}.`;
                }

                // -----------------------------------------
                // Si NO tiene segundo nombre,
                // usamos la inicial del primer apellido
                //
                // Irvin Vivanco Huatuco -> Irvin V.
                // Maria Gomez -> Maria G.
                // admin allpafood -> Admin A.
                // -----------------------------------------
                if (lastnameParts.length > 0) {

                    const lastnameInitial =
                        lastnameParts[0].charAt(0).toUpperCase();

                    return `${formattedFirstName} ${lastnameInitial}.`;
                }

                // -----------------------------------------
                // Si no tiene apellido
                // -----------------------------------------
                return formattedFirstName;
            };


            // -----------------------------------------
            // Crear información para Excel
            // -----------------------------------------
            const excelData = orders.map((order) => ({

                'N° Orden': order.orderId,

                'Cliente': formatFullName(
                    order.clientName,
                    order.clientLastname
                ),

                'Motorizado': formatFullName(
                    order.motorizedName,
                    order.motorizedLastname
                ),

                'Distrito': order.district
                    ? order.district.substring(0, 5) + '.'
                    : '',

                'Azúcar':
                    order.sugar === 'Si'
                        ? 'Si'
                        : '',

                'Restricciones Alimentarias':
                    order.alimentsRestrictions || '',

                'Doble Proteína':
                    order.doubleProtein === 'Sí'
                        ? 'Sí'
                        : '',

                'Snack':
                    order.snack === 'Snack'
                        ? 'Snack'
                        : '',

                'Estado': order.status
            }));


            // -----------------------------------------
            // Crear hoja
            // -----------------------------------------
            const worksheet = XLSX.utils.json_to_sheet(excelData);


            // -----------------------------------------
            // Crear libro
            // -----------------------------------------
            const workbook = XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                'Pedidos'
            );


            // -----------------------------------------
            // Descargar Excel
            // -----------------------------------------
            XLSX.writeFile(
                workbook,
                `pedidos-${dateSelect.date}.xlsx`
            );
               
        })
        .catch((error) => {
            console.error(
                'Error exportando pedidos:',
                error
            );
        });

    };

    useEffect(() => {
        setRutasList(dateSelect);
    }, [dateSelect]);

    return (
        <div className="inlineFlex compAsignar">
            <h2>Asignar motorizado</h2> 

            <IconButton 
                onClick={()=>getOrdersPrint()}
                className={'compDescargarExcel'}
                aria-label="Descargar excel"
                color={'primary'}
            >
                <CloudDownloadIcon />
            </IconButton>

            <List sx={{ width: '100%', bgcolor: 'background.paper' }} className={'caListMot'} >
                {motorizadosList && motorizadosList.length && motorizadosList.map((item,index)=>(

                    <span className="inlineBlock">
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar alt={item.profile?.name} src="/static/images/avatar/1.jpg" />
                            </ListItemAvatar>
                            <div className='inlineBlock'>
                                <span className={'inlineBlock clmTitleBox'}>
                                    <span className='clmTitle'>{item.profile?.name} <span className={'clmTag'}><RoomIcon/> {item.profile?.district}</span></span>
                                </span>
                                <span className="inlineBlock clmCont">
                                    <p>Envios: </p>
                                    <span className="inlineBlock">
                                        {ordersDays &&  ordersDays.length > 0 ? (
                                        
                                            (() => {
                                                const deliveries = ordersDays.filter(
                                                    (sitem) => sitem.idDelivery === item.id && sitem.status === 'IN PROGRESS'
                                                );

                                                if (deliveries.length === 0) {
                                                    return (
                                                            <Alert severity="warning">No tiene envios programados.</Alert>
                                                        );
                                                }

                                                return deliveries.map((sitem, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={sitem.title}
                                                        onClick={()=>{console.log(ordersDays)}}
                                                        variant="outlined"
                                                        onDelete={()=>reAsignedMotorizado(item.id,sitem.idOrder)}
                                                        
                                                    />
                                                ));
                                            })()

                                        ) : (
                                            <p>No tiene envíos</p>
                                        )}
                                    </span>
                                    
                                    <button className={'btnPrimary'} onClick={()=>handleOpenModal(item.id)}>Asignar orden</button>
                                </span>
                            </div>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </span>

                ))}
            </List>

            {false && 
                <div className="inlineFlex">
                    <button> Ver lista de motorizados</button>
                    <button onClick={asignarRutas}>Enviar</button>
                </div>
            }

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                
                <div className="inlineBlock asignarCambiarMotorizado">
                    <h1>Ordenes</h1>
                    <div className="inlineBlock asignarCambiarMotorizadoList">
                        <ul>
                            {ordersDays && ordersDays.length && ordersDays.map((item)=>{
                                if(item.status === 'PENDING'){
                                    return (
                                        <li>
                                            {item.title}

                                            <IconButton onClick={()=>asignarRutas(item)} aria-label="delete" size="medium">
                                                <AddIcon fontSize="inherit" />
                                            </IconButton>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    )
};

export default AsignarRuta;
