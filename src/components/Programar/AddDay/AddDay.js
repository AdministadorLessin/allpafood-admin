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
    drinks:[]
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
    }
  }

  const [loadForm,setLoadForm] = useState(false);

  const [errorSend,setErrorSend] = useState(false);

  const sendRequest = () =>{
    setLoadForm(true);
    let arrTmp = [];

    dayMenu.breakfast.forEach((item) => {
      item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
    });

    /*
    dayMenu.dinner.forEach((item) => {
      item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
    });
    */

    dayMenu.lunch.forEach((item) => {
      item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
    });

    dayMenu.snacks.forEach((item) => {
      item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
    });

    dayMenu.drinks.forEach((item) => {
      item.menuTypes.forEach((menuType) => arrTmp.push(menuType.id));
    });

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
