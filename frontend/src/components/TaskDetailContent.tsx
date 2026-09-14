import { KolButton, KolHeading } from "@public-ui/react-v19";
import {type AssignedTask, assignedTypeInfo, formatDueDate} from "../types/task.ts";

type TaskDetailContentProps = {
    task: AssignedTask;
    onToggleStatus: () => void;
};

export default function TaskDetailContent({ task, onToggleStatus }: TaskDetailContentProps) {
    const isCompleted = task.status === "COMPLETED";
    const info = assignedTypeInfo[task.type];
    const dueDateLabel = formatDueDate(task.dueDate);

    return (
        <div className="task-detail">
            <KolHeading _level={2} _label={task.title} />

            <div className="assigned-task-meta">
                <span>{info.label}</span>
                <span>•</span>
                <span>{task.duration}</span>
                {dueDateLabel && (
                    <>
                        <span>•</span>
                        <span>Fällig bis {dueDateLabel}</span>
                    </>
                )}
            </div>

            <div className="task-detail-section">
                <h3>Aufgabenbeschreibung</h3>
                <p>{task.description}</p>
            </div>

            {task.materials && (
                <div className="task-detail-section">
                    <h3>Materialien</h3>
                    <p>{task.materials}</p>
                </div>
            )}

            <div className="task-detail-actions">
                <KolButton
                    _label={isCompleted ? "Als offen markieren" : "Als erledigt markieren"}
                    _variant={isCompleted ? "secondary" : "primary"}
                    _on={{ onClick: onToggleStatus }}
                />
            </div>
        </div>
    );
}
