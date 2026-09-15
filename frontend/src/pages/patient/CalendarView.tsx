/**
 * CalendarView (Patient)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Monatskalender zur Terminübersicht und -buchung. Zeigt ein Grid mit allen
 * Tagen des gewählten Monats, markiert Tage mit bestehenden Terminen sowie
 * den heutigen Tag, und öffnet beim Antippen eines (nicht vergangenen)
 * Tages einen Buchungsdialog. Darunter wird zusätzlich die gemeinsam
 * genutzte `UpcomingAppointmentsCard` eingebunden.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - `loadAppointments()`: lädt alle Termine des Patienten; wird sowohl beim
 *   Mount als auch nach Änderungen über `UpcomingAppointmentsCard`
 *   (`onChanged`) erneut aufgerufen, damit Grid-Markierungen aktuell
 *   bleiben.
 * - Monatsraster-Berechnung: `offset` bestimmt, auf welchem Wochentag
 *   (Montag-basiert) der 1. des Monats fällt, damit die Tageskacheln an
 *   der richtigen Spalte im 7er-Grid beginnen; `daysInMonth` ermittelt die
 *   Anzahl der Tage über den Trick "Tag 0 des Folgemonats".
 * - `openAppointment()` / `saveAppointment()`: öffnen den Buchungsdialog
 *   für ein gewähltes Datum bzw. validieren und speichern den neuen
 *   Termin (Uhrzeit muss aus `timeSlots` stammen und in der Zukunft
 *   liegen).
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolAlert, KolButton, KolCard, KolHeading,
 * KolSingleSelect, KolInputRadio, KolModal), UpcomingAppointmentsCard.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Das Kalender-Grid selbst ist als eigenes CSS-Grid mit `KolButton`-Kacheln
 * pro Tag umgesetzt, da KoliBri keine dedizierte Monatskalender-Komponente
 * bereitstellt; alle interaktiven Elemente innerhalb des Grids
 * (Navigations-Pfeile, Tages-Buttons) sind jedoch konsequent `KolButton`.
 * Für die eigentliche Buchung wird die bestehende `KolModal`-/Formular-
 * Kombination aus `UpcomingAppointmentsCard` gespiegelt, um ein
 * einheitliches Bedienmuster für "Termin anlegen" und "Termin bearbeiten"
 * zu gewährleisten.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * `.patient-calendar-grid` ist ein 7-spaltiges CSS-Grid
 * (`repeat(7, minmax(0, 1fr))`), das sich automatisch an die verfügbare
 * Breite anpasst; auf sehr schmalen Displays (≤ 480px) wird der
 * Kachel-Abstand reduziert, damit alle sieben Spalten ohne horizontales
 * Scrollen sichtbar bleiben. Die Aktions-Buttons unterhalb des Kalenders
 * nutzen ein responsives 2-Spalten-Grid, das auf kleinen Bildschirmen auf
 * eine Spalte reduziert werden kann.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolAlert, KolButton, KolCard, KolHeading, KolSingleSelect,
 * KolInputRadio, KolModal.
 */

import { useEffect, useRef, useState } from 'react';
import { KolAlert, KolButton, KolCard, KolHeading, KolSingleSelect, KolInputRadio, KolModal } from '@public-ui/react-v19';
import UpcomingAppointmentsCard from '../../components/UpcomingAppointmentsCard';



interface Appointment { id: number; startsAt: string; type: 'PRACTICE' | 'DIGITAL' }
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatDate = (date: Date) => date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
// Erzeugt ein 15-Minuten-Raster von 08:00 bis 17:00 Uhr (37 Slots = 9h * 4 + 1).
// Wird sowohl als Auswahlmenge im Buchungsdialog als auch zur Validierung
// ('liegt der gewählte Wert im erlaubten Raster?') verwendet.
const timeSlots = Array.from({ length: 37 }, (_, index) => {
    const minutes = 8 * 60 + index * 15;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
});
const endpoint = 'http://localhost:8080/api/appointments';

export default function CalendarView() {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loadError, setLoadError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState<`${number}:${number}` | ''>('');
    const [type, setType] = useState<Appointment['type']>('PRACTICE');
    const [now, setNow] = useState(() => new Date());
    const dialog = useRef<HTMLKolModalElement>(null);
    const submitting = useRef(false);

    function loadAppointments(signal?: AbortSignal) {
        return fetch(endpoint, { headers: { 'X-User-Id': localStorage.getItem('userId') || '' }, signal })
            .then(response => { if (!response.ok) throw new Error(); return response.json(); })
            .then(setAppointments)
            .catch(() => { if (!signal?.aborted) setLoadError('Die Termine konnten nicht geladen werden. Bitte lade die Seite erneut.'); });
    }

    useEffect(() => {
        const controller = new AbortController();
        loadAppointments(controller.signal);
        const timer = window.setInterval(() => setNow(new Date()), 30000);
        return () => { controller.abort(); window.clearInterval(timer); };
    }, []);

    function openAppointment(date: string) {
        setSelectedDate(date); setTime(''); setType('PRACTICE'); setSaveError('');
        dialog.current?.showModal();
    }

    async function saveAppointment() {
        if (submitting.current) return;
        if (!timeSlots.includes(time)) { setSaveError("Bitte wähle eine gültige Uhrzeit."); return; }
        const startsAt = `${selectedDate}T${time}:00`;
        if (new Date(startsAt) <= new Date()) { setSaveError('Bitte wähle eine Uhrzeit in der Zukunft.'); return; }
        submitting.current = true; setSaving(true); setSaveError('');
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Id': localStorage.getItem('userId') || '' },
                body: JSON.stringify({ startsAt, type }),
            });
            if (!response.ok) throw new Error();
            const saved: Appointment = await response.json();
            setAppointments(current => [...current, saved]); setNow(new Date());
            dialog.current?.close();
        } catch { setSaveError('Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut.'); }
        finally { submitting.current = false; setSaving(false); }
    }

    // getDay() liefert 0 (So) bis 6 (Sa); '+6 % 7' verschiebt auf einen
    // Montag-basierten Wochenstart, damit das 7-Spalten-Grid (Mo–So) mit
    // dem 1. des Monats in der richtigen Spalte beginnt.
    const offset = (month.getDay() + 6) % 7;
    // Tag 0 des Folgemonats entspricht dem letzten Tag des aktuellen Monats –
    // ein gängiger Trick, um die Anzahl der Tage im Monat zu ermitteln.
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const appointmentDays = new Set(appointments.map(appointment => appointment.startsAt.slice(0, 10)));

    return <div className="patient-calendar">
        <header className="mood-header">
            <KolHeading _level={1} _label="Kalender" />
            <p className="mood-subtitle">Deine Termine.</p>
        </header>
        <KolCard _label={month.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })} _level={2}>
            <div className="patient-calendar-navigation">
                <KolButton className="calendar-arrow" _label="Vorheriger Monat" _hideLabel _icons="calendar-arrow-left" _on={{ onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)) }} />
                <KolButton className="calendar-arrow" _label="Nächster Monat" _hideLabel _icons="calendar-arrow-right" _on={{ onClick: () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)) }} />
            </div>
            <div className="patient-calendar-grid">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => <span className="patient-calendar-weekday" key={day}>{day}</span>)}
                {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                    const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
                    const key = dateKey(date);
                    const hasAppointment = appointmentDays.has(key);
                    const isToday = key === dateKey(now);
                    return <div key={key} className="patient-calendar-day">
                        <KolButton _label={String(index + 1)} _disabled={key < dateKey(now)}
                            className={`calendar-date${hasAppointment ? ' calendar-date-booked' : ''}${isToday ? ' calendar-date-today' : ''}`}
                            _variant={isToday ? 'primary' : 'secondary'}
                            _ariaDescription={`${formatDate(date)}${isToday ? ', Heute' : ''}${hasAppointment ? ', Termin vorhanden' : ''}. Termin hinzufügen.`}
                            _on={{ onClick: () => openAppointment(key) }} />
                    </div>;
                })}
            </div>
        </KolCard>
        {loadError && <KolAlert _type="error" _label="Termine nicht geladen">{loadError}</KolAlert>}

        {/* Gleiche "Kiste" wie auf patient/home: lädt & verwaltet ihre Termine
            eigenständig. onChanged sorgt dafür, dass die Buchungspunkte im
            Kalender-Grid oben nach einer Bearbeitung/Löschung aktuell bleiben. */}
        <UpcomingAppointmentsCard onChanged={() => loadAppointments()} />

        <KolModal ref={dialog} _label="Termin hinzufügen" _width="min(640px, calc(100vw - 32px))"
            _on={{ onCancel: event => { if (submitting.current) event.preventDefault(); } }}>
            <KolCard className="calendar-booking-card" _label="Dein neuer Termin" _level={2}>
                <div className="patient-calendar-form">
                    <div className="calendar-booking-date"><span>DEIN GEWÄHLTES DATUM</span><p>{selectedDate && formatDate(new Date(`${selectedDate}T00:00:00`))}</p></div>
                    <KolSingleSelect className="calendar-time-select" _label="Uhrzeit auswählen" _rows={4} _hasClearButton={false} _placeholder="Bitte Uhrzeit wählen" _required _value={time || null} _disabled={saving}
                        _options={timeSlots.map(slot => ({ label: `${slot} Uhr`, value: slot, disabled: new Date(`${selectedDate}T${slot}:00`) <= now }))}
                        _on={{ onChange: (_event, value) => {
                            const input = String((Array.isArray(value) ? value[0] : value) ?? '');
                            setTime(timeSlots.includes(input) ? input as `${number}:${number}` : '');
                        } }} />
                    <KolInputRadio className="calendar-type-choice" _label="Terminart" _value={type} _disabled={saving}
                        _options={[{ label: 'Praxis', value: 'PRACTICE' }, { label: 'Digital', value: 'DIGITAL' }]}
                        _on={{ onChange: (_event, value) => { if (value === 'PRACTICE' || value === 'DIGITAL') setType(value); } }} />
                    {saveError && <KolAlert _type="error" _label="Bitte prüfe deinen Termin">{saveError}</KolAlert>}
                    <div className="patient-calendar-actions">
                        <KolButton _label="Abbrechen" _variant="secondary" _disabled={saving} _on={{ onClick: () => { void dialog.current?.close(); } }} />
                        <KolButton _label={saving ? 'Wird gespeichert …' : 'Termin speichern'} _disabled={saving} _on={{ onClick: saveAppointment }} />
                    </div>
                </div>
            </KolCard>
        </KolModal>
    </div>;
}

