import { useState } from 'react';
import './Login.scss';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthContext } from '../../../context/authContext';
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import axios from 'axios';
import BackdropApp from './../../../components/util/backdrop/backdrop';

const LoginPage = (props) => {

    let navigate = useNavigate();
    const { handleUpdateToken,baseUrl } = useAuthContext();

    const [bodyFields,setBodyFields] = useState({
        lfcorreo:'',
        lfpassword:''
    });
        
    const validationSchema = Yup.object().shape({

        lfcorreo: Yup.string().required('ingrese un correo valido').email().matches(/^(?!.*@[^,]*,)/),
        lfpassword: Yup.string()
                        .required('Ingrese un telefono valido por favor.')
                        .min(3,'Ingrese un telefono valido por favor.')
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
        formState: { errors },
    } = useForm({
        mode: "all",
        shouldUnregister: true,
        resolver: yupResolver(validationSchema),
    });

    const [errorAxios,setErrorAxios] = useState(false);
    const [sending,setSending] = useState(false);
    const sendData = () =>{
        setSending(true);
        setErrorAxios(false);
        axios.post(baseUrl+'auth/login',
            {
            username:bodyFields.lfcorreo,
            password:bodyFields.lfpassword
            }).then((resp)=>{
            if(resp.status === 200){

                let userDate = resp.data.data;
                
                userDate.log = bodyFields.lfcorreo;
                handleUpdateToken(resp.data.data.token,userDate);

                //console.log(resp.data.data)
                if(userDate.role === 'DELIVERY'){
                    navigate('/motorizado')
                }else{
                    navigate('/')
                }
            }
            
            }).catch((error) =>{
                // Solo se libera el boton en el fallo: si el login funciona la
                // pantalla navega, y reactivarlo antes deja ver un parpadeo.
                setSending(false);
                setErrorAxios(true)
            })
    }
    
    const onSubmitHandler = (data) => {
        sendData(data)
    };

    return (
        <main className="inlineFlex secBox loginPage">
            <BackdropApp />
            <form className="inlineFlex loginFormBox" onSubmit={handleSubmit(onSubmitHandler)}>
                <h2>Ingresar</h2>
                <div className="inlineFlex loginForm">
                    <div className="inlineFlex textFieldAdminLogin textFieldAdmin loginTextFieldUser">
                        <TextField 
                            fullWidth
                            label="Usuario" 
                            variant="filled"
                            id="lfcorreo" 
                            name="lfcorreo" 
                            value={bodyFields ? bodyFields.lfcorreo : ''}
                            error={errors.lfcorreo ? true : false}
                            {...register("lfcorreo")} 
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div className="inlineFlex textFieldAdminLogin textFieldAdmin loginTextFieldClave">
                        <TextField 
                            fullWidth
                            label="Clave" 
                            variant="filled"
                            id="lfpassword" 
                            name="lfpassword" 
                            type={'password'}
                            value={bodyFields ? bodyFields.lfpassword : ''}
                            error={errors.lfpassword ? true : false}
                            {...register("lfpassword")} 
                            onChange={handleFieldChange}
                        />
                    </div>

                    <Button 
                        type={'submit'} 
                        variant="contained"
                        className={'btnPrimary'}
                        disabled={sending}
                        startIcon={sending ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {sending ? 'Ingresando…' : 'Ingresar'}
                    </Button>

                    {errorAxios &&
                        <div className="inlineFlex loginErrors">
                            <p><ErrorOutlineIcon />Verifique sus credenciales por favor.</p>
                        </div>
                    }
                </div>
            </form>
        </main>
    )
};

export default LoginPage;
