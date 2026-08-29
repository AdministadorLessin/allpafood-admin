import  { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';

import './Usuarios.scss';

import LayoutPages from "../../components/LayoutPages/LayoutPages";
import TitlePage from './../../components/Pages/Title/Title';
import { DataGrid } from '@mui/x-data-grid';
import { useAuthContext } from './../../context/authContext';

import Modal from '@mui/material/Modal';
import axios from 'axios';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { esES } from '@mui/x-data-grid/locales';
import ModalRightCont from './../../components/ModalRightCont/ModalRightCont';
import UsuarioFormEditar from '../../components/Usuarios/Forms/EditarUsuario/EditarUsuario';
import UsuarioFormActualizarPlan from "../../components/Usuarios/Forms/ActualizarPlan/ActualizarPlan";
import UsuarioFormCambiarPlan from "../../components/Usuarios/Forms/CambiarPlan/CambiarPlan";


import UploadUsersCsv from './uploadCsv';
import UsuarioFormCrear from './../../components/Usuarios/Forms/CrearUsuario/CrearUsuario';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const PageUsuarios = (props) => {

  const paginationModel = { page: 1, pageSize: 10 };
  const { token, baseUrl } = useAuthContext();
  const [ users, setUsers ] = useState([]);
  const [ search, setSearch ] = useState('');


  const columns = [
    { field: 'id', headerName: 'ID', width: 140, sortable: false, },
    { field: 'name', headerName: 'Nombres', width: 180, sortable: false, },
    { field: 'lastName', headerName: 'Apellidos', width: 250, sortable: false, },
    { field: 'dni',headerName: 'DNI', width: 90, sortable: false, },
    { field: 'phone',headerName: 'Numero', width: 120, sortable: false },
    { field: 'mail',headerName: 'Correo', width: 120, sortable: false },
    { field: 'fecreg',headerName: 'Fec. Reg', width: 120, sortable: false },
    { field: 'dirreg',headerName: 'Dir. Reg', width: 120, sortable: false },

    { field: 'plan',headerName: 'Plan', width: 90, sortable: false, },
    { field: 'inicia',headerName: 'Inicia', width: 120 },
    { field: 'expira',headerName: 'Expira', width: 120 },
    { field: 'metpago',headerName: 'M.P.', width: 120 },
    { field: 'pago',headerName: 'Pago', width: 120 },
    { field: 'consumedHide',headerName: 'Consumido', width: 120, sortable: false, },
    { field: 'consumed',headerName: 'Envios', width: 120, sortable: false, },
    { field: 'state',headerName: 'Estado', width: 120, sortable: false, },

  ];

  const filteredUsers = users.filter((user) => {
    const text = search.toLowerCase().trim();

    return (
      user.firstName?.toLowerCase().includes(text) ||
      user.lastName?.toLowerCase().includes(text) ||
      user.dni?.toString().includes(text) ||
      user.phone?.toString().includes(text) ||
      user.mail?.toLowerCase().includes(text)
    );
  });

  const getUsuarios = () =>{
    axios.get(baseUrl+'admin/user-plan?page=1&size=100',
      {headers: {"Authorization" : `Bearer ${token}`} }
    ).then((resp)=>{
      //console.log('getUsuarios',resp.data.data.content)
      
      const usersTmp = [];
      if(resp?.data?.data?.content){
        
        resp?.data?.data?.content.map((item)=>{
          usersTmp.push({
            id: item.userId,
            name: item.user?.profile?.name, 
            lastName: item.user?.profile?.lastname, 
            phone: item.user?.phoneNumber,
            mail: item.user?.email,
            fecreg: item.user?.registerDate ? item.user?.registerDate : '00/00/00',
            dirreg: item.user?.profile?.address ? item.user?.profile?.address : 'Av. Arequipa 123',
            plan: item.benefits?.subscriptionPlan?.description,
            inicia:item.planInitDate,
            expira: item.planExpirationDate,
            metpago: item.paymentMethod ? item.paymentMethod : '--',
            pago: item.totalPrice? item.totalPrice: '0.0',

            consumedHide: item.consumedBenefits?.orders?.consumed,
            consumed: item.consumedBenefits?.orders?.consumed + ' / ' + item.consumedBenefits?.orders?.total,
            state: item.user.status === 1 ? 'Activo' : 'Inactivo',
            dni: item.user.documentNumber
          })
        })
      }
      setUsers(usersTmp)

    }).catch((err)=>{
      console.log(err)
    })
  }

  // Modal
  const [open, setOpen] = useState(false);
  const [tmpData,setTmpData] = useState(
    {
      data:[],
      form:1
    }
  );

  const handleOpen = (data,formNumb) => {
    setOpen(true);
    setTmpData({
      ...tmpData,
      form:formNumb,
      data:data? data: null
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTmpData(
      {
        data:[],
        form:1
      }
    );
  };

  const [ planList, setPlanList ] = useState();

  const getPlanes = () =>{
    axios.get(baseUrl+'admin/subscription-plans',
      {headers: {"Authorization" : `Bearer ${token}`} }
    ).then((resp)=>{
      setPlanList(resp.data.data)
    }).catch((error)=>{
      console.log(error);
    })
  }

  useEffect(()=>{
    getUsuarios();
    getPlanes();
  },[])

  return (
    <LayoutPages>
      <TitlePage title={'Usuarios:'} />

      <div className="inlineFlex textFieldAdmin textFieldAdmin2 textFieldAdminUser">
        <TextField
          fullWidth
          size="small"
          label="Buscar usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          //sx={{ mb: 2, maxWidth: 500 }}
          variant="filled"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearch('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </div>
      <div className="inlineFlex usuariosTableCont">
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel,
            },
          }}
          pageSizeOptions={[5, 10]}
          sx={{ border: 0 }}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          onCellClick={(params)=>{
            if (
              params.field === 'name' || 
              params.field === 'lastName' || 
              params.field === 'phone' || 
              params.field === 'mail' || 
              params.field === 'dni' || 
              params.field === 'state' 
            ) {
              handleOpen(params.row,1);
            }

            if (
              params.field === 'expira' || 
              params.field === 'consumed'
            ) {
              handleOpen(params.row,2);
            }

            if (params.field === 'plan') {
              handleOpen(params.row,3);
            }
          }}
          columnVisibilityModel={
          {
            consumedHide: false,
          }}
        />


      </div>
      <div className="usPaBtn inlineFlex">
        <UploadUsersCsv />
        <div 
          className="inlineFlex btnPrimary"
          onClick={()=>handleOpen(null,4)}
        >
          Crear usuario
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalRightCont
          title={'Editar usuario'}
        >
          
          {tmpData.form === 1 ?
        
            <UsuarioFormEditar 
              data = { tmpData.data }
              handleClose = { handleClose }
              getUsuarios = { getUsuarios }
            />
          : tmpData.form === 2 ?
            <UsuarioFormActualizarPlan 
              data = { tmpData.data }
              handleClose = { handleClose }
              getUsuarios = { getUsuarios }
            />
          : tmpData.form === 3 ?
            <UsuarioFormCambiarPlan
              data = { tmpData.data }
              handleClose = { handleClose }
              getUsuarios = { getUsuarios }
              planList = { planList }
            />
          :
            <UsuarioFormCrear 
              handleClose = { handleClose }
              getUsuarios = { getUsuarios }   
              planList = { planList }
            />
          }
        </ModalRightCont>
      </Modal>

    </LayoutPages>
  )
};

export default PageUsuarios;
