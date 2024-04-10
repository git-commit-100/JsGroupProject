let TASKS = [];
let editingTaskId = null;

$(document).ready(() => {
  getAllTasksFromLocalStorage();
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
  const confirmDelete = confirm(`Are you sure you want to delete "${taskName}" task? `);

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

    addTaskToLocalStorage(formObj);
  }
  // resetting form
  $("#taskForm").trigger("reset");
  prepareTasksCard();
  editingTaskId = null;
  $("#submitBtn").text("Add Task");

  // scroll to tasks -> to see tasks on add / edit
  $("html, body").animate({ scrollTop: $("html, body")[0].scrollHeight }, 500);
}

function getAllTasksFromLocalStorage() {
  let allTasks = localStorage.getItem("tasks");

  if (!allTasks) {
    TASKS = [];
  } else {
    TASKS = JSON.parse(allTasks);
  }
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

function addTaskToLocalStorage(formObj) {
  getAllTasksFromLocalStorage();
  TASKS.push(formObj);
  localStorage.setItem("tasks", JSON.stringify(TASKS));
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
    $("#taskDueDate").val(new Date(task.dueDate).toISOString().split("T")[0]); // Convert to YYYY-MM-DD format
    $("#taskDesc").val(task.desc);
    editingTaskId = taskId; // Set editing task ID

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

// Function to update an existing task in local storage
function updateTask(updatedTask) {
  const taskIndex = TASKS.findIndex((task) => task.id === updatedTask.id);
  if (taskIndex !== -1) {
    TASKS[taskIndex] = updatedTask;
    localStorage.setItem("tasks", JSON.stringify(TASKS));
  }
}

function deleteTask(taskId) {
  // Find the index of the task in the TASKS array
  const taskIndex = TASKS.findIndex((task) => task.id == taskId);

  if (taskIndex !== -1) {
    // task removal from array
    TASKS.splice(taskIndex, 1);

    // local storage updated
    localStorage.setItem("tasks", JSON.stringify(TASKS));

    // Update the UI
    prepareTasksCard();
  }
}

