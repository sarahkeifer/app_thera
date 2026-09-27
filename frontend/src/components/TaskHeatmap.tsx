/**
 * TaskHeatmap
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Zeigt auf der Patienten-Startseite eine GitHub-artige Aktivitäts-Heatmap
 * der letzten 12 Monate: pro Tag ein Kästchen, das erledigte Aufgaben (grün)
 * UND erfasste Stimmungs-Einträge (orange) im selben Kästchen darstellt
 * (diagonal geteilt), damit beide Aktivitäten auf einen Blick sichtbar sind,
 * ohne zwei separate Grafiken zu benötigen.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Lädt beim Mount die Tagesaktivität vom Backend. Ohne `patientId`-Prop
 *   die eigene Aktivität des eingeloggten Patienten
 *   (`/api/patient/activity`, `PatientActivityController`); mit
 *   `patientId` (Nutzung durch Therapeuten in `PatientOverView`) die
 *   Aktivität dieses einen Patienten (`/api/therapist/patients/{id}/activity`,
 *   `TherapistController#getPatientActivity`) - beide Endpunkte liefern
 *   dasselbe Datenformat, da sie denselben `ActivityService` nutzen.
 * - Baut clientseitig ein vollständiges Wochen/Wochentage-Raster für die
 *   letzten 12 Monate auf (inkl. Tage ohne Aktivität), damit die Heatmap wie
 *   bei GitHub lückenlos ist.
 * - `levelFor()` bildet eine Anzahl (0, 1, 2, 3, 4+) auf eine von fünf
 *   Farbintensitätsstufen ab – separat für Aufgaben und Stimmung.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolCard, KolHeading).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Bewusst KEINE Chart-Bibliothek: Das Raster ist reines CSS-Grid, jedes
 * Kästchen ein `<div>` mit `title`-Attribut (native Tooltips) statt eigenem
 * Tooltip-Overlay – hält die Komponente leicht und ohne zusätzliche
 * Abhängigkeit. Die `patientId`-Prop entscheidet nur über die Datenquelle
 * (siehe oben) - Layout/Rendering ist in beiden Fällen identisch, damit
 * Patient und Therapeut exakt dieselbe Heatmap-Darstellung sehen.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Das Raster liegt in einem `overflow-x: auto`-Container (analog zur
 * Patienten-Tabelle in `PatientOverView`): auf schmalen Bildschirmen ist es
 * horizontal scrollbar statt das Layout zu sprengen oder Kästchen
 * unleserlich klein zu quetschen. Kästchengröße/Abstand sind in `clamp()`
 * gehalten, damit die Heatmap auf Tablet/Desktop etwas größer, auf Mobile
 * kompakter dargestellt wird.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolCard, KolHeading.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {KolCard, KolHeading, KolIcon} from "@public-ui/react-v19";

type TaskHeatmapProps = {
    /**
     * Wird gesetzt, wenn ein Therapeut die Heatmap eines bestimmten
     * Patienten ansieht (siehe PatientOverView). Ohne diese Prop zeigt die
     * Komponente die Aktivität des aktuell eingeloggten Nutzers.
     */
    patientId?: number;
    /** Optionaler Titel-Override, z. B. "Aktivität von Anna Beispiel". */
    title?: string;
};

type DayActivity = {
    date: string;
    completedTasks: number;
    moodEntries: number;
};

type DayCell = {
    date: string;
    completedTasks: number;
    moodEntries: number;
    inRange: boolean;
};

const WEEKS_BACK = 53;

// Fünf Intensitätsstufen (0 = keine Aktivität) je Farbe, angelehnt an die
// GitHub-Contribution-Graph-Palette, aber in Grün (Aufgaben) bzw. Orange
// (Stimmung) für dieses Projekt.
const TASK_COLORS = ["#ebedf0", "#c6ecd0", "#8fdba3", "#4cb96b", "#1f8a3d"];
const MOOD_COLORS = ["#ebedf0", "#fde3c7", "#fbc17f", "#f59433", "#c2620a"];

function levelFor(count: number): number {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * Baut ein lückenloses Raster der letzten `WEEKS_BACK` Wochen (Wochen als
 * Spalten, Montag-Sonntag als Zeilen), gefüllt mit den geladenen
 * Aktivitätsdaten. Tage außerhalb des Datenzeitraums (Auffüll-Tage am
 * Rasteranfang, damit Wochen vollständig sind) bekommen `inRange: false`
 * und werden unsichtbar gerendert.
 */
function buildWeeks(activity: DayActivity[]): DayCell[][] {
    const byDate = new Map(activity.map((day) => [day.date, day]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Zurück auf den Montag der aktuellen Woche, dann WEEKS_BACK Wochen
    // zusätzlich zurück, damit das Raster mit einem Montag beginnt.
    const currentWeekday = (today.getDay() + 6) % 7; // 0 = Montag
    const gridEnd = new Date(today);
    gridEnd.setDate(gridEnd.getDate() + (6 - currentWeekday));

    const gridStart = new Date(gridEnd);
    gridStart.setDate(gridStart.getDate() - (WEEKS_BACK * 7 - 1));

    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - 12);

    const weeks: DayCell[][] = [];
    const cursor = new Date(gridStart);

    for (let week = 0; week < WEEKS_BACK; week++) {
        const days: DayCell[] = [];

        for (let weekday = 0; weekday < 7; weekday++) {
            const key = toDateKey(cursor);
            const inRange = cursor >= rangeStart && cursor <= today;
            const dayData = byDate.get(key);

            days.push({
                date: key,
                completedTasks: dayData?.completedTasks ?? 0,
                moodEntries: dayData?.moodEntries ?? 0,
                inRange,
            });

            cursor.setDate(cursor.getDate() + 1);
        }

        weeks.push(days);
    }

    return weeks;
}

function cellStyle(cell: DayCell): CSSProperties {
    if (!cell.inRange) {
        return { visibility: "hidden" };
    }

    const taskColor = TASK_COLORS[levelFor(cell.completedTasks)];
    const moodColor = MOOD_COLORS[levelFor(cell.moodEntries)];

    if (cell.completedTasks <= 0 && cell.moodEntries <= 0) {
        return { background: taskColor };
    }

    // Diagonal geteiltes Kästchen: obere linke Hälfte = Aufgaben (grün),
    // untere rechte Hälfte = Stimmung (orange) - so sind beide Aktivitäten
    // im selben Rechteck sichtbar, ohne zwei separate Grafiken zu brauchen.
    return {
        background: `linear-gradient(135deg, ${taskColor} 50%, ${moodColor} 50%)`,
    };
}

function formatDateLabel(dateKey: string): string {
    const [year, month, day] = dateKey.split("-");
    return `${day}.${month}.${year}`;
}

function cellTitle(cell: DayCell): string {
    const label = formatDateLabel(cell.date);

    if (cell.completedTasks <= 0 && cell.moodEntries <= 0) {
        return `${label}: keine Aktivität`;
    }

    const parts: string[] = [];

    if (cell.completedTasks > 0) {
        parts.push(
            `${cell.completedTasks} ${cell.completedTasks === 1 ? "Aufgabe" : "Aufgaben"} erledigt`
        );
    }

    if (cell.moodEntries > 0) {
        parts.push(
            `${cell.moodEntries} ${cell.moodEntries === 1 ? "Stimmungseintrag" : "Stimmungseinträge"}`
        );
    }

    return `${label}: ${parts.join(", ")}`;
}

// Monatslabels über dem Raster: nur an der Spalte gesetzt, in der ein neuer
// Monat beginnt, damit die Beschriftung nicht pro Woche wiederholt wird.
function monthLabels(weeks: DayCell[][]): (string | null)[] {
    const monthNames = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
    ];

    let lastMonth = -1;

    return weeks.map((week) => {
        const firstInRangeDay = week.find((day) => day.inRange);

        if (!firstInRangeDay) return null;

        const month = new Date(firstInRangeDay.date).getMonth();

        if (month !== lastMonth) {
            lastMonth = month;
            return monthNames[month];
        }

        return null;
    });
}

export default function TaskHeatmap({ patientId, title }: TaskHeatmapProps) {
    const [activity, setActivity] = useState<DayActivity[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ohne patientId: eigene Aktivität des eingeloggten Nutzers.
        // Mit patientId (Therapeuten-Ansicht): Aktivität dieses einen
        // Patienten, X-User-Id ist dabei weiterhin die des eingeloggten
        // Therapeuten (für die serverseitige Zugriffsprüfung).
        const url = patientId
            ? `http://localhost:8080/api/therapist/patients/${patientId}/activity`
            : "http://localhost:8080/api/patient/activity";

        fetch(url, {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Aktivität konnte nicht geladen werden.");
                return res.json();
            })
            .then((data: DayActivity[]) => setActivity(data))
            .catch((error) => {
                console.error("Fehler beim Laden der Aktivität:", error);
                setLoadError(true);
            })
            .finally(() => setLoading(false));
    }, [patientId]);

    // Raster bleibt unverändert (12 Monate); nur die Scroll-Position wird so
    // gesetzt, dass die Woche mit dem ersten Eintrag am linken Rand steht.
    useEffect(() => {
        const container = scrollRef.current;
        const firstActive = container?.querySelector<HTMLElement>("[data-first-active]");

        if (!container || !firstActive) return;

        container.scrollLeft +=
            firstActive.getBoundingClientRect().left - container.getBoundingClientRect().left;
    }, [loading, loadError, activity]);

    const weeks = buildWeeks(activity);
    const firstActiveWeek = weeks.findIndex((week) =>
        week.some((cell) => cell.inRange && (cell.completedTasks > 0 || cell.moodEntries > 0))
    );
    const months = monthLabels(weeks);
    const weekdayLabels = ["Mo", "", "Mi", "", "Fr", "", ""];

    return (
        <KolCard className="home-heatmap" _label="">
            <div className="home-mood-header">
                <KolIcon
                    className="home-mood-icon"
                    _icons="icofont icofont-tasks-alt"
                    _label="Aktivität"
                />
                <KolHeading _level={2} _label={title ?? "Deine Aktivität"} />
            </div>

            {loading ? (
                <p className="home-heatmap-loading">Aktivität wird geladen …</p>
            ) : loadError ? (
                <p className="home-heatmap-error">
                    Deine Aktivität konnte nicht geladen werden.
                </p>
            ) : (
                <>
                    <div className="home-heatmap-scroll" ref={scrollRef}>
                        <div className="home-heatmap-grid">
                            <div className="home-heatmap-months">
                                <div className="home-heatmap-weekday-spacer" />
                                {months.map((label, index) => (
                                    <span key={index} className="home-heatmap-month">
                                        {label ?? ""}
                                    </span>
                                ))}
                            </div>

                            <div className="home-heatmap-body">
                                <div className="home-heatmap-weekdays">
                                    {weekdayLabels.map((label, index) => (
                                        <span key={index}>{label}</span>
                                    ))}
                                </div>

                                <div className="home-heatmap-weeks">
                                    {weeks.map((week, weekIndex) => (
                                        <div
                                            className="home-heatmap-week"
                                            key={weekIndex}
                                            data-first-active={weekIndex === firstActiveWeek ? "" : undefined}
                                        >
                                            {week.map((cell) => (
                                                <div
                                                    key={cell.date}
                                                    className="home-heatmap-cell"
                                                    style={cellStyle(cell)}
                                                    title={cell.inRange ? cellTitle(cell) : undefined}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="home-heatmap-legend">
                        <span className="home-heatmap-legend-item">
                            <span className="home-heatmap-legend-swatch home-heatmap-legend-task" />
                            Aufgaben erledigt
                        </span>

                        <span className="home-heatmap-legend-item">
                            <span className="home-heatmap-legend-swatch home-heatmap-legend-mood" />
                            Stimmung erfasst
                        </span>
                    </div>
                </>
            )}
        </KolCard>
    );
}

