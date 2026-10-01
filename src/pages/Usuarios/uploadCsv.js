import { useState } from "react";
import axios from "axios";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { styled } from "@mui/material/styles";
import { useAuthContext } from "../../context/authContext";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

/* La plantilla sale del propio panel para que nadie arme el archivo con las
   columnas en otro orden.
   El correo va vacio en dos de los tres ejemplos a proposito: el cliente entra
   con su celular, y un correo inventado es peor que ninguno porque el campo es
   unico en la base y puede chocar con el de otra persona.
   "sep=," en la primera linea hace que Excel la abra en columnas aunque la
   maquina use punto y coma. El ejemplo va sin tildes a proposito: Excel
   ignora esa linea cuando el archivo trae marca de UTF-8, y sin la marca las
   tildes se ven mal al abrir. Al guardar desde Excel da igual, el servidor
   entiende los dos formatos. */
const PLANTILLA = [
  "sep=,",
  "nombre,apellido,correo,telefono,documento,contrasena,plan,envios_consumidos,fecha_inicio,direccion,referencia,distrito,motorizado",
  "Ana,Torres,ana.torres@gmail.com,987654321,45678912,12345678,Nutrivital,2,08/09/2026,Av. Primavera 120 Dpto 402,Edificio gris al lado del grifo,Santiago de Surco,941152020",
  "Luis,Rojas,,912345678,70123456,12345678,Fitfuel,0,,Calle Los Pinos 340,Casa con reja verde,Miraflores,",
  "Carla,Diaz,,998877665,41236587,12345678,,,,,,,",
].join("\r\n");

const descargarPlantilla = () => {
  const blob = new Blob([PLANTILLA], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "plantilla-clientes-allpa.csv";
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};

/**
 * Carga masiva de clientes, con su plan y los envios que ya consumieron.
 *
 * Si una fila trae un problema el servidor no carga ninguna y devuelve la
 * lista de filas a corregir; aca se muestra completa y se deja el archivo
 * seleccionado, para corregir en Excel y volver a intentar sin buscarlo.
 */
export default function UploadUsersCsv({ onUploaded }) {

    const { baseUrl, token } = useAuthContext();

    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

    const handleSelectFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setFeedback({ type: "error", message: "El archivo debe ser un .csv. En Excel: Archivo, Guardar como, CSV." });
            setCsvFile(null);
            return;
        }

        setCsvFile(file);
        setFeedback(null);
        // Permite volver a elegir el mismo archivo despues de corregirlo.
        event.target.value = "";
    };

    const handleRemoveFile = () => {
        setCsvFile(null);
        setFeedback(null);
        setProgress(0);
    };

    const handleUpload = async () => {
        if (!csvFile) return;

        const formData = new FormData();
        formData.append("file", csvFile);

        setUploading(true);
        setProgress(0);
        setFeedback(null);

        try {
            // Antes habia dos claves "headers" en este objeto y la segunda
            // pisaba a la primera. Una sola, y el Content-Type lo pone el
            // navegador con el boundary correcto del FormData.
            const response = await axios.post(
                `${baseUrl}register/upload-massive-csv`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / (progressEvent.total || 1)
                        );
                        setProgress(percent);
                    },
                }
            );

            setFeedback({
                type: "success",
                message: response.data?.data?.message || response.data?.message || "Clientes cargados.",
            });
            setCsvFile(null);
            if (onUploaded) onUploaded();
        } catch (error) {
            const cuerpo = error.response?.data;
            setFeedback({
                type: "error",
                message:
                    cuerpo?.message ||
                    cuerpo?.data?.message ||
                    "No pudimos subir el archivo. Revisa tu conexión e intenta de nuevo.",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="userPaCsv inlineFlex" style={{ flexDirection: "column", gap: 12 }}>
            <div className="inlineFlex" style={{ alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Button
                    variant="text"
                    size="small"
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={descargarPlantilla}
                    disabled={uploading}
                    title="El correo es opcional: el cliente entra con su celular. La dirección, la referencia, el distrito y el celular del motorizado también son opcionales: si los pones, el cliente queda con su ruta lista y no tiene que llenar nada al entrar."
                >
                    Plantilla
                </Button>

                {csvFile ? (
                    <Chip
                        label={csvFile.name}
                        onDelete={uploading ? undefined : handleRemoveFile}
                    />
                ) : (
                    <Chip label="Ningún archivo seleccionado" variant="outlined" />
                )}

                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                    className="btnPrimary"
                >
                    Importar
                    <VisuallyHiddenInput
                        type="file"
                        accept=".csv"
                        onChange={handleSelectFile}
                    />
                </Button>

                <Button
                    variant="outlined"
                    disabled={!csvFile || uploading}
                    onClick={handleUpload}
                    className="btnPrimary"
                >
                    {uploading ? "Subiendo…" : "Subir archivo"}
                </Button>
            </div>

            {uploading && (
                <div className="inlineBlock">
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        aria-label="Subiendo archivo…"
                    />
                </div>
            )}

            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ whiteSpace: "pre-line", maxWidth: 720 }}
                >
                    {feedback.message}
                </Alert>
            )}
        </div>
    );
}
