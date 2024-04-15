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

const getOneTask = async (req, res) => {
  const { id } = req.params;
  try {
    const tasks = await getTasks();
    const task = tasks.find(task => task.id == id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.json(JSON.stringify(task));
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
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

const updateTask = async (req, res) => {
  const { id } = req.params;  
  const updatedTask = req.body;

  try {
      const tasks = await getTasks();  
      const taskIndex = tasks.findIndex(task => task.id == id);  

      if (taskIndex == -1) {
          return res.status(404).json({ message: "Task not found" }); 
      }

      // Merge the existing task with new data
      tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask }; 

      await saveTasks(tasks); 
      res.status(200).json({ message: "Task updated successfully!" }); 
  } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Internal server error" });
  }

};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    let tasks = await getTasks(); // Retrieve all tasks
    tasks = tasks.filter(task => task.id !== id); // Filter out the task to be deleted
    await saveTasks(tasks); // Save the updated tasks list
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }



};

module.exports = {
  getAllTasks,
  getOneTask,
  createTask,
  updateTask,
  deleteTask,
};
