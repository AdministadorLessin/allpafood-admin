import { useState } from "react";
import axios from "axios";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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

export default function UploadUsersCsv() {

    const { baseUrl, token } = useAuthContext();

    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

    const handleSelectFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
        setFeedback({ type: "error", message: "El archivo debe ser un .csv" });
        setCsvFile(null);
        return;
        }

        setCsvFile(file);
        setFeedback(null);
        // Permite volver a seleccionar el mismo archivo si el usuario lo quita y lo vuelve a poner
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
        const response = await axios.post(baseUrl+
            "register/upload-massive-csv",
            formData,

            {
            headers: { "Content-Type": "multipart/form-data" },
            headers: {"Authorization" : `Bearer ${token}`},
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
            message: response.data?.data?.message || "Usuarios registrados correctamente.",
        });
        setCsvFile(null);
        } catch (error) {
        setFeedback({
            type: "error",
            message:
            error.response?.data?.message ||
            "Ocurrió un error al subir el archivo.",
        });
        } finally {
        setUploading(false);
        }
    };

    return (
        <div className="userPaCsv inlineFlex" style={{ flexDirection: "column", gap: 12 }}>
            <div className="inlineFlex" style={{ alignItems: "center", gap: 8 }}>
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
                    component="label"
                    variant="outlined"
                    disabled={!csvFile || uploading}
                    onClick={handleUpload}
                    className="btnPrimary"
                >
                    Subir archivo
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
                <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
                {feedback.message}
                </Alert>
            )}
        </div>
    );
}