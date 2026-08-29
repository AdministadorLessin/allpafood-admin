import {useState,useEffect} from "react";
import './Motorizados.scss';
import LayoutPages from './../../components/LayoutPages/LayoutPages';
import TitlePage from './../../components/Pages/Title/Title';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';

import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuthContext } from './../../context/authContext';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import axios from 'axios';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const PageMotorizados = (props) => {

    const {baseUrl,token} = useAuthContext();
    const [formSwitch,setFormSwitch] = useState(false);
    const [respCreate,setRespCreate] = useState(false);
    const [selectUser,setSelectUser] = useState();
    
    //Listar motorizado
    const [motorizadosList,setMotorizadosList] = useState();
    
    const getMotorizados = ()=>{
        axios.get(baseUrl+'delivery/motorized/find-users',
            {headers: {"Authorization" : `Bearer ${token}`} }
        ).then((resp)=>{
            console.log(resp.data.data)
            setMotorizadosList(resp.data.data)
        }).catch((error)=>{
            console.log(error)
        })
    }

    // Agregar motorizado
    const [age, setAge] = useState([]);
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        
        // El valor devuelto por MUI select múltiple siempre es un array
        const nuevoArregloDistritos = typeof value === 'string' ? value.split(',') : value;
        
        setAge(nuevoArregloDistritos); // Actualiza la vista (los Chips)
        setValue("mdistrito", nuevoArregloDistritos, { shouldValidate: true }); // Actualiza el validador
    };

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);

    };

    const handleClose = () => {
        setOpen(false);
        //setRespCreate(false);
        setAge([]); // Resetea la interfaz de los chips
        setValue("mdistrito", []); // Resetea el valor en el lector del formulario

        setValue("mname", "");
        setValue("mapellidos", "");
        setValue("mtelefono", "");
        setValue("mcorreo", "");
        setValue("mdni", "");
        setValue("mclave", "");
        setFormSwitch(false);
    };
    

    const distritosList = [
        { id: 1, name: 'Ate' },
        { id: 2, name: 'Barranco' },
        { id: 3, name: 'Barrios Altos' },
        { id: 4, name: 'Bellavista' },
        { id: 5, name: 'Breña' },
        { id: 6, name: 'Cercado de Lima' },
        { id: 7, name: 'Distrito de San Luis' },
        { id: 8, name: 'Distrito del Callao' },
        { id: 9, name: 'El Agustino' },
        { id: 10, name: 'Jesus Maria' },
        { id: 11, name: 'La Molina' },
        { id: 12, name: 'La Perla' },
        { id: 13, name: 'La Victoria' },
        { id: 14, name: 'Lince' },
        { id: 15, name: 'Magdalena del Mar' },
        { id: 16, name: 'Miraflores' },
        { id: 17, name: 'Pueblo Libre' },
        { id: 18, name: 'San Borja' },
        { id: 19, name: 'San Isidro' },
        { id: 20, name: 'San Miguel' },
        { id: 21, name: 'Santa Anita' },
        { id: 22, name: 'Santiago de Surco' },
        { id: 23, name: 'Surquillo' },
    ];
    
    const validationSchema = Yup.object().shape({
        mname: Yup.string().required('ingrese un correo valido').min(3),
        mapellidos: Yup.string().required('ingrese un correo valido').min(3),
        mtelefono: Yup.string().required('ingrese un correo valido').min(3).max(12),
        mcorreo: Yup.string().required('ingrese un correo valido').email().matches(/^(?!.*@[^,]*,)/),
        mdni: Yup.string().required('ingrese un correo valido').min(8).max(8),
        mdistrito: Yup.array().min(1, 'Debe seleccionar al menos un distrito').required('Campo requerido'),
        mclave: Yup.string().required('ingrese un correo valido').min(3),
    });

    const {
        register,
        handleSubmit,
        setValue, // <--- Agrega esto aquí
        formState: { errors },
    } = useForm({
        mode: "all",
        shouldUnregister: true,
        resolver: yupResolver(validationSchema),
    });

    const createDeliveryUser = (data) =>{
        const dataTmp = {
            name:data.mname,
            lastname:data.mapellidos,
            email: data.mcorreo,
            password: data.mclave,
            documentNumber: data.mdni,
            phoneNumber: data.mtelefono,
            districts:data.mdistrito
        }

        axios.post(baseUrl+'delivery/motorized/create-user',
            dataTmp,
            {
                headers: {"Authorization" : `Bearer ${token}`} 
            }
        ).then((resp)=>{
            //setRespCreate(true);
            getMotorizados();
            handleClose();
        }).catch((error) =>{
            console.log(error)
        })
    }

    const updateMotorizado = (dataEdith)=>{
        console.log('updateMotorizado ===>',dataEdith)
        setSelectUser(dataEdith.id)
        setFormSwitch(true);


        // Asignar los valores a react-hook-form correspondientes a cada campo
        setValue("mname", dataEdith.profile?.name || "");
        setValue("mapellidos", dataEdith.profile?.lastname || "");
        setValue("mtelefono", dataEdith.phoneNumber || "");
        setValue("mcorreo", dataEdith.email || "");
        setValue("mdni", dataEdith.documentNumber || "");
        
        // 1. Validamos cómo vienen los distritos. Si es un string separado por comas de tu DB, lo hacemos array.
        // Si ya es un array directo (ej: item.districts), lo usamos directamente.
        let distritosSeleccionados = [];
        if (Array.isArray(dataEdith.districts)) {
            distritosSeleccionados = dataEdith.districts;
        } else if (dataEdith.profile?.district) {
            // Por si acaso venga como un string "Ate, Lince"
            distritosSeleccionados = dataEdith.profile.district.split(',').map(d => d.trim());
        }

        // 2. Seteamos ambos estados al mismo tiempo
        setAge(distritosSeleccionados);
        setValue("mdistrito", distritosSeleccionados, { shouldValidate: true });

        setValue("mclave", ""); // Opcional: Dejar la clave vacía por seguridad al editar

        handleOpen();
    }

    const updateDeliveryUser = (data) =>{
        const dataTmp = {
            name:data.mname,
            lastname:data.mapellidos,
            email: data.mcorreo,
            password: data.mclave,
            documentNumber: data.mdni,
            phoneNumber: data.mtelefono,
            districts:data.mdistrito
        }

        axios.put(baseUrl+'delivery/motorized/'+selectUser,
            dataTmp,
            {
                headers: {"Authorization" : `Bearer ${token}`} 
            }
        ).then((resp)=>{
            console.log('el menu se agrego exitosamente',resp)
            getMotorizados();
            handleClose();
            setFormSwitch(false);
        }).catch((error) =>{
            console.log(error);
            setFormSwitch(true);
        })

    }

    const onSubmitHandler = (data) => {
        //console.log(formSwitch)
        if(formSwitch){
            updateDeliveryUser(data);
            //console.log('1')
        }else{
            createDeliveryUser(data);
            //console.log('2')
        }
    };
    
    const [loading, setLoading] = useState(false);
    const deleteMotorizado = (item) =>{
        setLoading(true);
        axios.delete(baseUrl + 'delivery/motorized/delete-user', {
            data: {
                userId: item
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((resp) => {
            console.log('usuario eliminado', resp);
            setLoading(false);
            getMotorizados();
        })
        .catch((err) => {
            console.log('error', err);
            setLoading(false);
        });
    }

    useEffect(()=>{
        getMotorizados();
    },[])

    return (
        <LayoutPages>

            <TitlePage title={'Motorizados Panel'} />

            <TableContainer component={Paper}>
                <Table fullWidth aria-label="simple table">

                    <TableHead>
                        <TableRow>
                            <TableCell>Nombres</TableCell>
                            <TableCell>Apellidos</TableCell>
                            <TableCell align="right">Telefono</TableCell>
                            <TableCell align="right">Correo</TableCell>
                            <TableCell align="right">DNI</TableCell>
                            <TableCell align="right">Distrito</TableCell>
                            <TableCell align="right">Accion</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {motorizadosList && motorizadosList.length && motorizadosList.map((item,index) => (
                            <TableRow
                                key={index + 'sasda-motr'}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="left">
                                    {item.profile?.name}
                                </TableCell>
                                <TableCell align="right">
                                    {item.profile?.lastname}
                                </TableCell>
                                <TableCell align="right">
                                    {item.phoneNumber}
                                </TableCell>
                                <TableCell align="right">
                                    {item.email}
                                </TableCell>
                                <TableCell align="right">
                                    {item.documentNumber}
                                </TableCell>
                                <TableCell align="right">
                                    {item.profile?.district}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Eliminar motorizado">
                                        <IconButton onClick={() => deleteMotorizado(item.id)} loading={loading}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    {true &&
                                        <Tooltip title="Editar motorizado">
                                            <IconButton 
                                                onClick={() => updateMotorizado(item)} 
                                                loading={loading}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <div className="inlineBlock motBtnBox">
                <button 
                    onClick={
                        handleOpen
                    }
                    className={'btnPrimary'}
                >
                    Crear motorizado
                </button>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="inlineFlex modaForms motAddModal">
                    <h3>{ !formSwitch ? 'Agregar motorizado' : 'Editar motorizado' } </h3>

                    <form className={'inlineBlock'} onSubmit={handleSubmit(onSubmitHandler)}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            {false && respCreate &&
                                <Alert className={'alertForms'} icon={<CheckIcon fontSize="inherit" />} severity="success">
                                    El usuario se a creado exitosamente
                                </Alert>
                            }
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Nombre:" 
                                variant="filled"
                                id="mname" 
                                name="mname"
                                error={errors.mname ? true : false}
                                {...register("mname")} 
                                //onChange={handleFieldChange}
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Apellidos:" 
                                variant="filled"
                                id="mapellidos" 
                                name="mapellidos" 
                                error={errors.mapellidos ? true : false}
                                {...register("mapellidos")} 
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Teléfono:" 
                                variant="filled"
                                id="mtelefono" 
                                type='number'
                                name="mtelefono" 
                                error={errors.mtelefono ? true : false}
                                {...register("mtelefono")} 
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Correo:" 
                                variant="filled"
                                id="mcorreo" 
                                name="mcorreo" 
                                error={errors.mcorreo ? true : false}
                                {...register("mcorreo")} 
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="DNI:" 
                                variant="filled"
                                id="mdni" 
                                type='number'
                                name="mdni" 
                                error={errors.mdni ? true : false}
                                {...register("mdni")} 
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">

   

                            <FormControl fullWidth error={errors.mdistrito ? true : false}>
                                <InputLabel id="demo-multiple-chip-label">Distrito</InputLabel>
                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="mdistrito"
                                    name='mdistrito'
                                    multiple
                                    value={age} // Controlado por tu estado local
                                    onChange={handleChange} // Ejecuta la actualización manual doble
                                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {distritosList.map((item)=>(
                                        <MenuItem key={item.id+item.name} value={item.name}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {/* Opcional: Mostrar el texto de error de Yup si no eligen ninguno */}
                                {errors.mdistrito && <p className="error-text">{errors.mdistrito.message}</p>}
                            </FormControl>

                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Contraseña:" 
                                variant="filled"
                                id="mclave" 
                                type='password'
                                name="mclave" 
                                error={errors.mclave ? true : false}
                                {...register("mclave")} 
                            />
                        </div>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <button type='submit' className="inlineBlock btnPrimary">
                                Enviar
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

        </LayoutPages>
    )
};

export default PageMotorizados;
