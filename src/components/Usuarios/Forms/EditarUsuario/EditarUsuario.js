import { useState, useEffect } from "react";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import './EditarUsuario.scss';

import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import { useForm, Controller  } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';

import axios from 'axios';
import { useAuthContext } from "../../../../context/authContext";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#65C466',
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#2ECA45',
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D',
    }),
  },
}));

const UsuarioFormEditar = ({data,handleClose,getUsuarios}) => {

    const { token, baseUrl } = useAuthContext();

    const [bodyFields,setBodyFields] = useState({
        uname:'',
        ulastname:'',
        uemail:'',
        udocumentNumber:'',
        uphoneNumber:'',
        ustatus:'',
    });

    const validationSchema = Yup.object().shape({
        uname: Yup.string()
            .required('El nombre es obligatorio')
            .min(3, 'El nombre debe tener al menos 3 caracteres'),

        ulastname: Yup.string()
            .required('El apellido es obligatorio')
            .min(3, 'El apellido debe tener al menos 3 caracteres'),

        uemail: Yup.string()
            .email('Ingrese un correo válido')
            .required('El correo es obligatorio'),

        udocumentNumber: Yup.string()
            .required('El DNI es obligatorio')
            .min(8).max(9),

        uphoneNumber: Yup.string()
            .required('El teléfono es obligatorio')
            .min(11).max(14),

        uactivo: Yup.boolean()
    });

    const handleFieldChange = (e) => {
        setBodyFields({
            ...bodyFields,
            [e.target.name]:e.target.value
        })
    }

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        mode: "all",
        shouldUnregister: true,
        resolver: yupResolver(validationSchema),
    });

    const [errorAxios,setErrorAxios] = useState(false);
    const [loadForm,setLoadForm] = useState(false);
  
    const updateData = (dataForm) =>{

        setLoadForm(true)

        const userUpdate = {
            name: dataForm.uname,
            lastname: dataForm.lastname,
            email: dataForm.uemail,
            //password: "Password123*",
            documentNumber: dataForm.udocumentNumber,
            phoneNumber: dataForm.uphoneNumber,
            status: dataForm.uactivo === true ? 1 : 0,
            districts:[]
        }

        axios.put(baseUrl+'admin/users/'+data.id,
            userUpdate,
            {
                headers: {"Authorization" : `Bearer ${token}`} 
            }
        ).then((resp)=>{
            console.log('el menu se agrego exitosamente',resp)
            setLoadForm(false);
            handleClose();
            getUsuarios();
        }).catch((error) =>{
            console.log(error);
            setErrorAxios(true);
            setLoadForm(false);
        })
    }

    const onSubmitHandler = (dataForm) => {
        updateData(dataForm)
    };

    const [switchActive, setSwitchActive] = useState({
        activo: data.state === 'Activo' ? true : false
    });

    const handleChange = (event) => {
        setSwitchActive({
            ...switchActive,
            [event.target.name]: event.target.checked,
        });
    };

    useEffect(()=>{
        setBodyFields({
            uname: data.name,
            ulastname: data.lastName,
            uemail: data.mail,
            udocumentNumber: data.dni,
            uphoneNumber: data.phone,
            ustatus: data.state === 'Activo' ? true : false
        });
    },[]);

    return (
        <div className="inlineBlock">
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Nombre" 
                                variant="filled"
                                id="uname" 
                                name="uname" 
                                value={bodyFields ? bodyFields.uname : ''}
                                error={errors.uname ? true : false}
                                {...register("uname")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Apellido" 
                                variant="filled"
                                id="ulastname" 
                                name="ulastname" 
                                value={bodyFields ? bodyFields.ulastname : ''}
                                error={errors.ulastname ? true : false}
                                {...register("ulastname")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Email" 
                                variant="filled"
                                type={'email'}
                                id="uemail" 
                                name="uemail" 
                                value={bodyFields ? bodyFields.uemail : ''}
                                error={errors.uemail ? true : false}
                                {...register("uemail")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Dni" 
                                type='number'
                                variant="filled"
                                id="udocumentNumber" 
                                name="udocumentNumber" 
                                value={bodyFields ? bodyFields.udocumentNumber : ''}
                                error={errors.udocumentNumber ? true : false}
                                {...register("udocumentNumber")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Telefono" 
                                type='phone'
                                variant="filled"
                                id="uphoneNumber" 
                                name="uphoneNumber" 
                                value={bodyFields ? bodyFields.uphoneNumber : ''}
                                error={errors.uphoneNumber ? true : false}
                                {...register("uphoneNumber")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex ufeSwitchBox">
                            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                                <div className="switchLabel">
                                    <p>Estado:</p>
                                </div>
                                <FormControlLabel
                                    control={
                                    <Controller
                                        name="uactivo"
                                        control={control}
                                        defaultValue={switchActive.activo}
                                        render={({ field }) => (
                                            <IOSSwitch
                                                checked={field.value}
                                                onChange={(e) => {
                                                    field.onChange(e.target.checked);

                                                    setSwitchActive({
                                                        ...switchActive,
                                                        activo: e.target.checked,
                                                    });
                                                }}
                                            />
                                        )}
                                    />
                                    }
                                />
                            </div>
                        </div>
                    </Grid>
                    
                    {errorAxios &&
                        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                            <Alert severity="error">No se actualizaron los datos. intentelo mas tarde por favor.</Alert>
                        </Grid>
                    }

                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <button
                            className={loadForm ? 'btnPrimary btnDisabled' : 'btnPrimary ' }
                        >
                            Actualizar
                        </button>
                    </Grid>
                </Grid>
            </form>
        </div>
    )
};

export default UsuarioFormEditar;
