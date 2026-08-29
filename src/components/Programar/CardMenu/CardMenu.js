
import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';

import imgFood from '../../../assets/img/plato_demo.png';

import './CardMenu.scss';

const ProgramMenuCard = ({data,dayMenu,setDayMenu}) => {

    const selectMenu = () => {
        setDayMenu(prev => {
            const updatedMenu = { ...prev };

            (data.types || []).forEach(type => {
                if (updatedMenu[type]) {
                    updatedMenu[type] = [...updatedMenu[type], data];
                }
            });
            console.log(updatedMenu)
            return updatedMenu;
        });
    };

    return (
        <div 
            className="inlineFlex proMenuCard"
            //onClick={()=>console.log(data)}
        >

            <figure>
                <img src={data.imageUrl ? data.imageUrl : imgFood} alt="" />
            </figure>
            <div className="txt">
                <h4>{data.name}</h4>
                {false &&
                    <p>{data.description}</p>
                }
            </div>
            <div className="action">
                <IconButton aria-label="settings" onClick={selectMenu}>
                    <AddIcon />
                </IconButton>
            </div>
        </div>
    )
};

export default ProgramMenuCard;
