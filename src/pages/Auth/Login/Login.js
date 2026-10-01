import { useEffect, useState } from 'react';
import './Login.scss';

import moment from 'moment';
import 'moment/locale/es';

import { useAuthContext } from '../../../context/authContext';
import { useNavigate } from "react-router";
import axios from 'axios';

import isotipo from '../../../assets/img/isotipo_allpafood.png';
import fotoCocina from '../../../assets/img/login-cocina.jpg';
import { DISPATCH_TIME } from '../../../sections/comanda/comanda-config';

/**
 * Entrada al panel.
 *
 * Se usa en monitor, asi que se arma para monitor: la cocina a la izquierda
 * a media pantalla, el formulario a la derecha sobre el mismo verde de la
 * pantalla de comanda.
 *
 * Lo unico vivo es el reloj de despacho, que sale de la misma constante que
 * gobierna la comanda. No es adorno: antes de escribir la clave ya se sabe
 * cuanto falta para que salgan las rutas, que es la pregunta con la que se
 * entra al panel por la mañana.
 */
const LoginPage = () => {

    moment.locale('es');

    let navigate = useNavigate();
    const { handleUpdateToken, baseUrl } = useAuthContext();

    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [verClave, setVerClave] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    /* Cuanto falta para el despacho. Se recalcula cada minuto: en una pantalla
       que queda abierta, un contador congelado miente. */
    const [, setTic] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTic((n) => n + 1), 60000);
        return () => clearInterval(t);
    }, []);

    const faltaParaDespacho = () => {
        const [h, m] = DISPATCH_TIME.split(':').map(Number);
        let salida = moment().hour(h).minute(m).second(0);
        if (moment().isAfter(salida)) salida = salida.add(1, 'day');
        const minutos = salida.diff(moment(), 'minutes');
        const horas = Math.floor(minutos / 60);
        return horas >= 1 ? `${horas} h ${minutos % 60} min` : `${minutos} min`;
    };

    const sesionVencida = new URLSearchParams(window.location.search).get('sesion') === 'vencida';

    const entrar = (e) => {
        e.preventDefault();

        if (!usuario.trim() || clave.length < 3) {
            setError('Escribe tu usuario y tu clave.');
            return;
        }

        setSending(true);
        setError('');

        axios.post(baseUrl + 'auth/login', { username: usuario.trim(), password: clave })
            .then((resp) => {
                if (resp.status === 200) {
                    const userDate = resp.data.data;
                    userDate.log = usuario.trim();
                    handleUpdateToken(userDate.token, userDate);
                    navigate(userDate.role === 'DELIVERY' ? '/motorizado' : '/');
                }
            })
            .catch(() => {
                /* Solo se libera el boton en el fallo: si el login funciona la
                   pantalla navega, y reactivarlo antes deja ver un parpadeo. */
                setSending(false);
                setError('Usuario o clave incorrectos. Revísalos e inténtalo de nuevo.');
            });
    };

    const hoy = moment().format('dddd D [de] MMMM');

    return (
        <main className="afLogin">

            <section className="afLogin__foto">
                <img src={fotoCocina} alt="" />
                <div className="afLogin__sobreFoto">
                    <p className="afLogin__fecha">
                        {hoy.charAt(0).toUpperCase() + hoy.slice(1)}
                    </p>
                    <p className="afLogin__frase">
                        Hoy se cocina <b>de verdad</b>
                    </p>
                    <div className="afLogin__reloj">
                        <i />
                        Despacho en <b>{faltaParaDespacho()}</b>
                    </div>
                </div>
            </section>

            <section className="afLogin__lado">
                <form className="afLogin__col" onSubmit={entrar}>

                    <img className="afLogin__iso" src={isotipo} alt="Allpa Food" />

                    <h2 className="afLogin__tit">Entra al panel</h2>
                    {/* Quien llega por sesion vencida necesita saberlo: si no,
                        cree que escribio mal la clave o que el panel se rompio. */}
                    {sesionVencida ? (
                        <p className="afLogin__baja">
                            Tu sesión venció por seguridad. Entra de nuevo y sigue donde estabas.
                        </p>
                    ) : (
                        <p className="afLogin__baja">
                            Comanda del día, rutas, clientes y planes.
                        </p>
                    )}

                    <div className={`afLogin__campo${error ? ' afLogin__campo--mal' : ''}`}>
                        <label htmlFor="usuario">Usuario</label>
                        {/* Correo o celular: por esta misma pantalla entran los
                            motorizados, y varios no tienen correo cargado. */}
                        <input
                            id="usuario"
                            name="usuario"
                            autoComplete="username"
                            placeholder="Tu correo o tu celular"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                        />
                    </div>

                    <div className={`afLogin__campo${error ? ' afLogin__campo--mal' : ''}`}>
                        <label htmlFor="clave">Clave</label>
                        <input
                            id="clave"
                            name="clave"
                            type={verClave ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                        />
                        <button type="button" className="afLogin__ver"
                            onClick={() => setVerClave((v) => !v)}>
                            {verClave ? 'Ocultar clave' : 'Ver clave'}
                        </button>
                    </div>

                    <button type="submit" className="afLogin__btn" disabled={sending}>
                        {sending ? 'Entrando…' : 'Entrar'}
                    </button>

                    {error &&
                        <p className="afLogin__error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.2v.1" />
                            </svg>
                            {error}
                        </p>
                    }

                    <p className="afLogin__pie">Panel de operaciones · Allpa Food</p>
                </form>
            </section>
        </main>
    );
};

export default LoginPage;
