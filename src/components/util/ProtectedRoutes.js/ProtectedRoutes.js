
import { Navigate, Outlet } from 'react-router';

import {useState,useEffect} from "react"
import axios from 'axios';
import { useAuthContext } from './../../../context/authContext';

const ProtectedRoutes = ({
        redirectPath = '/ingresar'
    }) => {

    const { token, setToken, baseUrl } = useAuthContext();

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

    return <Outlet />
};

export default ProtectedRoutes;
