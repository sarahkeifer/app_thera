import { useState } from "react";
import { KolButton, KolInputEmail, KolInputPassword } from "@public-ui/react-v19";

type AuthFormProps = {
    onLoginSuccess: (role: string) => void;
};

function AuthForm({ onLoginSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PATIENT");
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");

    function validateFields() {
        if (!email.trim()) {
            setMessage("Bitte E-Mail eingeben");
            return false;
        }

        if (!email.includes("@")) {
            setMessage("Bitte gültige E-Mail eingeben");
            return false;
        }

        if (!password.trim()) {
            setMessage("Bitte Passwort eingeben");
            return false;
        }

        return true;
    }

    async function register() {
        if (!validateFields()) return;

        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        const text = await response.text();
        setMessage(text);
    }

    async function login() {
        if (!validateFields()) return;

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const user = await response.json();

            localStorage.setItem("userId", user.id);
            localStorage.setItem("role", user.role);

            onLoginSuccess(user.role);
            setMessage("Login erfolgreich");
        } else {
            setMessage("Login fehlgeschlagen");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>


                    <KolInputEmail
                        _label="E-Mail"
                        _hideLabel
                        _value={email}
                        _on={{
                            onInput: (_event, value) => setEmail(String(value)),
                        }}
                    />


                    <KolInputPassword
                        _label="Passwort"
                        _hideLabel
                        _value={password}
                        _on={{
                            onInput: (_event, value) => setPassword(String(value)),
                        }}
                    />

                {mode === "register" && (
                    <div className="role-selector">
                        <KolButton
                            _label="Patient"
                            _variant={role === "PATIENT" ? "primary" : "secondary"}
                            _on={{
                                onClick: () => setRole("PATIENT"),
                            }}
                        />

                        <KolButton
                            _label="Therapeut"
                            _variant={role === "THERAPIST" ? "primary" : "secondary"}
                            _on={{
                                onClick: () => setRole("THERAPIST"),
                            }}
                        />

                    </div>
                )}

                    <KolButton
                        _label={mode === "login" ? "Einloggen" : "Registrieren"}
                        _on={{
                            onClick: mode === "login" ? login : register,
                        }}
                    />


                <p className="auth-switch-text">
                    {mode === "login" ? "Noch keinen Account?" : "Schon einen Account?"}
                </p>

                <KolButton
                    _label={mode === "login" ? "Registrieren" : "Einloggen"}
                    _variant="secondary"
                    _on={{
                        onClick: () => setMode(mode === "login" ? "register" : "login"),
                    }}
                />

                {message && <p className="auth-message">{message}</p>}
            </div>
        </div>
    );
}

export default AuthForm;