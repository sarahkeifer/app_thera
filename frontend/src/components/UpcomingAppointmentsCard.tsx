/**
 * UpcomingAppointmentsCard
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Eigenständige, seitenübergreifend wiederverwendbare "Anstehende Termine"-
 * Box (aktuell eingebunden in `patient/home` und `patient/calendar`). Lädt
 * die Termine des Patienten selbst, zeigt sie chronologisch sortiert an und
 * bietet Bearbeiten-/Löschen-Dialoge inklusive eigener Validierung.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Lädt Termine per `fetch` beim Mount (mit `AbortController` für sauberes
 *   Unmount-Verhalten) und aktualisiert `now` alle 30 Sekunden, damit
 *   bereits vergangene Termine automatisch aus der "anstehend"-Liste
 *   verschwinden, ohne dass die Seite neu geladen werden muss.
 * - `editAppointment()` / `saveAppointment()`: öffnen den Bearbeiten-Dialog
 *   bzw. validieren (Uhrzeit muss aus den erlaubten `timeSlots` stammen und
 *   in der Zukunft liegen) und persistieren die Änderung per `PUT`.
 * - `deleteAppointment()`: entfernt einen Termin per `DELETE` und aktualisiert
 *   die lokale Liste optimistisch nach Erfolg.
 * - `onChanged`-Callback informiert eine einbindende Seite (z. B. das
 *   Kalender-Grid), dass sich der Terminbestand geändert hat, damit dort
 *   unabhängig geladene Daten (z. B. Tages-Markierungen) aktuell bleiben.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolAlert, KolButton, KolCard, KolHeading,
 * KolSingleSelect, KolInputRadio, KolModal).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - `timeSlots` wird einmalig als 15-Minuten-Raster zwischen 08:00 und
 *   17:00 Uhr berechnet (37 Werte: 8h * 4 Slots/h + 1) und sowohl für die
 *   Auswahl als auch für die "liegt in der Vergangenheit"-Prüfung
 *   wiederverwendet.
 * - Bearbeiten/Löschen laufen über `KolModal` (natives `<dialog>`-Verhalten
 *   inkl. Fokus-Trap), statt über ein eigenes Overlay-Konstrukt – dadurch
 *   wird die vorhandene KoliBri-Dialoglösung konsequent genutzt.
 * - Während eines laufenden Speicher-/Löschvorgangs wird das Schließen des
 *   Dialogs per `onCancel`-Guard verhindert (`submitting.current`), damit
 *   keine inkonsistenten Zwischenzustände entstehen.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die `KolModal`-Breite ist bereits fluid über
 * `min(640px, calc(100vw - 32px))` bzw. `min(480px, calc(100vw - 32px))`
 * definiert. Die Aktions-Icons in der Terminkarte (`.patient-calendar-card-
 * actions`) verwenden `flex-wrap`, damit sie auf schmalen Karten
 * umbrechen statt überzulaufen.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolAlert, KolButton, KolCard, KolHeading, KolSingleSelect, KolInputRadio,
 * KolModal.
 */

import { useEffect, useRef, useState } from 'react';
import { KolAlert, KolButton, KolCard, KolHeading, KolSingleSelect, KolInputRadio, KolModal } from '@public-ui/react-v19';

interface Appointment { id: number; startsAt: string; type: 'PRACTICE' | 'DIGITAL' }

const formatDate = (date: Date) => date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
// Gleiches 15-Minuten-Raster (08:00–17:00 Uhr) wie in CalendarView – bewusst
// unabhängig dupliziert, da beide Module eigenständig ohne gemeinsamen
// State nutzbar bleiben sollen (siehe Klassendokumentation oben).
const timeSlots = Array.from({ length: 37 }, (_, index) => {
    const minutes = 8 * 60 + index * 15;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
});
const endpoint = 'http://localhost:8080/api/appointments';

interface UpcomingAppointmentsCardProps {
    /**
     * Wird nach erfolgreichem Speichern/Löschen aufgerufen, damit eine
     * einbindende Seite (z. B. der Kalender-Grid mit den Punkten pro Tag)
     * ihre eigenen, separat geladenen Termine neu abrufen kann.
     */
    onChanged?: () => void;
}

/**
 * Zeigt die "Anstehende Termine"-Box: identisch zu dem Block, der bisher
 * am unteren Ende von patient/calendar stand. Lädt Termine eigenständig,
 * erlaubt Bearbeiten & Löschen über eigene Dialoge – kann daher ohne
 * weitere Abhängigkeiten auf beliebigen Seiten eingebunden werden
 * (aktuell: patient/calendar und patient/home).
 */
export default function UpcomingAppointmentsCard({ onChanged }: UpcomingAppointmentsCardProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [now, setNow] = useState(() => new Date());

    const dialog = useRef<HTMLKolModalElement>(null);
    const deleteDialog = useRef<HTMLKolModalElement>(null);
    const submitting = useRef(false);

    const [editing, setEditing] = useState<Appointment | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState<`${number}:${number}` | ''>('');
    const [type, setType] = useState<Appointment['type']>('PRACTICE');
    const [deleting, setDeleting] = useState<Appointment | null>(null);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        fetch(endpoint, { headers: { 'X-User-Id': localStorage.getItem('userId') || '' }, signal: controller.signal })
            .then(response => { if (!response.ok) throw new Error(); return response.json(); })
            .then(setAppointments)
            .catch(() => { if (!controller.signal.aborted) setLoadError('Die Termine konnten nicht geladen werden. Bitte lade die Seite erneut.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        const timer = window.setInterval(() => setNow(new Date()), 30000);
        return () => { controller.abort(); window.clearInterval(timer); };
    }, []);

    function editAppointment(appointment: Appointment) {
        setEditing(appointment);
        setSelectedDate(appointment.startsAt.slice(0, 10));
        setTime(appointment.startsAt.slice(11, 16) as `${number}:${number}`);
        setType(appointment.type);
        setSaveError('');
        void dialog.current?.showModal();
    }

    async function saveAppointment() {
        if (submitting.current || !editing) return;
        if (!timeSlots.includes(time)) { setSaveError('Bitte wähle eine gültige Uhrzeit.'); return; }
        const startsAt = `${selectedDate}T${time}:00`;
        if (new Date(startsAt) <= new Date()) { setSaveError('Bitte wähle eine Uhrzeit in der Zukunft.'); return; }
        submitting.current = true; setSaving(true); setSaveError('');
        try {
            const response = await fetch(`${endpoint}/${editing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-User-Id': localStorage.getItem('userId') || '' },
                body: JSON.stringify({ startsAt, type }),
            });
            if (!response.ok) throw new Error();
            const saved: Appointment = await response.json();
            setAppointments(current => current.map(appointment => appointment.id === saved.id ? saved : appointment));
            setNow(new Date());
            await dialog.current?.close();
            onChanged?.();
        } catch { setSaveError('Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut.'); }
        finally { submitting.current = false; setSaving(false); }
    }

    async function deleteAppointment() {
        if (!deleting || submitting.current) return;
        submitting.current = true; setSaving(true); setDeleteError('');
        try {
            const response = await fetch(`${endpoint}/${deleting.id}`, {
                method: 'DELETE', headers: { 'X-User-Id': localStorage.getItem('userId') || '' },
            });
            if (!response.ok) throw new Error();
            setAppointments(current => current.filter(appointment => appointment.id !== deleting.id));
            await deleteDialog.current?.close();
            setDeleting(null);
            onChanged?.();
        } catch { setDeleteError('Der Termin konnte nicht gelöscht werden. Bitte versuche es erneut.'); }
        finally { submitting.current = false; setSaving(false); }
    }

    const upcoming = appointments
        .filter(appointment => new Date(appointment.startsAt) >= now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    return <>
        <section className="patient-calendar-upcoming" aria-label="Anstehende Termine" aria-busy={loading}>
            <KolHeading _level={2} _label="Anstehende Termine" />
            {loading && <p role="status">Termine werden geladen …</p>}
            {loadError && <KolAlert _type="error" _label="Termine nicht geladen">{loadError}</KolAlert>}
            {!loading && !loadError && upcoming.length === 0 && <KolCard _label="Noch keine anstehenden Termine" _level={3}>
                <p>Wähle ein Datum im Kalender, um deinen nächsten Termin hinzuzufügen.</p>
            </KolCard>}
            {upcoming.map(appointment => <KolCard className="calendar-appointment-card" key={appointment.id} _level={3}
                _label={appointment.type === 'PRACTICE' ? 'Termin in der Praxis' : 'Digitaler Termin'}>
                <time dateTime={appointment.startsAt}>{formatDate(new Date(appointment.startsAt))}</time>
                <p>{new Date(appointment.startsAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p>
                <p>Terminart: {appointment.type === 'PRACTICE' ? 'Praxis' : 'Digital'}</p>
                <div className="patient-calendar-card-actions">
                    <KolButton
                        className="calendar-icon-action"
                        _label="Termin bearbeiten"
                        _hideLabel
                        _icons="calendar-edit-icon icofont icofont-ui-edit"
                        _variant="secondary"
                        _on={{ onClick: () => editAppointment(appointment) }}
                    />
                    <KolButton
                        className="calendar-icon-action"
                        _label="Termin löschen"
                        _hideLabel
                        _icons="calendar-delete-icon icofont icofont-ui-delete"
                        _variant="secondary"
                        _on={{ onClick: () => {
                                setDeleting(appointment); setDeleteError(''); void deleteDialog.current?.showModal();
                            } }}
                    />
                </div>
            </KolCard>)}
        </section>

        <KolModal ref={dialog} _label="Termin bearbeiten" _width="min(640px, calc(100vw - 32px))"
            _on={{ onCancel: event => { if (submitting.current) event.preventDefault(); } }}>
            <KolCard className="calendar-booking-card" _label="Termin bearbeiten" _level={2}>
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

        <KolModal ref={deleteDialog} _label="Termin löschen" _width="min(480px, calc(100vw - 32px))"
            _on={{ onCancel: event => { if (submitting.current) event.preventDefault(); } }}>
            <KolCard _label="Termin wirklich löschen?" _level={2}>
                <div className="patient-calendar-form">
                    <p>{deleting && `${formatDate(new Date(deleting.startsAt))}, ${deleting.startsAt.slice(11, 16)} Uhr`}</p>
                    {deleteError && <KolAlert _type="error" _label="Löschen fehlgeschlagen">{deleteError}</KolAlert>}
                    <div className="patient-calendar-actions">
                        <KolButton _label="Abbrechen" _variant="secondary" _disabled={saving} _on={{ onClick: () => { void deleteDialog.current?.close(); } }} />
                        <KolButton _label={saving ? 'Wird gelöscht …' : 'Termin löschen'} _disabled={saving} _on={{ onClick: deleteAppointment }} />
                    </div>
                </div>
            </KolCard>
        </KolModal>
    </>;
}
