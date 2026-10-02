import  { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { styled } from '@mui/material/styles';

import './Usuarios.scss';

import LayoutPages from "../../components/LayoutPages/LayoutPages";
import { STATUS } from "../../components/ui/DataState";
import useDataStatus from "../../components/ui/useDataStatus";
import StateMessage from "../../components/ui/StateMessage";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import TitlePage from './../../components/Pages/Title/Title';
import { DataGrid } from '@mui/x-data-grid';
import { useAuthContext } from './../../context/authContext';

import Modal from '@mui/material/Modal';
import axios from 'axios';
import moment from 'moment';

import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { esES } from '@mui/x-data-grid/locales';
import ModalRightCont from './../../components/ModalRightCont/ModalRightCont';
import UsuarioFormEditar from '../../components/Usuarios/Forms/EditarUsuario/EditarUsuario';
import UsuarioFormActualizarPlan from "../../components/Usuarios/Forms/ActualizarPlan/ActualizarPlan";
import UsuarioFormCambiarPlan from "../../components/Usuarios/Forms/CambiarPlan/CambiarPlan";
import UsuarioFormRenovarPlan from "../../components/Usuarios/Forms/RenovarPlan/RenovarPlan";
import UsuarioFicha from "../../components/Usuarios/Forms/Ficha/Ficha";


import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import buildUserColumns from '../../sections/usuarios/user-table-columns';
import { SEGMENTS, matchesSegment, countBySegment } from '../../sections/usuarios/user-segments';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

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

  const paginationModel = { page: 0, pageSize: 10 };
  const { token, baseUrl } = useAuthContext();
  const { status, start, done, fail } = useDataStatus();
  const [ users, setUsers ] = useState([]);
  const [ search, setSearch ] = useState('');
  // El panel enlaza aqui con ?segmento=porVencer desde "Ver lista y contactar".
  const [ searchParams, setSearchParams ] = useSearchParams();
  const segment = searchParams.get('segmento') || 'todos';
  const setSegment = (value) => {
    if (value === 'todos') setSearchParams({});
    else setSearchParams({ segmento: value });
  };


  const columns = buildUserColumns({ onAction: (row, form) => handleOpen(row, form) });


  const segmentCounts = countBySegment(users);

  const filteredUsers = users.filter((user) => {
    if (!matchesSegment(user, segment)) return false;

    const text = search.toLowerCase().trim();
    if (!text) return true;

    return (
      user.name?.toLowerCase().includes(text) ||
      user.lastName?.toLowerCase().includes(text) ||
      user.dni?.toString().includes(text) ||
      user.phone?.toString().includes(text) ||
      user.mail?.toLowerCase().includes(text)
    );
  });

  /* El servidor devuelve como maximo 100 por peticion, y esta pantalla pedia
     una sola pagina: con 229 clientes en la base, 129 no aparecian por ningun
     lado. Ahora se piden todas las paginas hasta completar el total que el
     propio servidor informa. */
  const TAM_PAGINA = 100;

  const traerPagina = (pagina) =>
    axios.get(`${baseUrl}admin/user-plan?page=${pagina}&size=${TAM_PAGINA}`,
      {headers: {"Authorization" : `Bearer ${token}`} }
    ).then((r) => r?.data?.data || {});

  const getUsuarios = async () =>{
    start();
    try{
      const primera = await traerPagina(1);
      let filas = primera.content || [];
      const total = primera.totalElements || filas.length;

      /* Las paginas que falten, en paralelo: son pocas y asi la lista no tarda
         mas por cada centenar de clientes. */
      const paginas = Math.ceil(total / TAM_PAGINA);
      if (paginas > 1) {
        const restantes = await Promise.all(
          Array.from({length: paginas - 1}, (_, i) => traerPagina(i + 2))
        );
        restantes.forEach((p) => { filas = filas.concat(p.content || []); });
      }

      const usersTmp = [];
      if(filas.length){

        filas.map((item)=>{
          usersTmp.push({
            id: item.userId,
            name: item.user?.profile?.name, 
            lastName: item.user?.profile?.lastname, 
            phone: item.user?.phoneNumber,
            mail: item.user?.email,
            fecreg: item.user?.registerDate || null,
            dirreg: item.user?.profile?.address || null,
            plan: item.benefits?.subscriptionPlan?.description,
            inicia:item.planInitDate,
            expira: item.planExpirationDate,
            metpago: item.paymentMethod ? item.paymentMethod : '--',
            pago: item.totalPrice? item.totalPrice: '0.0',

            consumedHide: item.consumedBenefits?.orders?.consumed,
            consumedCount: item.consumedBenefits?.orders?.consumed,
            consumedTotal: item.consumedBenefits?.orders?.total,
            /* Los adicionales del plan (desayuno, snack, entrada), para que la
               ficha muestre marcados los que ya tiene. */
            adicionales: Array.isArray(item.consumedBenefits?.additional)
              ? item.consumedBenefits.additional : [],
            consumed: item.consumedBenefits?.orders?.consumed + ' / ' + item.consumedBenefits?.orders?.total,
            /* Con el motivo al lado: en la lista de bajas lo primero que se
               pregunta es por que se fue, no cuando. */
            state: item.user.status === 1
              ? 'Activo'
              : (item.user.bajaMotivo ? `De baja · ${item.user.bajaMotivo}` : 'De baja'),
            /* El numero, no la etiqueta: es lo que usa el segmento "De baja"
               para apartarlos del resto. */
            statusNum: item.user.status,
            bajaAt: item.user.bajaAt || null,
            bajaMotivo: item.user.bajaMotivo || null,
            dni: item.user.documentNumber,
            /* Alergias, azucar y doble proteina viven aqui dentro. Ya venian
               en la respuesta y se descartaban: la ficha los necesita. */
            information: item.user?.profile?.information || null
          })
        })
      }
      setUsers(usersTmp)
      done();

    }catch(err){
      console.log(err)
      fail();
    }
  }

  // Modal
  const [open, setOpen] = useState(false);
  const [tmpData,setTmpData] = useState(
    {
      data:[],
      form:1
    }
  );

  /* Eliminar no abre un formulario: pide confirmacion y llama al servidor.
     Va por aqui para no duplicar el menu de acciones de la fila. */
  const [porEliminar, setPorEliminar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState('');

  const handleOpen = (data,formNumb) => {
    if (formNumb === 'baja') {
      setPorDarDeBaja(data);
      setMotivoBaja('');
      setErrorBaja('');
      return;
    }

    if (formNumb === 'reactivar') {
      reactivarCliente(data);
      return;
    }

    if (formNumb === 'eliminar') {
      setErrorBorrar('');
      setPorEliminar(data);
      return;
    }
    setOpen(true);
    setTmpData({
      ...tmpData,
      form:formNumb,
      data:data? data: null
    });
  };

  /* Dar de baja: lo que se usa cuando un cliente se va. A diferencia de
     eliminar, conserva su historial y se puede deshacer. */
  const [porDarDeBaja, setPorDarDeBaja] = useState(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [errorBaja, setErrorBaja] = useState('');
  const [dandoBaja, setDandoBaja] = useState(false);

  const darDeBaja = () => {
    if (!porDarDeBaja) return;
    setDandoBaja(true);
    setErrorBaja('');
    axios
      .post(`${baseUrl}admin/users/${porDarDeBaja.id}/baja`, { motivo: motivoBaja },
        { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        const msg = r?.data?.data?.message || r?.data?.message;
        setPorDarDeBaja(null);
        getUsuarios();
        if (msg) window.setTimeout(() => window.alert(msg), 60);
      })
      .catch((e) => setErrorBaja(
        e?.response?.data?.data?.message || e?.response?.data?.message ||
        'No pudimos dar de baja al cliente.'))
      .finally(() => setDandoBaja(false));
  };

  const reactivarCliente = (fila) => {
    axios
      .post(`${baseUrl}admin/users/${fila.id}/alta`, {},
        { headers: { Authorization: `Bearer ${token}` } })
      .then(() => getUsuarios())
      .catch(() => window.alert('No pudimos reactivar al cliente.'));
  };

  const eliminarUsuario = () => {
    if (!porEliminar) return;
    setBorrando(true);
    setErrorBorrar('');
    axios
      .delete(`${baseUrl}admin/users/${porEliminar.id}`,
        { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setPorEliminar(null);
        getUsuarios();
      })
      .catch((e) => {
        /* El servidor devuelve 409 con el motivo cuando el usuario tiene
           facturas. Ese mensaje dice que hacer —desactivarlo— asi que se
           muestra tal cual en vez de un "no se pudo" generico. */
        const cuerpo = e?.response?.data;
        setErrorBorrar(
          cuerpo?.data?.message || cuerpo?.message ||
          'No pudimos eliminar el usuario. Intentalo de nuevo.'
        );
      })
      .finally(() => setBorrando(false));
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

  /**
   * Los contactos del segmento que se esta viendo, para la difusion.
   *
   * Cada difusion empezaba con un pedido a mano —"dame el csv de los
   * vencidos"— y alguien corriendo una consulta contra la base. Es una tarea
   * semanal y los datos ya estan en esta pantalla: sale de lo que se ve, con
   * el mismo filtro de segmento y de busqueda aplicados.
   */
  const descargarContactos = () => {
    if (!filteredUsers.length) return;

    const etiqueta = (SEGMENTS.find((x) => x.value === segment)?.label || 'usuarios')
      .toLowerCase().replace(/\s+/g, '-');

    /* El celular va tal cual esta guardado: es lo que se pega en la lista de
       difusion de WhatsApp, y "arreglarlo" aqui solo genera dos formas del
       mismo numero. */
    const filas = [
      ['Nombre', 'Apellido', 'Celular', 'Plan', 'Vence', 'Envíos restantes', 'Estado'],
      ...filteredUsers.map((u) => [
        u.name || '', u.lastName || '', u.phone || '', u.plan || '',
        u.expira ? moment(u.expira).format('DD/MM/YYYY') : '',
        (Number.isFinite(Number(u.consumedTotal)) && Number.isFinite(Number(u.consumedCount)))
          ? Math.max(Number(u.consumedTotal) - Number(u.consumedCount), 0) : '',
        u.state || '',
      ]),
    ];

    const celda = (v) => {
      const t = v === null || v === undefined ? '' : String(v);
      return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    const csv = filas.map((f) => f.map(celda).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos-${etiqueta}-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LayoutPages>
      <TitlePage title={'Usuarios:'} />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {SEGMENTS.map((item) => {
            const selected = segment === item.value;
            return (
              <Chip
                key={item.value}
                label={`${item.label} (${segmentCounts[item.value] ?? 0})`}
                onClick={() => setSegment(item.value)}
                sx={{
                  fontWeight: selected ? 600 : 500,
                  color: selected ? 'common.white' : 'text.secondary',
                  bgcolor: selected ? 'grey.800' : 'background.paper',
                  border: '1px solid',
                  borderColor: selected ? 'grey.800' : 'divider',
                  '&:hover': { bgcolor: selected ? 'grey.700' : 'grey.100' },
                }}
              />
            );
          })}
        </Stack>

        <Button
          variant="outlined"
          size="small"
          disabled={!filteredUsers.length}
          onClick={descargarContactos}
          sx={{ whiteSpace: 'nowrap' }}
          title="Nombres y celulares de los que estás viendo, para la difusión de WhatsApp"
        >
          Descargar contactos ({filteredUsers.length})
        </Button>

        <Box sx={{ width: { xs: '100%', md: 320 } }}>
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
        </Box>
      </Box>

      <div className="inlineFlex usuariosTableCont">
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={status === STATUS.loading}
          slotProps={{ loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' } }}
          slots={{
            noRowsOverlay: () =>
              status === STATUS.error ? (
                <StateMessage
                  dense
                  color="error"
                  icon={<CloudOffRoundedIcon />}
                  title="No pudimos cargar los usuarios"
                  description="Revisa tu conexión y vuelve a intentarlo."
                />
              ) : (
                <StateMessage
                  dense
                  icon={<InboxRoundedIcon />}
                  title="No hay usuarios para mostrar"
                  description="Prueba con otra búsqueda o crea el primer usuario."
                />
              ),
          }}
          initialState={{
            pagination: {
              paginationModel,
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0, width: '100%', minHeight: 520, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          rowHeight={68}
          columnHeaderHeight={48}
          /* Tocar la fila abre su ficha. El menu de acciones ya frena la
             propagacion, asi que elegir "Renovar" no abre las dos cosas. */
          onRowClick={(params) => handleOpen(params.row, 'ficha')}
          disableRowSelectionOnClick
          columnVisibilityModel={{ id: false }}
        />


      </div>
      <div className="usPaBtn inlineFlex">
        {/* Al terminar recarga la tabla: los clientes nuevos tienen que
            verse sin refrescar la pagina. */}
        <UploadUsersCsv onUploaded={getUsuarios} />
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
          title={
            tmpData.form === 'ficha' ? 'Ficha del cliente'
            : tmpData.form === 'renovar' ? 'Renovar plan'
            : tmpData.form === 2 ? 'Actualizar plan'
            : tmpData.form === 3 ? 'Cambiar plan'
            : tmpData.form === 4 ? 'Crear usuario'
            : 'Editar usuario'
          }
        >
          
          {tmpData.form === 'ficha' ?
            <UsuarioFicha
              data = { tmpData.data }
              getUsuarios = { getUsuarios }
              onAccion = { (form) => setTmpData((t) => ({ ...t, form })) }
            />
          : tmpData.form === 1 ?
        
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
          : tmpData.form === 'renovar' ?
            <UsuarioFormRenovarPlan
              data = { tmpData.data }
              handleClose = { handleClose }
              getUsuarios = { getUsuarios }
              planList = { planList }
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

      {/* Confirmacion de borrado. No es un modal mas del panel derecho: es la
          unica accion irreversible de la pantalla y tiene que verse como tal,
          con el nombre de quien se va a borrar escrito delante. */}
      <Dialog
        open={Boolean(porDarDeBaja)}
        onClose={() => !dandoBaja && setPorDarDeBaja(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Dar de baja</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <b>{[porDarDeBaja?.name, porDarDeBaja?.lastName].filter(Boolean).join(' ') || 'Este cliente'}</b>{' '}
            deja de recibir comida y se le cancelan los pedidos que le quedaban
            programados. Su historial se conserva y lo puedes reactivar cuando quieras.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Motivo (opcional)"
            placeholder="Se mudó, ya no quiere, se quejó…"
            value={motivoBaja}
            onChange={(e) => setMotivoBaja(e.target.value)}
          />
          {errorBaja && <Alert severity="error" sx={{ mt: 2 }}>{errorBaja}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPorDarDeBaja(null)} disabled={dandoBaja}>Cancelar</Button>
          <Button onClick={darDeBaja} color="warning" variant="contained" disabled={dandoBaja}>
            {dandoBaja ? 'Dando de baja…' : 'Dar de baja'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(porEliminar)}
        onClose={() => !borrando && setPorEliminar(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Vas a eliminar a{' '}
            <Box component="strong" sx={{ color: 'text.primary' }}>
              {`${porEliminar?.name || ''} ${porEliminar?.lastName || ''}`.trim() || 'este usuario'}
            </Box>
            {porEliminar?.mail ? ` (${porEliminar.mail})` : ''}.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Se borran también su perfil, su plan, su dirección de reparto y sus
            pedidos programados. Esto no se puede deshacer.
          </Typography>

          {errorBorrar && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {errorBorrar}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setPorEliminar(null)}
            disabled={borrando}
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={eliminarUsuario}
            disabled={borrando}
            variant="contained"
            color="error"
            disableElevation
          >
            {borrando ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

    </LayoutPages>
  )
};

export default PageUsuarios;
