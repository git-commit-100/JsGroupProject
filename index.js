let TASKS = [];

$(document).ready(() => {
  getAllTasksFromLocalStorage();
  prepareTasksCard();
  $("#taskForm").submit((e) => submitHandler(e));
  $("#searchTask").on("keyup", () => searchTasks());
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

  // construct form obj
  let formObj = {
    id: new Date().getTime(),
    title: inputTitle,
    desc: inputDesc,
    dueDate: new Date(inputDate).toDateString(),
    assignedBy: inputAssigned,
    status: inputStatus,
    priority: inputPriority,
  };

  addTaskToLocalStorage(formObj);
  // resetting form
  $("#taskForm").trigger("reset");
  prepareTasksCard();
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
                ? `<span class="badge">
            <iconify-icon icon="solar:danger-circle-bold"></iconify-icon>
            </span>`
                : ""
            }
            </h3>
            <p class="assignedBy">Assigned by: <span>${
              task.assignedBy
            }</span></p>
            <p class="dueDate">Due date: <span>${task.dueDate}</span></p>
            <p class="desc">${task.desc}</p>
            <p class="status">Status: <span>${task.status}</span></p>
            <div class="actions">
            <button class="edit">Edit Task</button>
            <button class="delete">Delete Task</button>
            </div>
            </div>`;
      })
      .join("");
  }

  $("#tasks").html(html);
}

function addTaskToLocalStorage(formObj) {
  getAllTasksFromLocalStorage();
  TASKS.push(formObj);
  localStorage.setItem("tasks", JSON.stringify(TASKS));
}

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
