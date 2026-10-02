import React,{ useState, useEffect } from "react";
import './AddDay.scss';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import ProgramSearchMenu from './../Search/Search';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import moment from 'moment';

import imgFood from '../../../assets/img/plato_demo.png';

import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';

import Alert from '@mui/material/Alert';

const ProgramAddDay = ({date,menus,catFunc,dateSelect,closeModal,updateEvents,eventList}) => {

  const { token, baseUrl } = useAuthContext();
  const [updateOrder,setUpdateOrder] = useState(false);
  const [open, setOpen] = useState(false);

  const [catNameTmp,setCatNameTmp] = useState();

  const handleOpen = (cateogory,catName) => {
    catFunc(cateogory);
    setOpen(true);
    setCatNameTmp(catName);
  };
  const handleClose = () => setOpen(false);

  const [dayMenu,setDayMenu] = useState({
    breakfast:[],
    dinner:[],
    lunch:[],
    snacks:[],
    drinks:[],
    /* La entrada faltaba en esta lista. CardMenu solo agrega el plato a los
       tipos que existen aqui, asi que una entrada se podia buscar pero no
       entraba al dia, y el boton ni siquiera estaba. */
    starter:[]
  });

  const removePlate = (item,cat) =>{
    const dayMenuTmp = dayMenu;
    
    let arrTmp = [];
    
    if(cat === 'breakfast'){
      arrTmp = dayMenuTmp.breakfast
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,breakfast:arrTmp});
    }else if(cat === 'dinner'){
      arrTmp = dayMenuTmp.dinner
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,dinner:arrTmp});
    }else if(cat === 'lunch'){
      arrTmp = dayMenuTmp.lunch
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,lunch:arrTmp});
    }else if(cat === 'snacks'){
      arrTmp = dayMenuTmp.snacks
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,snacks:arrTmp});
    }else if(cat === 'drinks'){      
      arrTmp = dayMenuTmp.drinks
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,drinks:arrTmp});
    }else if(cat === 'starter'){
      arrTmp = dayMenuTmp.starter
      const removeItemArr = arrTmp.filter(itemFilter => itemFilter.id != item.id)
      arrTmp = removeItemArr;
      setDayMenu({...dayMenu,starter:arrTmp});
    }
  }

  const [loadForm,setLoadForm] = useState(false);

  const [errorSend,setErrorSend] = useState(false);

  const sendRequest = () =>{
    /* Si el dia ya tenia menu y no se pudo leer, guardar lo borraria: el
       servidor reemplaza el dia entero con lo que llegue. Mejor no dejar
       guardar que dejar el dia en blanco. */
    if (updateOrder && !cargoElDia) {
      setErrorSend(true);
      return;
    }
    setLoadForm(true);
    let arrTmp = [];

    /* El orden importa: la posicion dentro del dia es el numero de opcion
       que ve el cliente y que lee cocina. Se manda como estan cargados todos
       los demas dias —almuerzos, cenas, y al final lo que acompana— para que
       un dia tocado hoy no quede numerado distinto que el de ayer. */
    [dayMenu.lunch, dayMenu.dinner, dayMenu.breakfast,
     dayMenu.drinks, dayMenu.snacks, dayMenu.starter].forEach((lista) => {
      lista.forEach((item) => {
        item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
      });
    });

    /* Sin repetidos. Un plato que esta cargado como almuerzo Y como cena trae
       los dos ids, asi que recorrer las dos listas lo mandaba dos veces y el
       servidor rechazaba el dia entero con "No puedes registrar el mismo menu
       para esta fecha". */
    arrTmp = [...new Set(arrTmp)];

    const dateSlot = moment(dateSelect.start).format('YYYY-MM-DD');

    
    if(updateOrder){

      axios.post(baseUrl+'menu/schedule',
        {
          menuTypeIds: arrTmp,
          date: dateSlot
        },
        {
          headers: {"Authorization" : `Bearer ${token}`}
        }
      ).then((resp)=>{
        
        setLoadForm(false);
        updateEvents();
        closeModal();
      }).catch((err)=>{
        console.log(err);
        setLoadForm(false);
        setErrorSend(true)
      })
    } else{
      axios.post(baseUrl+'menu/schedule',
        {
          menuTypeIds: arrTmp,
          date: dateSlot
        },
        {
          headers: {"Authorization" : `Bearer ${token}`}
        }
      ).then((resp)=>{
        updateEvents();
        closeModal();
        setLoadForm(false);
      }).catch((err)=>{
        console.log(err);
        setLoadForm(false);
        setErrorSend(true)
      })
    }
  }

  /* Lo que el dia YA tiene programado.
     El modal arrancaba vacio aunque el dia estuviera lleno, y "Enviar" manda
     la lista completa: agregar una entrada a un dia ya armado lo dejaba con
     la entrada sola. Paso el 02-10-2026 con el lunes 5, que los clientes ya
     habian elegido. Ahora se precarga y lo que se manda es lo que hay mas lo
     que se agrego. */
  const [cargoElDia,setCargoElDia] = useState(false);

  const cargarDiaActual = () => {
    if (!dateSelect) return;
    const fecha = moment(dateSelect.start).format('YYYY-MM-DD');
    axios.get(`${baseUrl}menu/schedule?startDate=${fecha}&endDate=${fecha}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const lista = r.data?.data || [];
        const dia = lista.find((d) => d.localDate === fecha);
        const cargado = { breakfast:[], dinner:[], lunch:[], snacks:[], drinks:[], starter:[] };
        (dia?.menuTypeGroups || []).forEach((grupo) => {
          (grupo.menuTypes || []).forEach((mt) => {
            if (!cargado[grupo.type]) return;
            cargado[grupo.type].push({
              id: mt.id,
              name: mt.menu?.name,
              imageUrl: mt.menu?.imageUrl,
              /* Solo SU id: si se mandaran todos los tipos del plato, agregar
                 un almuerzo arrastraria tambien su cena. */
              menuTypes: [{ id: mt.id }],
            });
          });
        });
        setDayMenu(cargado);
        setCargoElDia(true);
      })
      .catch(() => setCargoElDia(false));
  };

  const getEvent = ()=>{

    const test = eventList.filter((el)=> {

      if(String(el.start) ===  String(dateSelect.start)){
        //console.log('===>')
        setUpdateOrder(true);
        return true;
      }else{
        return false;
      }
      
    })

  }

  useEffect(()=>{
    getEvent();
    cargarDiaActual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  
  return (
    <div className="inlineFlex compProgramAddDay">
      <h2 onClick={()=>console.log(dayMenu)}>{date ? date : 'no date'}</h2>
      <div className="inlineFlex cpadItem">
        <h5>Desayuno</h5>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.breakfast.map((item)=>
             (
              <div className="inlineFlex cpadPlateItem">
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                    {false &&
                        <p>{item.description}</p>
                    }
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'breakfast')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>
        <Button 
          onClick={()=>handleOpen('breakfast','Desayuno')} 
          variant="contained"
          className="btnSecond" 
        >
          Agregar <AddIcon />
        </Button>
      </div>
      <div className="cpadItem">
        <h5>Almuerzo</h5>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.lunch.map((item)=>
             (
              <div className="inlineFlex cpadPlateItem">
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                    {false &&
                        <p>{item.description}</p>
                    }
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'lunch')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>
        <Button 
          onClick={()=>handleOpen('lunch','Almuerzo')} 
          variant="contained"
          className="btnSecond" 
        >
          Agregar <AddIcon />
        </Button>
      </div>
      <div className="cpadItem">
          <h5>Cena</h5>
          <Button 
            onClick={()=>handleOpen('dinner','Cena')} 
            className="btnSecond" 
            variant="contained"
          >
            Agregar <AddIcon />
          </Button>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.dinner.map((item)=>
            (
              <div className="inlineFlex cpadPlateItem">
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                    {false &&
                        <p>{item.description}</p>
                    }
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'dinner')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>

      </div>
      <div className="cpadItem">
        <h5>Snacks</h5>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.snacks.map((item)=>
            (
              <div className="inlineFlex cpadPlateItem">
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                    {false &&
                        <p>{item.description}</p>
                    }
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'snacks')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>
        <Button 
          onClick={()=>handleOpen('snacks','Snacks')} 
          className="btnSecond" 
          variant="contained"
        >
          Agregar <AddIcon />
        </Button>
      </div>
      <div className="cpadItem">
        <h5>Bebidas</h5>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.drinks.map((item)=>
             (
              <div className="inlineFlex cpadPlateItem">
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'drinks')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>
        <Button 
          onClick={()=>handleOpen('drinks','Bebidas')} 
          variant="contained"
          className="btnSecond" 
        >
          Agregar <AddIcon />
        </Button>
      </div>

      <div className="cpadItem">
        <h5>Entrada</h5>
        <div className="inlineFlex cpadPlateList">
          {dayMenu.starter.map((item)=>
             (
              <div className="inlineFlex cpadPlateItem" key={item.id}>
                <figure>
                    <img src={item.imageUrl ? item.imageUrl : imgFood} alt="" />
                </figure>
                <div className="txt">
                    <h4>{item.name}</h4>
                </div>
                <div className="action">
                    <IconButton aria-label="settings" onClick={()=>removePlate(item,'starter')}>
                        <CloseIcon />
                    </IconButton>
                </div>
              </div>
            )
          )}
        </div>
        <Button 
          onClick={()=>handleOpen('starter','Entrada')} 
          variant="contained"
          className="btnSecond" 
        >
          Agregar <AddIcon />
        </Button>
      </div>

      {errorSend &&
        <Alert className={'inlineBlock cpadError'} severity="error">Debe seleccionar 1 item por cada comida</Alert>
      }

      <Button 
        onClick={sendRequest} 
        variant="contained"
        className={loadForm ? 'btnPrimary btnDisabled': 'btnPrimary '}
      >
        Enviar
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="programMenuModals">
          <ProgramSearchMenu 
            menus={menus}
            dayMenu={dayMenu}
            setDayMenu={setDayMenu}
            nameCat={catNameTmp}
          />
        </div>
      </Modal>
    </div>
  )
};

export default ProgramAddDay;
