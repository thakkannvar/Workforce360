
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    employee: "",
    priority: "Medium",
    deadline: "",
  });

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed");
    }

    if (response.status === 204) return null;
    return response.json();
  }

  async function loadData() {
    setError("");
    setLoading(true);

    try {
      const [employeeData, taskData] = await Promise.all([
        request("/employees/"),
        request("/tasks/"),
      ]);

      setEmployees(employeeData);
      setTasks(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addEmployee(event) {
    event.preventDefault();
    setError("");

    try {
      await request("/employees/", {
        method: "POST",
        body: JSON.stringify(employeeForm),
      });

      setEmployeeForm({
        name: "",
        email: "",
        department: "",
        designation: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addTask(event) {
    event.preventDefault();
    setError("");

    try {
      await request("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          ...taskForm,
          employee: Number(taskForm.employee),
          status: "Pending",
          deadline: taskForm.deadline || null,
        }),
      });

      setTaskForm({
        title: "",
        description: "",
        employee: "",
        priority: "Medium",
        deadline: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(task, status) {
    setError("");

    try {
      await request(`/tasks/${task.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteEmployee(employeeId) {
    if (!window.confirm("Delete this employee and their tasks?")) return;

    setError("");

    try {
      await request(`/employees/${employeeId}/`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">WORKFORCE MANAGEMENT</p>
          <h1>Workforce360</h1>
          <p>Manage employees and track team tasks.</p>
        </div>
        <button onClick={loadData}>Refresh Data</button>
      </header>

      {error && <pre className="error">{error}</pre>}

      <section className="stats">
        <article className="stat">
          <span>Total Employees</span>
          <strong>{employees.length}</strong>
        </article>
        <article className="stat">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </article>
        <article className="stat">
          <span>Completed Tasks</span>
          <strong>{completedTasks}</strong>
        </article>
      </section>

      <section className="forms">
        <form className="panel" onSubmit={addEmployee}>
          <h2>Add Employee</h2>

          <input
            placeholder="Full name"
            value={employeeForm.name}
            onChange={(e) =>
              setEmployeeForm({
                ...employeeForm,
                name: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={employeeForm.email}
            onChange={(e) =>
              setEmployeeForm({
                ...employeeForm,
                email: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Department"
            value={employeeForm.department}
            onChange={(e) =>
              setEmployeeForm({
                ...employeeForm,
                department: e.target.value,
              })
            }
            required
          />

          <input
            placeholder="Designation"
            value={employeeForm.designation}
            onChange={(e) =>
              setEmployeeForm({
                ...employeeForm,
                designation: e.target.value,
              })
            }
            required
          />

          <button type="submit">Save Employee</button>
        </form>

        <form className="panel" onSubmit={addTask}>
          <h2>Create Task</h2>

          <input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
            required
          />

          <textarea
            placeholder="Task description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                description: e.target.value,
              })
            }
          />

          <select
            value={taskForm.employee}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                employee: e.target.value,
              })
            }
            required
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <select
            value={taskForm.priority}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                priority: e.target.value,
              })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <label>Deadline</label>
          <input
            type="date"
            value={taskForm.deadline}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                deadline: e.target.value,
              })
            }
          />

          <button type="submit" disabled={employees.length === 0}>
            Create Task
          </button>
        </form>
      </section>

      <section className="panel table-panel">
        <h2>Employees</h2>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees yet. Add your first employee above.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.designation}</td>
                    <td>
                      <button
                        className="danger"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel table-panel">
        <h2>Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks created yet.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Employee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.employee_name}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatus(task, e.target.value)
                        }
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
