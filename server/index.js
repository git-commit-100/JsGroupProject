const express = require("express");
const {
  getAllTasks,
  getOneTask,
  createTask,
  updateTask,
  deleteTask,
} = require("./controllers/tasksController");
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

app.get("/tasks", getAllTasks);

app.get("/task/:id", getOneTask);

app.post("/create", createTask);

app.put("/tasks/:id", updateTask);

app.delete("/delete/:id", deleteTask);

app.use("/", (req, res) => {
  return res.status(404).json("Task Manager API");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
