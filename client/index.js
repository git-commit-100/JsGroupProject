let TASKS = [];
let editingTaskId = null;
let api = "http://localhost:8080";

$(document).ready(async () => {
  await getAllTasks();
  prepareTasksCard();
  $("#taskForm").submit((e) => submitHandler(e));
  // Event to search on input change
  $("#searchTask").on("input", () => searchTasks());
  // Event to handle search when user clears the input
  $("#searchTask").on("search", () => {
    if ($("#searchTask").val() === "") {
      prepareTasksCard();
    }
  });
  // Attach click event to the edit button using event delegation
  $("#tasks").on("click", ".edit", function () {
    const taskId = $(this).data("id");
    editTask(taskId);
  });
});

// Attach click event to the delete button using event delegation
$("#tasks").on("click", ".delete", function () {
  const taskId = $(this).closest(".task").prop("id");
  const taskName = $(this).closest(".task").find(".title").text().trim();
  // Prompt user for confirmation
  const confirmDelete = confirm(
    `Are you sure you want to delete "${taskName}" task? `
  );

  // Delete task on user confirmation
  if (confirmDelete) {
    deleteTask(taskId);
  }
});

function submitHandler(e) {
  e.preventDefault();

  let inputTitle = $("#taskTitle").val();
  let inputAssigned = $("#assignedBy").val();
  let inputStatus = $("#taskStatus").val();
  let inputDate = $("#taskDueDate").val();
  let inputDesc = $("#taskDesc").val();
  let inputPriority = $("#taskPriority").val();

  // form validation
  if (!inputTitle.trim()) {
    $("#taskTitle + p").css("display", "block");
    return;
  } else {
    $("#taskTitle + p").css("display", "none");
  }

  if (!inputDate.trim()) {
    $("#taskDueDate + p").css("display", "block");
    return;
  } else {
    $("#taskDueDate + p").css("display", "none");
  }

  if (!inputDesc.trim()) {
    $("#taskDesc + p").css("display", "block");
    return;
  } else {
    $("#taskDesc + p").css("display", "none");
  }

  // Check if editing or adding a new task
  if (editingTaskId !== null) {
    // Update existing task
    updateTask({
      id: editingTaskId,
      title: inputTitle,
      desc: inputDesc,
      dueDate: new Date(inputDate).toUTCString(),
      assignedBy: inputAssigned,
      status: inputStatus,
      priority: inputPriority,
    });
  } else {
    // construct form obj
    let formObj = {
      id: new Date().getTime(),
      title: inputTitle,
      desc: inputDesc,
      dueDate: new Date(inputDate).toUTCString(),
      assignedBy: inputAssigned,
      status: inputStatus,
      priority: inputPriority,
    };

    // post request
    createTask(formObj);
  }
  // resetting form
  $("#taskForm").trigger("reset");
  prepareTasksCard();
  editingTaskId = null;
  $("#submitBtn").text("Add Task");

  // scroll to tasks -> to see tasks on add / edit
  $("html, body").animate({ scrollTop: $("html, body")[0].scrollHeight }, 500);
}

async function getAllTasks() {
  try {
    const response = await fetch(`${api}/tasks`);
    const tasks = await response.json();
    TASKS = JSON.parse(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

function createTask(taskData) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${api}/create`, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log("Task created successfully:", data);
    }
  };

  xhr.onerror = function (error) {
    console.error("Error creating task:", error);
  };

  xhr.send(JSON.stringify(taskData));
}

function prepareTasksCard(tasks = TASKS) {
  let html = "";

  if (tasks.length <= 0) {
    html = `<h3>No Tasks to display :(</h3>`;
  } else {
    html = tasks
      .map((task) => {
        const utcDate = new Date(task.dueDate);
        const day = utcDate.getUTCDate().toString().padStart(2, "0");
        const month = utcDate.toLocaleString("default", {
          month: "short",
          timeZone: "UTC",
        });
        const year = utcDate.getUTCFullYear();
        const weekday = utcDate.toLocaleString("default", {
          weekday: "short",
          timeZone: "UTC",
        });

        const formattedDueDate = `${weekday}, ${day} ${month} ${year}`;

        return `<div class="task ${
          task.status === "In Progress"
            ? "inProgress"
            : task.status === "Pending"
            ? "pending"
            : "completed"
        }" id="${task.id}">
            <h3 class="title">${task.title} 
            ${
              task.priority === "High"
                ? `<span class="badge" data-tooltip="High Priority">
            <iconify-icon icon="solar:danger-circle-bold"></iconify-icon>
            </span>`
                : ""
            }
            </h3>
            <p class="assignedBy">Assigned by: <span>${
              task.assignedBy
            }</span></p>
            <p class="dueDate">Due date: <span>${formattedDueDate}</span></p>
            <p class="desc">${task.desc}</p>
            <p class="status">Status: <span>${task.status}</span></p>
            <div class="actions">
            <button class="edit"  data-id="${task.id}">Edit Task</button>
            <button class="delete">Delete Task</button>
            </div>
            
            </div>`;
      })
      .join("");
  }

  $("#tasks").html(html);
  $(".edit").click(function () {
    const taskId = $(this).data("id");
    editTask(taskId);
  });
}

// Function to perform search based on user input
function searchTasks() {
  const searchText = $("#searchTask").val().trim().toLowerCase();
  if (searchText !== "") {
    const filteredTasks = Array.prototype.filter.call(TASKS, (task) => {
      return (
        task.title.toLowerCase().includes(searchText) ||
        task.assignedBy.toLowerCase().includes(searchText)
      );
    });
    prepareTasksCard(filteredTasks);
  } else {
    prepareTasksCard(TASKS);
  }
}

// Function to handle task editing
function editTask(taskId) {
  const task = TASKS.find((task) => task.id === taskId);
  if (task) {
    $("#taskTitle").val(task.title);
    $("#assignedBy").val(task.assignedBy);
    $("#taskPriority").val(task.priority);
    $("#taskStatus").val(task.status);
    $("#taskDueDate").val(new Date(task.dueDate).toISOString().split("T")[0]);
    $("#taskDesc").val(task.desc);
    editingTaskId = taskId;

    // Scroll to the top of the page
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      500
    );

    // Change the submit button text to "Update Task"
    $("#submitBtn").text("Update Task");
  }
}

// Function to update an existing tasks
function updateTask(updatedTask) {
  const taskIndex = TASKS.findIndex((task) => task.id === updatedTask.id);
  if (taskIndex !== -1) {
    TASKS[taskIndex] = updatedTask; // Update the local TASKS array
    // Make a PUT request to update the task on the server
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `${api}/tasks/${updatedTask.id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      if (xhr.status === 200) {
        console.log("Task updated successfully:", xhr.responseText);
        prepareTasksCard();
      } else {
        console.error("Failed to update task:", xhr.responseText);
      }
    };

    xhr.onerror = function () {
      console.error("Error updating task:");
    };

    xhr.send(JSON.stringify(updatedTask));
  }
}

const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${api}/delete/${taskId}`, {
      method: "delete",
    });
    const data = await response.json();
    console.log("Task deleted successfully:", data);
    // Update local TASKS array after deletion
    TASKS = TASKS.filter((task) => task.id != taskId);
    // Update UI
    prepareTasksCard();
  } catch (error) {
    console.error(error);
  }
};
