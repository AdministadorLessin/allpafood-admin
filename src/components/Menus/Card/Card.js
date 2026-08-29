import React from "react";

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import imgFood from '../../../assets/img/plato_demo.png';

import './Card.scss';

const MenuCard = ({data,openModal,updateMenu,menu}) => {

  const menuChange = () =>{
    openModal();
    updateMenu(data);
  }

  return (
    <div className="inlineBlock menuCard">
      <Card >
        <CardHeader
          action={
            <IconButton 
              onClick={()=>
                menuChange(data)
              } 
              aria-label="settings"
            >
              <EditIcon />
            </IconButton>
          }
          title={data.name}
          subheader={data.description}
        />
        <CardMedia
          component="img"
          height="194"
          image={data.imageUrl  ? data.imageUrl : imgFood}
        />
        <CardContent>
          <div className="inlineBlock cardMenuMacros">
            {data.properties && data.properties.length &&  data.properties.length > 0 &&
              <ul>
                {data.properties.map((item,index)=>(
                  <li>
                    <small>{item.name}</small>
                    <strong>{item.value} {index === 0 ? 'kcal': 'gr'}</strong>
                  </li>
                ))}
              </ul>
            }
          </div>
        </CardContent>
        
      </Card>
      
    </div>
  )
};

export default MenuCard;
