import React from 'react';

/**
 * Red de seguridad del panel.
 *
 * Sin esto, cualquier error al dibujar desmonta React entero y lo que queda es
 * una pantalla en blanco: ni un mensaje, ni un boton, ni una pista. Paso el
 * 26/09/2026 con el mapa de cobertura —un choque de nombres en un import— y
 * desde afuera era indistinguible de "no carga".
 *
 * Ademas avisa al servidor, igual que el app del cliente, para no tener que
 * adivinar que pantalla se cayo ni con que error.
 */
class PantallaError extends React.Component {

    constructor(props) {
        super(props);
        this.state = { fallo: null };
    }

    static getDerivedStateFromError(error) {
        return { fallo: error };
    }

    componentDidCatch(error, info) {
        console.error('[AllpaFood Panel] La pantalla se cayo:', error, info?.componentStack);

        try {
            const baseUrl = process.env.REACT_APP_API_URL || 'https://api.allpafood.com/dev/api-af/v1/';
            const cuerpo = JSON.stringify({
                ruta: 'PANEL ' + window.location.pathname,
                usuario: (() => {
                    try { return JSON.parse(window.localStorage.getItem('inf') || '{}')?.role || '-'; }
                    catch (e) { return '-'; }
                })(),
                version: document.querySelector('script[src*="/static/js/main."]')?.src?.split('/')?.pop() || '-',
                mensaje: String(error?.message || error),
                componente: String(info?.componentStack || '').split('\n').slice(0, 4).join(' > '),
                equipo: navigator.userAgent,
            });
            const url = `${baseUrl}public/front-error`;
            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, new Blob([cuerpo], { type: 'application/json' }));
            } else {
                fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                             body: cuerpo, keepalive: true }).catch(() => {});
            }
        } catch (e) { /* avisar nunca puede romper mas de lo que ya esta roto */ }
    }

    render() {
        if (!this.state.fallo) return this.props.children;

        return (
            <main style={{
                minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '28px', background: '#F3F6F3', fontFamily: 'inherit', color: '#16211B',
            }}>
                <div style={{ maxWidth: 380, textAlign: 'center' }}>
                    <h1 style={{ fontSize: 22, margin: '0 0 10px', lineHeight: 1.25 }}>
                        Esta pantalla se rompió
                    </h1>
                    <p style={{ fontSize: 14, lineHeight: 1.5, color: '#61706A', margin: '0 0 8px' }}>
                        El resto del panel sigue funcionando. Ya quedó registrado en el
                        servidor con el detalle del error.
                    </p>
                    <p style={{
                        fontSize: 12, color: '#8A968F', margin: '0 0 22px',
                        wordBreak: 'break-word',
                    }}>
                        {String(this.state.fallo?.message || this.state.fallo)}
                    </p>

                    <button type="button"
                        onClick={() => window.location.replace('/')}
                        style={{
                            width: '100%', minHeight: 48, border: 0, borderRadius: 999,
                            background: '#3CFB9F', color: '#08301D', fontFamily: 'inherit',
                            fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        }}>
                        Volver al panel
                    </button>
                </div>
            </main>
        );
    }
}

export default PantallaError;
