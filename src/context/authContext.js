import { createContext, useContext, useMemo, useState, useEffect } from 'react';
//import axios from 'axios';
export const AuthContext = createContext();

const storageToken = 'aftkn';
const storageInfo = 'inf';

export default function AuthContextProvider({children}) {
    
    const baseUrl= 'https://api.allpafood.com/dev/api-af/v1/';
    const [token,setToken] = useState(() =>
        window.localStorage.getItem(storageToken)
    );

    const [planInfo,setPlanInfo] = useState(() => {
        const infoTmp =  window.localStorage.getItem(storageInfo);
        return JSON.parse(infoTmp);
    });
    
    const handleUpdateToken = (code,data) =>{
        if(data){
            window.localStorage.setItem('inf',JSON.stringify(data));
            setPlanInfo(data);
        }
        window.localStorage.setItem('aftkn',code);
        setToken(code);
    }

    const expirationDuration = 1000 * 60 * 60 * 12; // 12 hours

    const value = useMemo(
        () => ({
            token,
            baseUrl,
            setToken,
            planInfo,
            setPlanInfo,
            handleUpdateToken,
        }),
        [
            token, 
            baseUrl,
            setToken,
            planInfo,
            setPlanInfo,
            handleUpdateToken,
        ]
    );

    useEffect(()=>{
        setTimeout(()=> {
        }, expirationDuration);
    },[])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    return useContext(AuthContext);
}