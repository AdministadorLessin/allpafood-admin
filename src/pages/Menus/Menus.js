import axios from 'axios';
import { useState, useEffect } from 'react';
import TitlePage from './../../components/Pages/Title/Title';
import LayoutPages from './../../components/LayoutPages/LayoutPages';
import DataState from "./../../components/ui/DataState";
import useDataStatus from "./../../components/ui/useDataStatus";
import MenuCard from './../../components/Menus/Card/Card';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';

import { useAuthContext } from './../../context/authContext';

import './Menus.scss';
import MenuAddMenu from './../../components/Menus/Forms/AddMenu';

import IconButton from '@mui/material/IconButton';
import FilledInput from '@mui/material/FilledInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import ModalRightCont from './../../components/ModalRightCont/ModalRightCont';

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";


const PageMenus = (props) => {

  const ITEMS_PER_PAGE = 8;

  const [page, setPage] = useState(1);

  const [menusList,setMenusList] = useState();
  const [menusListFilter,setMenusListFilter] = useState();
  const [catList,setCatList] = useState();
  const [catSelect,setCatSelect] = useState();

  const [searchTxt,setSearchTxt] = useState('');
  const { token,baseUrl } = useAuthContext();
  const { status, start, done, fail } = useDataStatus();

  const getMenus = () => {
    start();
    axios.get(baseUrl + 'menu', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((resp) => {
      const menus = resp.data.data;

      setMenusList(menus);
      setMenusListFilter(menus);

      const types = [
        ...new Set(
          menus.flatMap(menu => menu.types || [])
        )
      ];

      setCatList(types);
      done();
    })
    .catch((error) => {
      console.log(error);
      fail();
    });
  };

  const filterMenus = (cat, txtField) => {
    const filtered = menusList.filter((item) => {
      const matchCategory = !cat || item.types?.includes(cat);

      const matchText =
        !txtField ||
        item.name.toLowerCase().includes(txtField.toLowerCase());

      return matchCategory && matchText;
    });

    setMenusListFilter(filtered);
    setPage(1); // Reiniciar paginación
  };

  const searchChange = (e) =>{
    const lowerCase = e.target.value;
    setSearchTxt(lowerCase);
    filterMenus(catSelect,lowerCase);
  }

  const totalPages = Math.ceil((menusListFilter?.length || 0) / ITEMS_PER_PAGE);

  const menusToShow = menusListFilter?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const changeFilterMenu = (cat) =>{
    setCatSelect(cat)
    filterMenus(cat,searchTxt);
  }

  const [modalMenu, setModalMenu] = useState(false);
  const [medMod,setMedMod] = useState();

  const handleModalMenuOpen = () => {
    setModalMenu(true)
    setMedMod();
  };
  
  const handleModalMenuClose = () => {
    setModalMenu(false)
    setMedMod();
  };

  const categoryNames = {
    lunch: "Almuerzo",
    breakfast: "Desayuno",
    drinks: "Bebida",
    dinner: "Cena",
    starter: "Entrada",
    snacks: "Aperitivos",
  };

  useEffect(()=>{
    getMenus();
  },[])

  return (
    <LayoutPages>
      <TitlePage title={'Menus'} />

      <div className="inlineFlex pageMenuFilters">
        <div className="inlineFlex pmSearchBox">
          <FormControl sx={{ m: 1, width: '25ch' }} variant="filled">
            <InputLabel htmlFor="filled-adornment-password">Buscar:</InputLabel>
            <FilledInput
              id="outlined-adornment-password"
              type={'text'}
              value={searchTxt}
              onChange={searchChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={'Buscar'}
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

          {catList && catList.length && catList.length > 0 &&
            <div className="pageMenuCategories">
              
              {catList?.map((item) => {
                const total = menusList.filter(menu => menu.types?.includes(item)).length;

                return (
                  <Button
                    key={item}
                    variant="outlined"
                    onClick={() => changeFilterMenu(item)}
                    size="small"
                  >
                    {categoryNames[item] || item} ({total})
                  </Button>
                );
              })}
              <Button variant="outlined" onClick={()=>changeFilterMenu('')} size="small">
                Todos - {menusListFilter && menusListFilter.length ? menusListFilter.length : 0}
              </Button>
            </div>
          }
        <Button 
          className="btnPrimary" 
          variant="contained" 
          onClick={handleModalMenuOpen}
        >
          Agregar menu
        </Button>
      </div>

      <div className="inlineBlock pageMenuCont">
        <div className="inlineBlock pageMenuList">
          
            <DataState
              status={status}
              isEmpty={!menusListFilter || menusListFilter.length === 0}
              onRetry={getMenus}
              variant="cards"
              skeletonCount={8}
              emptyTitle="No hay platos en el catálogo"
              emptyDescription="Crea el primer menú para empezar a programar la semana."
            >
            <Grid container spacing={2}>
              {menusToShow?.map((item) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <MenuCard
                    data={item}
                    updateMenu={setMedMod}
                    menu={medMod}
                    openModal={handleModalMenuOpen}
                  />
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                {totalPages > 1 && (
                  <Stack
                    spacing={2}
                    sx={{
                      mt: 4,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Pagination
                      page={page}
                      count={totalPages}
                      color="primary"
                      onChange={(event, value) => setPage(value)}
                    />
                  </Stack>
                )}
              </Grid>
            </Grid>
            </DataState>
          


        </div>
      </div>

      <Modal
        open={modalMenu}
        onClose={handleModalMenuClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalRightCont
        >
          <MenuAddMenu closeModal={handleModalMenuClose} listMenu={getMenus} updateMenu={setMedMod} menu={medMod}  />
        </ModalRightCont>
      </Modal>
    </LayoutPages>
  )
};

export default PageMenus;
