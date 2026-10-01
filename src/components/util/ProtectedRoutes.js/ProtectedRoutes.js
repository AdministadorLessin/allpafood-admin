
import { Navigate, Outlet, useLocation } from 'react-router';

import {useState,useEffect} from "react"
import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';
import { puedeVer } from './../../../layouts/nav-config-dashboard';

const ProtectedRoutes = ({
        redirectPath = '/ingresar'
    }) => {

    const { token, setToken, baseUrl, planInfo } = useAuthContext();
    const location = useLocation();

    const validateToken = () =>{
        if(token){
            axios.get(baseUrl+'auth/validate-token',
                {headers: {"Authorization" : `Bearer ${token}`} }
            )
            .then((resp)=>{
                //console.log('========>',resp);
                //setToken(token)
            }).catch((error)=>{
                setToken()
            })
        }

    }

    useEffect(()=>{
        validateToken();
    },[]);

    if(!token){
        
        return <Navigate to={redirectPath} replace />
    }

    /* Ocultar la seccion del menu no alcanza: la direccion se puede escribir a
       mano y quedaria a la vista igual. El servidor ya rechaza al coordinador
       en esos endpoints, pero la pantalla no tiene por que llegar a pedirlos.
       Quien no puede ver algo vuelve a lo primero que si puede. */
    if (!puedeVer(planInfo?.role, location.pathname)) {
        const inicio = { DELIVERY: '/motorizado', EMPRESA: '/empresas' }[planInfo?.role] || '/usuarios';
        return <Navigate to={inicio} replace />;
    }

    return <Outlet />
};

export default ProtectedRoutes;
