import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KolButton, KolCard, KolHeading } from "@public-ui/react-v19";
import type {AssignedTask} from "../types/task.ts";


export default function HomeTasksCard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<AssignedTask[]>([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/patient/tasks", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setTasks(data));
    }, []);

    const openTasks = tasks.filter((task) => task.status === "OPEN");

    return (
        <KolCard className="home-tasks" _label="">
            <div className="home-mood-header">
                <div className="home-mood-icon">📋</div>
                <KolHeading _level={2} _label="Offene Aufgaben" />
            </div>

            {openTasks.length === 0 ? (
                <p className="home-tasks-empty">Du hast aktuell keine offenen Aufgaben. 🎉</p>
            ) : (
                <>
                    <p className="home-subtitle">
                        {openTasks.length} offene {openTasks.length === 1 ? "Aufgabe" : "Aufgaben"}
                    </p>

                    <ul className="home-tasks-list">
                        {openTasks.slice(0, 3).map((task) => (
                            <li key={task.id}>{task.title}</li>
                        ))}
                    </ul>
                </>
            )}

            <div className="home-tasks-button">
                <KolButton
                    _label="Zu meinen Aufgaben"
                    _variant="secondary"
                    _on={{ onClick: () => navigate("/patient/taskview") }}
                />
            </div>
        </KolCard>
    );
}
