const newTaskInput = document.getElementById('newTaskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const searchTaskInput = document.getElementById('searchTaskInput');

let tasks = [];

// Menyimpan ke localStorage
function saveTasks() {
    localStorage.setItem('mySimpleDoTasks', JSON.stringify(tasks));
}

// Memuat data dari localStorage
function loadTasks() {
    const storedTasks = localStorage.getItem('mySimpleDoTasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    displayTasks();
}

// Menampilkan tugas ke browser
function displayTasks() {
    taskList.innerHTML = ''; // Kosongkan daftar tugas

    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.dataset.id = task.id;
        listItem.classList.add(task.status === 'completed' ? 'completed' : 'pending');

        const taskText = document.createElement('span');
        taskText.textContent = task.description;

        const buttonContainer = document.createElement('div');

        const completeButton = document.createElement('button');
        completeButton.textContent = task.status === 'pending' ? 'Selesai' : 'Batal';
        completeButton.onclick = () => toggleTaskStatus(task.id);
        buttonContainer.appendChild(completeButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.onclick = () => deleteTask(task.id);
        buttonContainer.appendChild(deleteButton);

        listItem.appendChild(taskText);
        listItem.appendChild(buttonContainer);
        taskList.appendChild(listItem);
    });

    updateBadge();
}

// Update jumlah tugas
function updateBadge() {
    const badge = document.getElementById('taskCountBadge');
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    badge.textContent = `Tugas: ${pendingTasks}`;
}

function addTask() {
    const description = newTaskInput.value.trim();
    if (description) {
        tasks.push({ id: Date.now(), description, status: 'pending' });
        newTaskInput.value = '';
        saveTasks();
        displayTasks();
    }
}

function toggleTaskStatus(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        saveTasks();
        displayTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

// Fitur pencarian
searchTaskInput.addEventListener('keyup', function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.task-list li').forEach(task => {
        const text = task.querySelector('span').textContent.toLowerCase();
        task.style.display = text.includes(query) ? 'flex' : 'none';
    });
});

addTaskButton.addEventListener('click', addTask);
document.addEventListener('DOMContentLoaded', loadTasks);