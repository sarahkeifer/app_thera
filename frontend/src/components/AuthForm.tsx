import { useRef, useState } from "react";
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
    const messageTimeoutRef = useRef<number | null>(null);


    function validateFields() {
        if (!email.trim()) {
            showMessage("Bitte E-Mail eingeben");
            return false;
        }

        if (!email.includes("@")) {
            showMessage("Bitte gültige E-Mail eingeben");
            return false;
        }

        if (!password.trim()) {
            showMessage("Bitte Passwort eingeben");
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
        showMessage(text);
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
            showMessage("Login erfolgreich");
        } else {
            showMessage("Login fehlgeschlagen");
        }
    }

    function showMessage(text: string) {
        setMessage(text);


        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        messageTimeoutRef.current = window.setTimeout(() => {
            setMessage("");
        }, 3000);
    }

    return (
        <div className="auth-page">
            <div className="auth-tabs">
                <button
                    className={mode === "login" ? "auth-tab active" : "auth-tab"}
                    onClick={() => setMode("login")}
                >
                    Einloggen
                </button>

                <button
                    className={mode === "register" ? "auth-tab active" : "auth-tab"}
                    onClick={() => setMode("register")}
                >
                    Registrieren
                </button>
            </div>
            <div className="auth-card">
                <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>

                <KolInputEmail
                    _label="E-Mail"
                    _hideLabel
                    _value={email}
                    _on={{onInput: (_e, v) => setEmail(String(v))}}
                />

                <KolInputPassword
                    _label="Passwort"
                    _hideLabel
                    _value={password}
                    _on={{onInput: (_e, v) => setPassword(String(v))}}
                />

                {mode === "register" && (
                    <div className="role-selector">
                        <KolButton
                            _label="Patient"
                            _variant={role === "PATIENT" ? "primary" : "secondary"}
                            _on={{onClick: () => setRole("PATIENT")}}
                        />
                        <KolButton
                            _label="Therapeut"
                            _variant={role === "THERAPIST" ? "primary" : "secondary"}
                            _on={{onClick: () => setRole("THERAPIST")}}
                        />
                    </div>
                )}

                <div className="auth-submit">
                    <KolButton
                        _label={mode === "login" ? "Einloggen" : "Registrieren"}
                        _on={{onClick: mode === "login" ? login : register}}
                    />
                </div>

                {message && <p className="auth-message">{message}</p>}
            </div>
        </div>
    );
}

export default AuthForm;