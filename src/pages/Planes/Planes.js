import { useEffect, useState } from "react";
import './Planes.scss';
import LayoutPages from "../../components/LayoutPages/LayoutPages";
import TitlePage from './../../components/Pages/Title/Title';
import Grid from '@mui/material/Grid';

import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Chip from '@mui/material/Chip';

import axios from 'axios';
import { useAuthContext } from './../../context/authContext';
import ModalRightCont from "../../components/ModalRightCont/ModalRightCont";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import TextField from '@mui/material/TextField';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import Checkbox from '@mui/material/Checkbox';

const PagePlanes = (props) => {

  const { baseUrl, token } = useAuthContext();
  const [ planList, setPlanList ] = useState([]);
  const [ errorAxios, setErrorAxios ] = useState(false);
  const [ loadForm, setLoadForm ] = useState(false);
  const [ selectData,setSelectData ] = useState();

  const [open, setOpen] = useState(false);
  const handleOpen = (data) => {

      setSelectData(data);

      reset({
          description: data.description,
          realPrice: data.price,
          previousPrice: data.previousPrice,
          level: data.level,
          properties: data.properties || [],
          descriptionList: data.descriptionList || [],
          extraBenefits: data.benefits?.extraBenefits || [],
          principalBenefits: data.benefits?.principalBenefits || [],
      });

      setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setLoadForm(false);
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("Ingrese la descripción"),
    realPrice: Yup.number().required().min(0),
    previousPrice: Yup.number().required().min(0),
    level: Yup.string().required(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    
    defaultValues: {
      description: "",
      realPrice: 0,
      previousPrice: 0,
      level: "",
      properties: [],
      descriptionList: [],
      extraBenefits: [],
      principalBenefits: [],
    },
  });

  const getPlanes = () =>{
    axios.get(baseUrl+'admin/subscription-plans',
      {headers: {"Authorization" : `Bearer ${token}`} }
    ).then((resp)=>{
      setPlanList(resp.data.data)
    }).catch((error)=>{
      console.log(error);
      setLoadForm(false);
    })
  }

  // UpdatePlan
  const principalBenefitsOptions = [
    {
      name: 'Almuerzo',
      value: 'lunch',
    },
    {
      name: 'Cena',
      value: 'dinner',
    }
  ];

  const extraBenefitsOptions = [
    {
      name: 'Desayuno',
      value: 'breakfast',
    },
    {
      name: 'Bebida',
      value: 'drinks',
    },
    {
      name: 'Entrada',
      value: 'starter',
    },
    {
      name: 'Aperitivos',
      value: 'snacks',
    },
  ];


  const {
      fields: propertyFields,
      append: addProperty,
      remove: removeProperty,
  } = useFieldArray({
      control,
      name: "properties",
  });

  const {
      fields: descriptionFields,
      append: addDescription,
      remove: removeDescription,
  } = useFieldArray({
      control,
      name: "descriptionList",
  });

  const {
      fields: extraFields,
      append: addExtra,
      remove: removeExtra,
  } = useFieldArray({
      control,
      name: "extraBenefits",
  });

  const {
      fields: principalFields,
      append: addPrincipal,
      remove: removePrincipal,
  } = useFieldArray({
      control,
      name: "principalBenefits",
  });

  const updatePlan = (formData) => {

    setLoadForm(true);

    const paramsPut = {
        description: formData.description,
        realPrice: Number(formData.realPrice),
        previousPrice: Number(formData.previousPrice),
        level: formData.level,
        properties: formData.properties,
        descriptionList: formData.descriptionList,
        extraBenefits: formData.extraBenefits,
        principalBenefits: formData.principalBenefits,
    };

    axios.put(
        baseUrl + "admin/subscription-plans/" + selectData.id,
        paramsPut,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    .then(() => {
        getPlanes();
        handleClose();
    })
    .catch((err) => {
        console.log(err);
        setLoadForm(false);
    });
  };

  const onSubmitHandler = (formData) => {
    updatePlan(formData)
  };

  useEffect(()=>{
    getPlanes();
  },[])


  return (
    <LayoutPages>
        <TitlePage
             title={'Planes Panel'} 
        />

        <div className="inlineBlock ">
            
            <Grid container spacing={2}>
              {planList && planList.length > 0 && planList.map((item)=>(
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card 
                    variant="outlined"
                    className="pagePlanesItem"
                  >
                    <CardContent>
                      <h4>
                        {item.level}
                      </h4>
                      <h2>
                        {item.description}
                      </h2>
                      <div className="pagePlanesBlock inlineBlock">
                        <p>
                          Precio: <strong>S/{item.price.toFixed(2)}</strong>
                        </p>
                        <p>
                          Antes: <strong>S/{item.previousPrice.toFixed(2)}</strong>
                        </p>
                      </div>
                      {item.properties && item.properties.length > 0 &&
                      <ul
                        className="pagePlanesBlock propertiesList"
                      >
                        {item.properties.map((pItem)=>(
                          <li>
                            <small>
                              {pItem.name}
                            </small>
                            <p>{pItem.value}</p>
                          </li>
                        ))}
                      </ul>
                      }
                      <div className="inlineFlex pagePlanesBlock benefitsList">
                        <h5>Beneficios</h5>
                        {item.benefits?.principalBenefits && item.benefits?.principalBenefits.map((eItem)=>(
                          <Chip label={eItem} color="success" variant="outlined" />
                        ))}
                      </div>
                      <div className="inlineFlex pagePlanesBlock benefitsList">
                        <h5>Extras</h5>
                        {item.benefits?.extraBenefits && item.benefits?.extraBenefits.map((eItem)=>(
                          <Chip label={eItem} color="success" variant="outlined" />
                        ))}
                      </div>
                      {item.descriptionList && item.descriptionList.length > 0 &&
                        <ul className="pagePlanesBlock descriptionList">
                          {item.descriptionList.map((sItem)=>(
                            <li>{sItem}</li>
                          ))}
                        </ul>
                      }
                    </CardContent>
                    <CardActions>
                      <div 
                        className="inlineFlex btnPrimary"
                        onClick={()=>handleOpen(item)}
                      >
                        <span>Editar</span>
                      </div>
                    </CardActions>
                  </Card>
                </Grid>
                
              ))}
            </Grid>

            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="parent-modal-title"
              aria-describedby="parent-modal-description"
            >
              <ModalRightCont
                title={"Editar plan"}
              >
                <form 
                  onSubmit={handleSubmit(onSubmitHandler)}
                  className="pagePlanesFormUpdate"
                >
                    
                  <Grid container spacing={2}>

                    <Grid size={{xs:12}}>
                      <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                        <TextField
                            fullWidth
                            label="Descripción"
                            variant="filled"
                            error={!!errors.description}
                            {...register("description")}
                        />
                      </div>
                    </Grid>

                    <Grid size={{xs:6}}>
                      <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                        <TextField
                            fullWidth
                            type="number"
                            label="Precio"
                            variant="filled"
                            error={!!errors.realPrice}
                            {...register("realPrice")}
                        />
                      </div>
                    </Grid>

                    <Grid size={{xs:6}}>
                      <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                        <TextField
                          fullWidth
                          type="number"
                          label="Precio anterior"
                          variant="filled"
                          error={!!errors.previousPrice}
                          {...register("previousPrice")}
                        />
                      </div>
                    </Grid>

                    <Grid size={{xs:12}}>
                      <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                        <TextField
                            fullWidth
                            label="Nivel"
                            variant="filled"
                            {...register("level")}
                        />
                      </div>
                    </Grid>

                  </Grid>

                  <Typography mt={3} mb={2} variant="h6">
                    Propiedades
                  </Typography>

                  {propertyFields.map((item,index)=>(

                    <Grid container spacing={2} key={item.id} mb={2}>
                      <Grid size={{xs:6}}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                          <TextField
                            fullWidth
                            variant="filled"
                            label="Nombre"
                            {...register(`properties.${index}.name`)}
                          />
                        </div>
                      </Grid>

                      <Grid size={{xs:6}}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                          <TextField
                            fullWidth
                            variant="filled"
                            label="Valor"
                            {...register(`properties.${index}.value`)}
                          />
                        </div>
                      </Grid>

                    </Grid>

                  ))}

                  <Typography mt={4} mb={2} variant="h6">
                    Descripción del plan
                  </Typography>

                  {descriptionFields.map((item,index)=>(

                  <Grid container spacing={2} key={item.id} mb={2}>

                      <Grid size={{xs:10}}>
                        <div className="inlineFlex textFieldAdmin textFieldAdmin2">
                          <TextField
                              fullWidth
                              variant="filled"
                              {...register(`descriptionList.${index}`)}
                          />
                        </div>
                      </Grid>

                      <Grid size={{xs:2}}>
                        <IconButton 
                          aria-label="delete" 
                          size="large"
                          onClick={()=>removeDescription(index)}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Grid>

                  </Grid>

                  ))}

                  <Button
                      variant="outlined"
                      onClick={()=>addDescription("")}
                      className="btnPrimary btnPrimarySec"
                  >
                    Agregar descripción
                  </Button>


                  <Typography mt={4} mb={2} variant="h6">
                      Beneficios principales
                  </Typography>

                  <Controller
                      control={control}
                      name="principalBenefits"
                      render={({ field }) => (

                          <FormGroup>

                              <Grid container spacing={1}>

                                  {principalBenefitsOptions.map((benefit) => (

                                      <Grid
                                          size={{ xs: 12, md: 6 }}
                                          key={benefit.value}
                                      >

                                          <FormControlLabel
                                              control={
                                                  <Checkbox
                                                      checked={field.value?.includes(benefit.value)}
                                                      onChange={(e) => {

                                                          if (e.target.checked) {

                                                              field.onChange([
                                                                  ...(field.value || []),
                                                                  benefit.value
                                                              ]);

                                                          } else {

                                                              field.onChange(
                                                                  field.value.filter(item => item !== benefit.value)
                                                              );

                                                          }

                                                      }}
                                                  />
                                              }
                                              label={benefit.name}
                                          />

                                      </Grid>

                                  ))}

                              </Grid>

                          </FormGroup>

                      )}
                  />

                  <Typography mt={4} mb={2} variant="h6">
                      Beneficios extras
                  </Typography>

                  <Controller
                      control={control}
                      name="extraBenefits"
                      render={({ field }) => (

                          <FormGroup>

                              <Grid container spacing={1}>

                                  {extraBenefitsOptions.map((benefit) => (

                                      <Grid
                                          size={{ xs: 12, md: 6 }}
                                          key={benefit.value}
                                      >

                                          <FormControlLabel
                                              control={
                                                  <Checkbox
                                                      checked={field.value?.includes(benefit.value)}
                                                      onChange={(e) => {

                                                          if (e.target.checked) {

                                                              field.onChange([
                                                                  ...(field.value || []),
                                                                  benefit.value
                                                              ]);

                                                          } else {

                                                              field.onChange(
                                                                  field.value.filter(
                                                                      item => item !== benefit.value
                                                                  )
                                                              );

                                                          }

                                                      }}
                                                  />
                                              }
                                              label={benefit.name}
                                          />

                                      </Grid>

                                  ))}

                              </Grid>

                          </FormGroup>

                      )}
                  />


                  <Grid mt={4}>

                  <Button
                      type="submit"
                      variant="contained"
                      className={loadForm ? "btnPrimary btnDisabled" : "btnPrimary"}
                  >
                      {loadForm ? "Actualizando..." : "Actualizar"}
                  </Button>

                  </Grid>

                </form>
              </ModalRightCont>
            </Modal>

        </div>
    </LayoutPages>
  )
};

export default PagePlanes;
