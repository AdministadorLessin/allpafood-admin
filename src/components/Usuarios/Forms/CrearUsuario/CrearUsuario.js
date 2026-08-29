import { useState, useEffect } from "react";


import './CrearUsuario.scss';

import TextField from '@mui/material/TextField';

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

const UsuarioFormCrear = ({ handleClose, getUsuarios, planList }) => {
  const { token, baseUrl } = useAuthContext();
  const [errorAxios, setErrorAxios] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadForm, setLoadForm] = useState(false);

  // Schema de validación Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("El nombre es obligatorio")
      .min(3, "El nombre debe tener al menos 3 caracteres"),
    lastname: Yup.string()
      .required("El apellido es obligatorio")
      .min(3, "El apellido debe tener al menos 3 caracteres"),
    email: Yup.string()
      .email("Ingrese un correo válido")
      .required("El correo es obligatorio"),
    documentNumber: Yup.string()
      .required("El DNI es obligatorio")
      .min(8, "Mínimo 8 dígitos")
      .max(9, "Máximo 9 dígitos"),
    phoneNumber: Yup.string()
      .required("El teléfono es obligatorio")
      .min(9, "Mínimo 9 dígitos")
      .max(14, "Máximo 14 dígitos"),
    password: Yup.string()
      .required("La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  });


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    resolver: yupResolver(validationSchema),
  });

  const [planSelect, setPlanSelect] = useState('ninguno');
  const handleChange = (event) => {
    setPlanSelect(event.target.value);
  };

  const onSubmitHandler = (dataForm) => {

    setLoadForm(true);
    setErrorAxios(false);

    const newAdminData = {
      name: dataForm.name,
      lastname: dataForm.lastname,
      email: dataForm.email,
      phoneNumber: '51'+dataForm.phoneNumber,
      documentNumber: dataForm.documentNumber,
      password: dataForm.password,
    };

    axios
      .post(`${baseUrl}register/admin-create`, newAdminData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((resp) => {
        setLoadForm(false);

        if(planSelect !== 'ninguno'){
          //admin/plans/assign-plan

          axios.post(
              `${baseUrl}admin/user-plan/assign-plan`,
                {
                  userId: resp.data.data.userId,
                  planId: parseInt(planSelect),
                  paymentMethodType: "yape",
                  paymentMethodId: "yape"
                }
              ,{
                  headers: {"Authorization" : `Bearer ${token}`}
              }
          ).then((respp)=>{
            if (handleClose) handleClose();
            if (getUsuarios) getUsuarios();
          }).catch((error)=>{
              console.log(error);
          });
        }
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
    //getPlanes();
  },[])


  return (
    <div className="inlineBlock">
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Grid container spacing={2}>
          {/* Nombre */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="Nombre"
                variant="filled"
                id="name"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register("name")}
              />
            </div>
          </Grid>

          {/* Apellido */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="Apellido"
                variant="filled"
                id="lastname"
                error={!!errors.lastname}
                helperText={errors.lastname?.message}
                {...register("lastname")}
              />
            </div>
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="filled"
                id="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register("email")}
              />
            </div>
          </Grid>

          {/* DNI */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="DNI"
                variant="filled"
                id="documentNumber"
                error={!!errors.documentNumber}
                helperText={errors.documentNumber?.message}
                {...register("documentNumber")}
              />
            </div>
          </Grid>

          {/* Teléfono */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="Teléfono"
                variant="filled"
                id="phoneNumber"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
            </div>
          </Grid>

          {/* Contraseña */}
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                variant="filled"
                id="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password")}
              />
            </div>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <div className="inlineFlex">
              <FormControl>
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
                      key={item.id}
                      value={item.id} 
                      control={<Radio />} 
                      label={item.description} 
                    />
                  ))}
                  <FormControlLabel
                    key={"asasd4ad64ada65d4a65"}
                    value="ninguno"
                    control={<Radio />}
                    
                    label="Ninguno"
                  />
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
              {loadForm ? "Guardando..." : "Crear usuario"}
            </button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default UsuarioFormCrear;
