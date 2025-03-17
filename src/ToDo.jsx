import { useState, useEffect } from "react";
import { FaPlay, FaStop, FaTrash, FaCheckCircle } from "react-icons/fa";

export const ToDo = () => {
    const [inputValue, setInputValue] = useState("");
    const [tasks, setTasks] = useState([]);
    const [taskTimers, setTaskTimers] = useState({});

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!inputValue.trim()) return;

        const task = inputValue.trim();
        if (tasks.some((t) => t.task === task)) return;

        setTasks([...tasks, { task, completed: false }]);
        setTaskTimers((prevTimers) => ({
            ...prevTimers,
            [task]: { startTime: null, elapsedTime: 0, running: false },
        }));

        setInputValue("");
    };

    const deleteButton = (task) => {
        setTasks(tasks.filter((t) => t.task !== task));
        setTaskTimers((prevTimers) => {
            const updatedTimers = { ...prevTimers };
            delete updatedTimers[task];
            return updatedTimers;
        });
    };

    const toggleTimer = (task) => {
        setTaskTimers((prevTimers) => {
            const taskTimer = prevTimers[task] || { startTime: null, elapsedTime: 0, running: false };

            return {
                ...prevTimers,
                [task]: {
                    startTime: taskTimer.running ? null : Date.now() - (taskTimer.elapsedTime * 1000),
                    elapsedTime: taskTimer.elapsedTime,
                    running: !taskTimer.running,
                },
            };
        });

        // Remove completed status when the timer starts
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.task === task ? { ...t, completed: false } : t
            )
        );
    };

    const markCompleted = (task) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.task === task ? { ...t, completed: !t.completed } : t
            )
        );

        setTaskTimers((prevTimers) => ({
            ...prevTimers,
            [task]: { ...prevTimers[task], running: false },
        }));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTaskTimers((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                Object.keys(updatedTimers).forEach((task) => {
                    if (updatedTimers[task]?.running) {
                        const elapsedTime = Math.floor((Date.now() - updatedTimers[task].startTime) / 1000);
                        updatedTimers[task].elapsedTime = elapsedTime;
                    }
                });
                return updatedTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-semibold text-gray-800">📚 Silent Study Tracker</h2>
                <p className="text-gray-600 mt-2">Stay focused, stay productive. Every minute counts. 🌱</p>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border border-gray-200">
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter a task..."
                        className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Add
                    </button>
                </form>

                <ul className="space-y-2">
                    {tasks.length === 0 ? (
                        <p className="text-center text-gray-500">No tasks yet. Stay motivated! 📖</p>
                    ) : (
                        tasks.map((task, index) => (
                            <li
                                key={index}
                                className={`flex flex-col bg-gray-100 px-4 py-2 rounded-lg shadow-sm border border-gray-300 ${
                                    task.completed ? "bg-green-100" : ""
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-gray-700 font-medium ${task.completed ? "text-green-700" : ""}`}>
                                        {task.task}
                                    </span>
                                    {!taskTimers[task.task]?.running && (
                                        <button onClick={() => deleteButton(task.task)} className="text-red-500 hover:text-red-700">
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-blue-500 text-lg">
                                        ⏳ {Math.floor(taskTimers[task.task]?.elapsedTime / 60)}m{" "}
                                        {taskTimers[task.task]?.elapsedTime % 60}s
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleTimer(task.task)}
                                            className={`p-2 rounded-lg text-white transition ${
                                                taskTimers[task.task]?.running
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-green-500 hover:bg-green-600"
                                            }`}
                                        >
                                            {taskTimers[task.task]?.running ? <FaStop /> : <FaPlay />}
                                        </button>
                                        <button
                                            onClick={() => markCompleted(task.task)}
                                            className={`p-2 rounded-lg ${
                                                task.completed ? "text-gray-500 hover:text-gray-700" : "text-green-500 hover:text-green-700"
                                            }`}
                                        >
                                            <FaCheckCircle />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </section>
    );
};
