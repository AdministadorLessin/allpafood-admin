import { useEffect, useState } from "react";

import './CambiarPlan.scss';

import { useForm  } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

import axios from 'axios';
import { useAuthContext } from "../../../../context/authContext";

import FormLabel from '@mui/material/FormLabel';

const UsuarioFormCambiarPlan = ({ data, handleClose, getUsuarios, planList }) => {

  const { token, baseUrl } = useAuthContext();
  const [errorAxios, setErrorAxios] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadForm, setLoadForm] = useState(false);
  const [planSelect, setPlanSelect] = useState('ninguno');
  const [planActual, setPlanActual] = useState();

  // Schema de validación Yup
  const validationSchema = Yup.object().shape({

  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: yupResolver(validationSchema),
  });

  const handleChange = (event) => {
    setPlanSelect(event.target.value);
    
    if(planList && planList.length){
        planList?.map((item)=>{
            if(parseInt(item.id) === parseInt(event.target.value)){
                setPlanActual(item);
            }
        })
    }
  };

  const onSubmitHandler = (dataForm) => {

    setLoadForm(true);
    setErrorAxios(false);

    const newAdminData = {
        planInitDate: data.inicia,
        planExpirationDate: data.expira,
        benefitsId: "",
        consumedBenefits: {
            extraBenefits: planActual.benefits?.extraBenefits,
            complements: null,
            principalBenefits: planActual.benefits?.principalBenefits,
            additional: [],
            orders: {
                "total": 20,
                "consumed": data.consumedHide
            }
        },
        credits: null,
    };

    axios
      .put(`${baseUrl}admin/user-plan/${data.id}`, newAdminData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((resp) => {
        setLoadForm(false);
        if (handleClose) handleClose();
        if (getUsuarios) getUsuarios();
      })
      .catch((error) => {
        console.error("Error al registrar administrador:", error);
        setErrorAxios(true);
        setErrorMessage(
          error.response?.data?.message || "No se pudo registrar el administrador."
        );
        setLoadForm(false);
      });
  };

  useEffect(()=>{
    
    if(planList && planList.length){
        planList?.map((item)=>{
            if(item.description === data.plan){
                setPlanSelect(item.id);
                setPlanActual(item);
            }
        })
    }

  },[])


  return (
    <div className="inlineBlock">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex">
              <FormControl className="inlineFlex cambPlanRdoList">
                <FormLabel id={`planes-label`}>Plan</FormLabel>
                <RadioGroup 
                  row 
                  aria-labelledby={`planes-label`} 
                  name="row-radio-buttons-group"
                  value={planSelect}
                  onChange={handleChange}
                >
                  {planList && planList.length > 0 && planList.map((item)=>(
                    <FormControlLabel 
                      key={item.id+'rd-list_chang_plan'}
                      value={item.id} 
                      control={<Radio />} 
                      label={item.description} 
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </Grid>

          {/* Mensaje de Error */}
          {errorAxios && (
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Grid>
          )}

          {/* Botón Guardar */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <button
              type="submit"
              disabled={loadForm}
              className={loadForm ? "btnPrimary btnDisabled" : "btnPrimary"}
            >
              {loadForm ? "Guardando..." : "Actualizando plan"}
            </button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default UsuarioFormCambiarPlan;
