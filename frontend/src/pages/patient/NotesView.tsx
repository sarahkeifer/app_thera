/**
 * NotesView (Patient)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Notizverwaltung für Patienten mit zwei Notiztypen (Text/Audio). Erlaubt
 * Anlegen, Bearbeiten und Löschen von Notizen; die Audio-Aufnahme ist
 * aktuell als deaktivierter UI-Platzhalter umgesetzt (siehe Hinweistext im
 * Dialog).
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - `loadNotes()`: lädt alle Notizen des Patienten vom Backend.
 * - `openNewNoteDialog(type)`: öffnet den Erfassungsdialog im gewünschten
 *   Notiztyp und setzt das Formular zurück.
 * - `handleSave()`: legt eine neue Notiz per `POST` an bzw. aktualisiert
 *   eine bestehende per `PUT`; bei Audio-Notizen ohne Titel wird
 *   automatisch "Sprachmemo" als Titel verwendet.
 * - `handleDelete()`: löscht die zuvor markierte Notiz per `DELETE`.
 * - `formatDate()`: formatiert das Aktualisierungsdatum lokalisiert
 *   (de-DE) getrennt nach Datum und Uhrzeit für die Listenanzeige.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolCard, KolHeading, KolIcon,
 * KolInputText, KolTextarea).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Der (deaktivierte) Aufnahme-Button für Audio-Notizen ist bewusst als
 * einfaches natives `<button disabled>` mit eigenem Kreis-Design belassen,
 * da er aktuell keine echte Funktion auslöst (reiner Platzhalter für eine
 * künftige Aufnahmefunktion) und `KolButton` an dieser Stelle keinen
 * Mehrwert (kein Label-Text, rein visuelles Icon-Element) gebracht hätte;
 * sobald die Aufnahmefunktion implementiert wird, sollte hier auf
 * `KolButton`/`KolIconButton` umgestellt werden.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * `.notes-page` hat seitlichen Innenabstand (wie `.mood-page`), der auf
 * Smartphones schrumpft, damit die Inhalte nicht am Displayrand kleben.
 * `.notes-modal` und `.delete-dialog` begrenzen ihre Breite und Höhe auf den
 * Viewport (Dialog scrollt intern, statt abgeschnitten zu werden). Die
 * Buttons-Reihen (Notiztypen, Dialog-Aktionen, Ja/Nein) stapeln sich bei
 * sehr schmalen Breiten. Die Notiz-Liste (`.notes-list`) ist eine vertikal
 * fließende Liste; die Titel-/Aktionszeile pro Notiz (`.notes-item-top`)
 * bricht um, sodass Bearbeiten-/Löschen-Buttons nie über den Titel
 * hinausragen und lange Titel umgebrochen werden (siehe index.css,
 * Abschnitt "Responsive: Patientenübersicht & Notizen").
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading, KolIcon, KolInputText, KolTextarea.
 */

import { useEffect, useState } from "react";
import {
    KolButton,
    KolCard,
    KolHeading,
    KolIcon,
    KolInputText,
    KolTextarea,
} from "@public-ui/react-v19";

type NoteType = "TEXT" | "AUDIO";

interface Note {
    id: string;
    title: string;
    content: string;
    type: NoteType;
    duration: string | null;
    createdAt: string;
    updatedAt: string;
}

const typeInfo: Record<NoteType, { label: string; icon: string; className: string }> = {
    TEXT: { label: "Textnotiz", icon: "icofont icofont-file-text", className: "note-type-text" },
    AUDIO: { label: "Audio", icon: "icofont icofont-mic", className: "note-type-audio" },
};

function formatDate(dateString: string) {
    const date = new Date(dateString);

    return {
        date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "long" }),
        time: date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    };
}

export default function NotesView() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState<NoteType>("TEXT");
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const loadNotes = () => {
        fetch("http://localhost:8080/api/notes", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setNotes(data));
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const openNewNoteDialog = (type: NoteType) => {
        setEditingNote(null);
        setDialogType(type);
        setTitle("");
        setContent("");
        setError("");
        setShowDialog(true);
    };

    const handleSave = async () => {
        if (dialogType === "TEXT" && !title.trim()) {
            setError("Bitte einen Titel angeben");
            return;
        }

        const url = editingNote
            ? `http://localhost:8080/api/notes/${editingNote.id}`
            : "http://localhost:8080/api/notes";

        const method = editingNote ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({
                title: dialogType === "AUDIO" && !title.trim() ? "Sprachmemo" : title,
                content,
                type: dialogType,
            }),
        });

        const savedNote = await response.json();

        if (editingNote) {
            setNotes(notes.map((n) => (n.id === editingNote.id ? savedNote : n)));
        } else {
            setNotes([savedNote, ...notes]);
        }

        setEditingNote(null);
        setTitle("");
        setContent("");
        setError("");
        setShowDialog(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        await fetch(`http://localhost:8080/api/notes/${deleteId}`, {
            method: "DELETE",
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        });

        setNotes(notes.filter((n) => n.id !== deleteId));
        setDeleteId(null);
        setShowDeleteDialog(false);
    };

    return (
        <div className="notes-page">
            <div className="notes-header">
                <KolHeading _level={1} _label="Notizen" />

                <p className="notes-subtitle">
                    {notes.length} {notes.length === 1 ? "Eintrag" : "Einträge"}
                </p>
            </div>

            <div className="notes-add-row">
                <KolButton
                    _label="Textnotiz"
                    _icons="icofont icofont-file-text"
                    className="note-type-btn"
                    _on={{ onClick: () => openNewNoteDialog("TEXT") }}
                />

                <KolButton
                    _label="Audio"
                    _icons="icofont icofont-mic"
                    _variant="secondary"
                    className="note-type-btn"
                    _on={{ onClick: () => openNewNoteDialog("AUDIO") }}
                />
            </div>

            {showDialog && (
                <div className="home-mood-overlay">
                    <div className="notes-modal">
                        <KolCard _label="" className="dialog">
                            <div className="notes-modal-header">
                                <span className={`notes-modal-icon ${typeInfo[dialogType].className}`}>
                                    <KolIcon _icons={typeInfo[dialogType].icon} _label="" />
                                </span>

                                <KolHeading
                                    _level={2}
                                    _label={
                                        editingNote
                                            ? "Notiz bearbeiten"
                                            : dialogType === "AUDIO"
                                                ? "Neue Audionotiz"
                                                : "Neue Textnotiz"
                                    }
                                />
                            </div>

                            {dialogType === "TEXT" || editingNote ? (
                                <>
                                    <div className="notes-form-field">
                                        <label className="task-form-label">Titel</label>
                                        <KolInputText
                                            _label="Titel"
                                            _hideLabel
                                            _placeholder="Notiz-Titel"
                                            _value={title}
                                            _on={{ onInput: (_e, value) => setTitle(String(value)) }}
                                        />
                                    </div>

                                    <div className="notes-form-field">
                                        <label className="task-form-label">Inhalt</label>
                                        <KolTextarea
                                            _label="Inhalt"
                                            _hideLabel
                                            _placeholder="Was möchtest du festhalten?"
                                            _value={content}
                                            _on={{ onInput: (_e, value) => setContent(String(value)) }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="notes-audio-record">
                                    <span className="notes-audio-record-icon">
                                        <KolIcon _icons="icofont icofont-mic" _label="" />
                                    </span>

                                    <button type="button" className="notes-audio-record-btn" disabled>
                                        <span className="notes-audio-record-dot" />
                                    </button>

                                    <p>Tippe zum Aufnehmen</p>

                                    <p className="notes-audio-hint">
                                        Prototyp: Eine echte Aufnahmefunktion ist noch nicht angebunden.
                                        Die Notiz wird als Platzhalter gespeichert.
                                    </p>
                                </div>
                            )}

                            <div className="task-modal-error">{error}</div>

                            <div className="mood-dialog-actions">
                                <KolButton
                                    _label="Abbrechen"
                                    _variant="secondary"
                                    _on={{ onClick: () => setShowDialog(false) }}
                                />
                                <KolButton _label="Speichern" _on={{ onClick: handleSave }} />
                            </div>
                        </KolCard>
                    </div>
                </div>
            )}

            <div className="notes-list">
                {notes.length === 0 ? (
                    <p className="task-pool-empty">Noch keine Notizen vorhanden.</p>
                ) : (
                    notes.map((note) => {
                        const info = typeInfo[note.type];
                        const { date, time } = formatDate(note.updatedAt);

                        return (
                            <KolCard _label=" " className="note-card" key={note.id}>
                                <div className="notes-item-inner">
                                    <span className={`notes-item-icon ${info.className}`}>
                                        <KolIcon _icons={info.icon} _label={info.label} />
                                    </span>

                                    <div className="notes-item-content">
                                        <div className="notes-item-top">
                                            <p className="notes-item-title">{note.title}</p>

                                            <div className="mood-actions">
                                                <KolButton
                                                    _label="✏️"
                                                    _variant="secondary"
                                                    _on={{
                                                        onClick: () => {
                                                            setEditingNote(note);
                                                            setDialogType(note.type);
                                                            setTitle(note.title);
                                                            setContent(note.content || "");
                                                            setError("");
                                                            setShowDialog(true);
                                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                                        },
                                                    }}
                                                />
                                                <KolButton
                                                    _label="✖️"
                                                    _variant="secondary"
                                                    _on={{
                                                        onClick: () => {
                                                            setDeleteId(note.id);
                                                            setShowDeleteDialog(true);
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {note.type === "TEXT" && note.content && (
                                            <p className="notes-item-preview">{note.content}</p>
                                        )}

                                        {note.type === "AUDIO" && (
                                            <div className="notes-item-duration">
                                                <KolIcon _icons="icofont icofont-clock-time" _label="" />
                                                <span>{note.duration || "Aufnahme"}</span>
                                            </div>
                                        )}

                                        <div className="notes-item-meta">
                                            <span>{date}</span>
                                            <span>•</span>
                                            <span>{time}</span>
                                        </div>
                                    </div>
                                </div>
                            </KolCard>
                        );
                    })
                )}
            </div>

            {showDeleteDialog && (
                <div className="home-mood-overlay">
                    <div className="delete-dialog">
                        <KolCard _label="" className="dialog">
                            <p>Möchtest du diese Notiz löschen?</p>

                            <div className="home-mood-actions">
                                <div className="mood-btn">
                                    <KolButton
                                        _label="Nein"
                                        _variant="secondary"
                                        _on={{
                                            onClick: () => {
                                                setShowDeleteDialog(false);
                                                setDeleteId(null);
                                            },
                                        }}
                                    />
                                </div>

                                <div className="mood-btn">
                                    <KolButton _label="Ja" _on={{ onClick: handleDelete }} />
                                </div>
                            </div>
                        </KolCard>
                    </div>
                </div>
            )}
        </div>
    );
}
