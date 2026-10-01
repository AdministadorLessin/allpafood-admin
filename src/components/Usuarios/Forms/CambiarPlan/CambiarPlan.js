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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import axios from 'axios';
import { useAuthContext } from "../../../../context/authContext";

import FormLabel from '@mui/material/FormLabel';

/** Las comidas como las nombra la operacion, no como se llaman en la base. */
const NOMBRE_COMIDAS = (tipos) => {
  const nombres = { lunch: 'almuerzo', dinner: 'cena', breakfast: 'desayuno' };
  if (!Array.isArray(tipos) || tipos.length === 0) return 'sin comidas definidas';
  // El almuerzo primero, que es como se lee el dia.
  return [...tipos]
    .sort((a) => (a === 'lunch' ? -1 : 1))
    .map((t) => nombres[t] || t)
    .join(' y ');
};

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

    if (!planActual) {
      setErrorAxios(true);
      setErrorMessage('Elige el plan al que quieres pasarlo.');
      return;
    }

    setLoadForm(true);
    setErrorAxios(false);

    /* El campo se llama benefitId, no benefitsId.
       Con el nombre equivocado el servidor lo recibia como nulo y dejaba
       benefits_id apuntando al plan ANTERIOR, mientras los beneficios del
       cliente ya eran los del nuevo. El panel seguia mostrando el plan viejo y
       la pantalla de menus del cliente le ofrecia las comidas del viejo,
       mientras su cuenta le exigia las del nuevo: un cliente pasado a Fitfuel
       no podia completar ni un dia porque nunca le aparecia la cena. */
    const beneficios = planActual.benefits || {};

    const newAdminData = {
        planInitDate: data.inicia,
        planExpirationDate: data.expira,
        benefitId: beneficios.id,
        consumedBenefits: {
            extraBenefits: beneficios.extraBenefits,
            complements: [],
            principalBenefits: beneficios.principalBenefits,
            additional: [],
            orders: {
                /* Los envios del plan nuevo, no un 20 escrito a mano: si
                   manana se vende un plan de 12, este formulario le daria 20. */
                total: beneficios.consumptionTotal ?? data.consumedTotal ?? 20,
                consumed: data.consumedHide
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

          {/* Que significa el cambio, antes de guardarlo. Pasar a Fitfuel le
              agrega la cena a todos sus dias; pasar a Nutrivital se la quita.
              Sin esto el formulario es una lista de nombres sin consecuencias
              visibles. */}
          {planActual && (
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <Box sx={{ p: 1.75, borderRadius: 1.5, bgcolor: 'grey.100' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Queda con <b>{NOMBRE_COMIDAS(planActual.benefits?.principalBenefits)}</b>
                  {' '}y {planActual.benefits?.consumptionTotal ?? data.consumedTotal} envíos.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Mantiene sus {data.consumedHide} envíos consumidos y su fecha de vencimiento.
                </Typography>
              </Box>
            </Grid>
          )}

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
              {loadForm ? "Guardando…" : "Cambiar de plan"}
            </button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default UsuarioFormCambiarPlan;
