import { useState, useEffect } from "react";
import { useAuthContext } from './../../../context/authContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";


import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

import './AddMenu.scss';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Grid from '@mui/material/Grid';

import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  slotProps: {
    paper: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  },
};

const MenuAddMenu = ({closeModal,menu,listMenu}) => {

    //let navigate = useNavigate();
    const { token, baseUrl } = useAuthContext();

    const [bodyFields,setBodyFields] = useState({
            mname:'',
            mdescription:'',
            mcalorias:0,
            mcarbo:0,
            mgrasas:0,
            mproteinas:0,
            mtype:'lunch',
            mpreviousPrice:15,
            mprice:15
    });


    const catList = [
        {
            name:'Desayuno',
            value:'breakfast'
        },

        {
            name:'Entrada',
            value:'starter'
        },

        {
            name:'Almuerzo',
            value:'lunch'
        },
        {
            name:'Cena',
            value:'dinner'
        },

        {
            name:'Bebida',
            value:'drinks'
        },
        {
            name:'Aperitivos',
            value:'snacks'
        },
    ]
    const [catSelected,setCatSelected] = useState(menu ? menu.types : []);


    const handleChangeCat = (event) => {
        const {
            target: { value,name },
        } = event;
        
        setCatSelected(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const [imgMenu,setImgMenu] = useState();
    const [imgMenuEdit,setImgMenuEdit] = useState();
  
    const validationSchema = Yup.object().shape({
        //mdescription: Yup.string().required('ingrese un correo valido').min(3),
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
    const [loadForm,setLoadForm] = useState(false);
  
    const sendData = (dataupdate) =>{
        setLoadForm(true);
        const menuDataForm = new FormData();
        menuDataForm.append('name', bodyFields.mname);
        menuDataForm.append('description', bodyFields.mdescription);
        if(imgMenu){
            menuDataForm.append('image', imgMenu.files[0]);
        }
        menuDataForm.append('properties[0].name', 'calorias');
        menuDataForm.append('properties[0].value', String(bodyFields.mcalorias));
        menuDataForm.append('properties[1].name', 'carbo');
        menuDataForm.append('properties[1].value', String(bodyFields.mcarbo));
        menuDataForm.append('properties[2].name', 'grasas');
        menuDataForm.append('properties[2].value', String(bodyFields.mgrasas));
        menuDataForm.append('properties[3].name', 'proteinas');
        menuDataForm.append('properties[3].value', String(bodyFields.mproteinas));
        
        menuDataForm.append('types', catSelected);
        menuDataForm.append('previousPrice', bodyFields.mpreviousPrice);
        menuDataForm.append('price', bodyFields.mprice);

        axios.post(baseUrl+'menu',
            menuDataForm,
            {
                headers: {"Authorization" : `Bearer ${token}`} 
            }
        ).then((resp)=>{
            console.log('el menu se agrego exitosamente')
            setLoadForm(false);
            closeModal();
            listMenu();
        }).catch((error) =>{
            console.log(error);
            setErrorAxios(true);
            setLoadForm(false);
        })
    }

    const updateData = (dataupdate) =>{

        //console.log('===>',catSelected);

        setLoadForm(true)
        
        const menuDataForm = new FormData();
        menuDataForm.append('id', menu.id);
        menuDataForm.append('name', bodyFields.mname);
        menuDataForm.append('description', bodyFields.mdescription);
        if(imgMenu){
            menuDataForm.append('image',imgMenu.files[0]);
        }
        
        menuDataForm.append('properties[0].name', 'calorias');
        menuDataForm.append('properties[0].value', String(bodyFields.mcalorias));
        menuDataForm.append('properties[1].name', 'carbo');
        menuDataForm.append('properties[1].value', String(bodyFields.mcarbo));
        menuDataForm.append('properties[2].name', 'grasas');
        menuDataForm.append('properties[2].value', String(bodyFields.mgrasas));
        menuDataForm.append('properties[3].name', 'proteinas');
        menuDataForm.append('properties[3].value', String(bodyFields.mproteinas));
        menuDataForm.append('types', catSelected);
        menuDataForm.append('previousPrice', bodyFields.mpreviousPrice);
        menuDataForm.append('price', bodyFields.mprice);

        axios.put(baseUrl+'menu',
            menuDataForm
            ,
            {
                headers: {"Authorization" : `Bearer ${token}`} 
            }
        ).then((resp)=>{
            //console.log('el menu se agrego exitosamente')
            setLoadForm(false);
            closeModal();
            listMenu();
        }).catch((error) =>{
            console.log(error);
            setErrorAxios(true);
            setLoadForm(false);
        })

    }
    
    const onSubmitHandler = (data) => {
        if(menu){
            updateData(data);
        }else{
            sendData(data);
        }
    };

    useEffect(()=>{
        console.log(menu);
        if(menu){
            setBodyFields({
                    mname: menu.name,
                    mdescription: menu.description,
                    mcalorias: menu.properties[0].value,
                    mcarbo: menu.properties[1].value,
                    mgrasas: menu.properties[2].value,
                    mproteinas: menu.properties[3].value,
                    mtype: menu.type,
                    mpreviousPrice:15,
                    mprice:15
            });
            setImgMenuEdit(menu.imageUrl);
        }
    },[])

    return (
        <div className="compAddMenu">
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                
                <h1>{menu ? 'Actualizar Menu' : 'Agregar Menu'}</h1>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Nombre" 
                                variant="filled"
                                id="mname" 
                                name="mname" 
                                value={bodyFields ? bodyFields.mname : ''}
                                error={errors.mname ? true : false}
                                {...register("mname")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Descripcion" 
                                variant="filled"
                                id="mdescription" 
                                name="mdescription" 
                                value={bodyFields ? bodyFields.mdescription : ''}
                                error={errors.mdescription ? true : false}
                                {...register("mdescription")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Calorias:" 
                                variant="filled"
                                id="mcalorias" 
                                name="mcalorias" 
                                value={bodyFields ? bodyFields.mcalorias : ''}
                                error={errors.mcalorias ? true : false}
                                {...register("mcalorias")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Carbo:" 
                                variant="filled"
                                id="mcarbo" 
                                name="mcarbo" 
                                value={bodyFields ? bodyFields.mcarbo : ''}
                                error={errors.mcarbo ? true : false}
                                {...register("mcarbo")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Grasas:" 
                                variant="filled"
                                id="mgrasas" 
                                name="mgrasas" 
                                value={bodyFields ? bodyFields.mgrasas : ''}
                                error={errors.mgrasas ? true : false}
                                {...register("mgrasas")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                            <TextField 
                                fullWidth
                                label="Proteinas:" 
                                variant="filled"
                                id="mproteinas" 
                                name="mproteinas" 
                                value={bodyFields ? bodyFields.mproteinas : ''}
                                error={errors.mproteinas ? true : false}
                                {...register("mproteinas")} 
                                onChange={handleFieldChange}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>

                        <FormControl  sx={{ m: 1, width: '100%' }}>
                            <InputLabel id="demo-multiple-chip-label">Categoria</InputLabel>
                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={catSelected}

                                    defaultValue={[]} 

                                    value={catSelected || []}

                                    error={errors.mcat ? true : false}
                                    {...register("mcat")} 
                                    onChange={handleChangeCat}
                                    input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {

                                                const category = catList.find(item => item.value === value);

                                                return (
                                                    <Chip
                                                        key={`chipAddCat${value}`}
                                                        label={category?.name || value}
                                                    />
                                                );
                                                
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                {catList.map((item) => (
                                    <MenuItem
                                        key={'catNewMenu'+item.name}
                                        value={item.value} 
                                    >
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        {imgMenuEdit &&
                            <div className="addMenuPreview">
                                <img src={imgMenuEdit} alt="" />
                            </div>
                        }
                        {imgMenu &&
                            <div className="addMenuPreview">
                                <img src={URL.createObjectURL(imgMenu.files[0])} alt="" />
                            </div>
                        }

                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            className="btnSecond"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload files
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(event) => {
                                    setImgMenuEdit();
                                    setImgMenu(event.target); 
                                }}
                                //multiple
                            />
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <Button 
                            type={'submit'} 
                            variant="contained"
                            className={ loadForm ? 'btnPrimary btnDisabled' : 'btnPrimary'}
                        >
                            {loadForm ?
                                <span>{menu ? 'Actualizando' : 'Enviando'}</span>
                            :
                                <span>{menu ? 'Actualizar' : 'Agregar'}</span>
                            }
                        </Button>
                    </Grid>
                    {errorAxios &&
                        <div className="inlineFlex loginErrors">
                            <p><ErrorOutlineIcon />Verifique sus credenciales por favor.</p>
                        </div>
                    }
                </Grid>
            </form>
        </div>
    )
};

export default MenuAddMenu;
