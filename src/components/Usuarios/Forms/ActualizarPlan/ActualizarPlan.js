import { useState, useEffect } from "react";
import './ActualizarPlan.scss';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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

import axios from 'axios';
import { useAuthContext } from "../../../../context/authContext";

const UsuarioFormActualizarPlan = ({data,handleClose,getUsuarios}) => {

    const { token, baseUrl } = useAuthContext();

    const [bodyFields,setBodyFields] = useState({
        penvios: '',
        pexpiracion: '',
    });

    const validationSchema = Yup.object().shape({
        penvios: Yup.string()
            .required('El nombre es obligatorio')
            .min(1, 'El nombre debe tener al menos 3 caracteres').max(2),

        pexpiracion: Yup.string()
            .required('El apellido es obligatorio')
            .min(3, 'El apellido debe tener al menos 3 caracteres')
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

        /* El total sale de lo que el cliente tiene AHORA, no de un 20 escrito
           a mano: quien renovo con envios pendientes tiene 40, y forzar 20
           aqui le borraba la mitad de lo que pago. */
        const userUpdate = {
            planExpirationDate: dataForm.pexpiracion,
            consumedBenefits: {
                orders: {
                    "total": Number(vivo?.total ?? data.consumedTotal ?? 20),
                    "consumed": Number(dataForm.penvios)
                }
            }
        }

        axios.put(baseUrl+'admin/user-plan/'+data.id,
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

    /* El consumo se relee del servidor al abrir, no se toma de la lista.
       La lista puede llevar minutos cargada, y en ese rato el cliente pudo
       pedir o el automatico pudo armarle la semana: guardar sin tocar nada
       reescribia el consumo con un numero viejo y le regalaba envios que ya
       habia gastado, sin que nadie lo notara. */
    const [vivo, setVivo] = useState(null);

    useEffect(()=>{
        setBodyFields({
            penvios: data.consumedHide,
            pexpiracion: data.expira,
        });

        axios.get(baseUrl+'admin/user-plan/'+data.id, { headers: {"Authorization" : `Bearer ${token}`} })
            .then((resp)=>{
                const plan = resp?.data?.data;
                const ordenes = plan?.consumedBenefits?.orders;
                if (!ordenes) return;
                setVivo(ordenes);
                setBodyFields((b)=>({
                    ...b,
                    penvios: ordenes.consumed,
                    pexpiracion: plan.planExpirationDate || b.pexpiracion,
                }));
            })
            .catch((error)=>{ console.log('plan', error); });
    },[]);

    return (
        <div>
            <div className="inlineBlock">
                <form onSubmit={handleSubmit(onSubmitHandler)}>
                    <Grid container spacing={2}>
                        {vivo &&
                            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                                <Alert severity="info">
                                    Ahora mismo lleva <b>{vivo.consumed} de {vivo.total}</b> envíos.
                                </Alert>
                            </Grid>
                        }
                        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                                <TextField 
                                    fullWidth
                                    label="Envios:" 
                                    variant="filled"
                                    type='number'
                                    id="penvios" 
                                    name="penvios" 
                                    value={bodyFields ? bodyFields.penvios : ''}
                                    error={errors.penvios ? true : false}
                                    {...register("penvios")} 
                                    onChange={handleFieldChange}
                                />
                            </div>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                                <TextField 
                                    fullWidth
                                    label="Fecha de expiracion:" 
                                    variant="filled"
                                    type='date'
                                    id="pexpiracion" 
                                    name="pexpiracion" 
                                    value={bodyFields ? bodyFields.pexpiracion : ''}
                                    error={errors.pexpiracion ? true : false}
                                    {...register("pexpiracion")} 
                                    onChange={handleFieldChange}
                                />
                            </div>
                        </Grid>


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
        </div>
    )
};

export default UsuarioFormActualizarPlan;
