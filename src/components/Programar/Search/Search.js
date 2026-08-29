import {useState,useEffect} from "react";
import ProgramMenuCard from './../CardMenu/CardMenu';
import Grid from '@mui/material/Grid';

import './Search.scss';

import IconButton from '@mui/material/IconButton';
import FilledInput from '@mui/material/FilledInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';


const ProgramSearchMenu = ({menus,dayMenu,setDayMenu,nameCat}) => {

  const [searchTxt,setSearchTxt] = useState('');

  const [menuListTmp,setMenuListTmp] = useState(menus);

  const searchChange = (e) =>{
    const lowerCase = e.target.value.toLowerCase();
    setSearchTxt(lowerCase);
    const filteredItems2 = menus.filter((item) =>
      item.name.toLowerCase().includes(searchTxt)
    );
    setMenuListTmp(filteredItems2);
  }
  

  return (
    <div className="inlineBlock programSearch">
        <h2>{nameCat}</h2>

        <div className="inlineFlex pageMenuFilters">

          <div className="inlineFlex pmSearchBox">
            <FormControl sx={{width: '100%' }} variant="filled">
              <InputLabel htmlFor="filled-adornment-password">Bucar:</InputLabel>
              <FilledInput
                id="outlined-adornment-password"
                type={'text'}
                value={searchTxt}
                onChange={searchChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={'Bucar'}
                      edge="end"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
                label="Bucar"
              />
            </FormControl>
          </div>
          <div className="inlineFlex pageMenuTotalBox">
            <small>Encontramos</small><p><strong>{menuListTmp && menuListTmp.length && menuListTmp.length} Resultados</strong></p>
          </div>
        </div>

        <div className="programSearchFilter">
          {menuListTmp && menuListTmp.length && menuListTmp.length > 0 &&
            <Grid container spacing={2}>
              {menuListTmp.map((item)=>(
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProgramMenuCard 
                    data={item} 
                    dayMenu={dayMenu}
                    setDayMenu={setDayMenu}
                  />
                </Grid>
              ))}
            </Grid>
          }
        </div>
    </div>
  )
};

export default ProgramSearchMenu;
