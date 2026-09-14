import { useEffect, useRef, useState } from 'react';
import { KolAlert, KolButton, KolCard, KolHeading, KolSingleSelect, KolInputRadio, KolModal } from '@public-ui/react-v19';



interface Appointment { id: number; startsAt: string; type: 'PRACTICE' | 'DIGITAL' }
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatDate = (date: Date) => date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const timeSlots = Array.from({ length: 37 }, (_, index) => {
    const minutes = 8 * 60 + index * 15;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
});
const endpoint = 'http://localhost:8080/api/appointments';

export default function CalendarView() {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState<`${number}:${number}` | ''>('');
    const [type, setType] = useState<Appointment['type']>('PRACTICE');
    const [now, setNow] = useState(() => new Date());
    const dialog = useRef<HTMLKolModalElement>(null);
    const deleteDialog = useRef<HTMLKolModalElement>(null);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [deleting, setDeleting] = useState<Appointment | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const submitting = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        fetch(endpoint, { headers: { 'X-User-Id': localStorage.getItem('userId') || '' }, signal: controller.signal })
            .then(response => { if (!response.ok) throw new Error(); return response.json(); })
            .then(setAppointments)
            .catch(() => { if (!controller.signal.aborted) setLoadError('Die Termine konnten nicht geladen werden. Bitte lade die Seite erneut.'); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        const timer = window.setInterval(() => setNow(new Date()), 30000);
        return () => { controller.abort(); window.clearInterval(timer); };
    }, []);

    function openAppointment(date: string) {
        setEditing(null);
        setSelectedDate(date); setTime(''); setType('PRACTICE'); setSaveError('');
        dialog.current?.showModal();
    }

    function editAppointment(appointment: Appointment) {
        setEditing(appointment);
        setSelectedDate(appointment.startsAt.slice(0, 10));
        setTime(appointment.startsAt.slice(11, 16) as `${number}:${number}`);
        setType(appointment.type);
        setSaveError('');
        void dialog.current?.showModal();
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
        } catch { setDeleteError('Der Termin konnte nicht gelöscht werden. Bitte versuche es erneut.'); }
        finally { submitting.current = false; setSaving(false); }
    }

    async function saveAppointment() {

        if (submitting.current) return;
        if (!timeSlots.includes(time)) { setSaveError("Bitte wähle eine gültige Uhrzeit."); return; }
        const startsAt = `${selectedDate}T${time}:00`;
        if (new Date(startsAt) <= new Date()) { setSaveError('Bitte wähle eine Uhrzeit in der Zukunft.'); return; }
        submitting.current = true; setSaving(true); setSaveError('');
        try {
            const response = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'X-User-Id': localStorage.getItem('userId') || '' },
                body: JSON.stringify({ startsAt, type }),
            });
            if (!response.ok) throw new Error();
            const saved: Appointment = await response.json();
            setAppointments(current => editing ? current.map(appointment => appointment.id === saved.id ? saved : appointment) : [...current, saved]); setNow(new Date());
            dialog.current?.close();
        } catch { setSaveError('Der Termin konnte nicht gespeichert werden. Bitte versuche es erneut.'); }
        finally { submitting.current = false; setSaving(false); }
    }

    const offset = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const appointmentDays = new Set(appointments.map(appointment => appointment.startsAt.slice(0, 10)));
    const upcoming = appointments.filter(appointment => new Date(appointment.startsAt) >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

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
                    <KolButton className="calendar-icon-action" _label="Termin bearbeiten" _hideLabel _icons="calendar-edit-icon" _variant="secondary" _on={{ onClick: () => editAppointment(appointment) }} />
                    <KolButton className="calendar-icon-action" _label="Termin löschen" _hideLabel _icons="calendar-delete-icon" _variant="secondary" _on={{ onClick: () => {
                        setDeleting(appointment); setDeleteError(''); void deleteDialog.current?.showModal();
                    } }} />
                </div>
            </KolCard>)}
        </section>
        <KolModal ref={dialog} _label={editing ? 'Termin bearbeiten' : 'Termin hinzufügen'} _width="min(640px, calc(100vw - 32px))"
            _on={{ onCancel: event => { if (submitting.current) event.preventDefault(); } }}>
            <KolCard className="calendar-booking-card" _label={editing ? 'Termin bearbeiten' : 'Dein neuer Termin'} _level={2}>
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
    </div>;
}

