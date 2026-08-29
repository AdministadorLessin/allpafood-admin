import './LayoutPages.scss'
import Sidebar from './../global/sidebar/sidebar';
import { useParams } from "react-router";

import {useEffect} from "react";
import BackdropApp from './../util/backdrop/backdrop';

const LayoutPages = ({children,cssClass}) => {

    let {slug} = useParams();

    useEffect(()=>{
        //console.log('==>',slug)
    },[])

    return (
        <main className={cssClass ? 'pageBox '+cssClass : ' pageBox'}>
            
            <BackdropApp />
            
            <div className="sidebarCont">
                <Sidebar />
            </div>
            <div className="pageContent">
                {children}
            </div>
        </main>
    )
};

export default LayoutPages;
