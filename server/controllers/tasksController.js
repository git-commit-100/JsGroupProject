const fs = require("fs").promises; // Import fs promises
const tasksFile = "tasks.json";

// utility functions

async function getTasks(req, res) {
  try {
    const data = await fs.readFile(tasksFile);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks file:", error);
    return []; // Or an appropriate error response for client
  }
}

async function saveTasks(tasks) {
  try {
    await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
    console.log("Tasks saved successfully!");
  } catch (error) {
    console.error("Error saving tasks to file:", error);
  }
}

// controllers
const getAllTasks = async (req, res) => {
  const tasks = await getTasks();
  return res.json(JSON.stringify(tasks));
};

const getOneTask = (req, res) => {
  const { id } = req.params;
};

const createTask = async (req, res) => {
  const { id, title, desc, dueDate, assignedBy, status, priority } = req.body;
  if (!title || !desc || !dueDate || !assignedBy || !status || !priority) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const tasks = await getTasks();
  tasks.push({ id, title, desc, dueDate, assignedBy, status, priority });
  saveTasks(tasks);
  res.status(201).json({ message: "Tasks entered successfully !" });
};

const updateTask = (req, res) => {
  const { id } = req.params;
};

const deleteTask = (req, res) => {
  const { id } = req.params;
};

module.exports = {
  getAllTasks,
  getOneTask,
  createTask,
  updateTask,
  deleteTask,
};
