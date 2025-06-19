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
// Function to generate random meteors
function generateMeteor() {
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');
    
    // Randomize position and speed
    const startX = Math.random() * window.innerWidth; // Random start X position
    const startY = -50; // Start from top of the screen
    const delay = Math.random() * 2; // Random delay for falling
    const duration = Math.random() * 3 + 2; // Randomize speed (falling duration)

    meteor.style.left = `${startX}px`;
    meteor.style.animationDuration = `${duration}s`;
    meteor.style.animationDelay = `${delay}s`;

    // Append meteor to the background
    document.getElementById('meteorBackground').appendChild(meteor);

    // Remove meteor after animation ends
    setTimeout(() => {
        meteor.remove();
    }, (duration + delay) * 1000); // Remove meteor after it finishes falling
}

// Continuously generate meteors every 300ms
setInterval(generateMeteor, 300);

// Generate random particles
function generateParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    // Randomize position
    particle.style.left = Math.random() * window.innerWidth + 'px'; 
    particle.style.animationDelay = Math.random() * 5 + 's'; // Randomize delay

    document.body.appendChild(particle);

    // Remove particle after it disappears
    setTimeout(() => {
        particle.remove();
    }, 5000); // Match the animation duration
}

// Continuously generate particles every 300ms
setInterval(generateParticle, 300);
