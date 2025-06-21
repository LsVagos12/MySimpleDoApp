const newTaskInput = document.getElementById('newTaskInput');
const newDueDateInput = document.getElementById('newDueDate');
const newPriorityInput = document.getElementById('newPriority');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const searchTaskInput = document.getElementById('searchTaskInput');

const filterAllButton = document.getElementById('filterAll');
const filterPendingButton = document.getElementById('filterPending');
const filterCompletedButton = document.getElementById('filterCompleted');
const filterTodayButton = document.getElementById('filterToday');
const filterUpcomingButton = document.getElementById('filterUpcoming');

const sortBySelect = document.getElementById('sortBy'); // NEW
const langIdButton = document.getElementById('lang-id');
const langEnButton = document.getElementById('lang-en');

const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
let taskIdToDelete = null;

const themeDots = document.querySelectorAll('.theme-dot');
const muteButton = document.getElementById('muteButton'); // NEW
const emptyListMessage = document.getElementById('emptyListMessage'); // NEW


let tasks = [];
let currentFilter = 'all';
let currentSort = 'none';
let currentLang = 'id';
let currentTheme = 'rainbow';
let isMuted = false; // NEW


// --- Sound Effects (NEW) ---
const sounds = {
    add: new Audio('https://www.soundjay.com/buttons/button-1.mp3'), // Contoh suara
    complete: new Audio('https://www.soundjay.com/buttons/button-2.mp3'), // Contoh suara
    delete: new Audio('https://www.soundjay.com/buttons/button-3.mp3') // Contoh suara
};

function playSound(type) {
    if (!isMuted && sounds[type]) {
        sounds[type].currentTime = 0; // Reset if already playing
        sounds[type].play().catch(e => console.error("Error playing sound:", e));
    }
}


// --- Objek Terjemahan ---
const translations = {
    id: {
        appName: "MySimpleDo",
        appSubtitle: "Aplikasi Daftar Tugas Sederhana",
        searchPlaceholder: "Cari tugas...",
        filterAll: "Semua",
        filterPending: "Belum Selesai",
        filterCompleted: "Selesai",
        filterToday: "Hari Ini",
        filterUpcoming: "Mendatang",
        addTaskPlaceholder: "Tambahkan tugas baru...",
        addTaskButton: "Tambah Tugas",
        priorityLow: "Prioritas Rendah",
        priorityMedium: "Prioritas Sedang",
        priorityHigh: "Prioritas Tinggi",
        tasksCount: "Tugas: ",
        completeButton: "Selesai",
        undoButton: "Batal Selesai",
        editButton: "Edit",
        deleteButton: "Hapus",
        saveButton: "Simpan",
        cancelButton: "Batal",
        priorityDisplayLow: "Rendah",
        priorityDisplayMedium: "Sedang",
        priorityDisplayHigh: "Tinggi",
        taskDescriptionEmpty: "Deskripsi tugas tidak boleh kosong!",
        sortNone: "Urutkan Berdasarkan",
        sortDueDateAsc: "Jatuh Tempo (Naik)",
        sortDueDateDesc: "Jatuh Tempo (Turun)",
        sortPriorityHigh: "Prioritas (Tinggi ke Rendah)",
        sortPriorityLow: "Prioritas (Rendah ke Tinggi)",
        sortCreatedAtDesc: "Terbaru Dibuat",
        sortCreatedAtAsc: "Terlama Dibuat",
        confirmDeleteMsg: "Apakah Anda yakin ingin menghapus tugas ini?",
        yesButton: "Ya",
        noButton: "Tidak",
        chooseTheme: "Pilih Tema:",
        emptyListMsg: "Tidak ada tugas di sini. Tambahkan satu!" // NEW
    },
    en: {
        appName: "MySimpleDo",
        appSubtitle: "Simple To-Do List App",
        searchPlaceholder: "Search tasks...",
        filterAll: "All",
        filterPending: "Pending",
        filterCompleted: "Completed",
        filterToday: "Today",
        filterUpcoming: "Upcoming",
        addTaskPlaceholder: "Add new task...",
        addTaskButton: "Add Task",
        priorityLow: "Low Priority",
        priorityMedium: "Medium Priority",
        priorityHigh: "High Priority",
        tasksCount: "Tasks: ",
        completeButton: "Complete",
        undoButton: "Undo",
        editButton: "Edit",
        deleteButton: "Delete",
        saveButton: "Save",
        cancelButton: "Cancel",
        priorityDisplayLow: "Low",
        priorityDisplayMedium: "Medium",
        priorityDisplayHigh: "High",
        taskDescriptionEmpty: "Task description cannot be empty!",
        sortNone: "Sort By",
        sortDueDateAsc: "Due Date (Asc)",
        sortDueDateDesc: "Due Date (Desc)",
        sortPriorityHigh: "Priority (High to Low)",
        sortPriorityLow: "Priority (Low to High)",
        sortCreatedAtDesc: "Newest First",
        sortCreatedAtAsc: "Oldest First",
        confirmDeleteMsg: "Are you sure you want to delete this task?",
        yesButton: "Yes",
        noButton: "No",
        chooseTheme: "Choose Theme:",
        emptyListMsg: "No tasks here. Add one!" // NEW
    }
};

// --- Fungsi Penerjemah ---
function translatePage() {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.dataset.key;
        if (translations[currentLang] && translations[currentLang][key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = translations[currentLang][key];
            } else if (element.tagName === 'OPTION') {
                element.textContent = translations[currentLang][key];
            }
            else {
                element.textContent = translations[currentLang][key];
            }
        }
    });
    updateBadge();
    displayTasks(); // Render ulang tugas untuk update tombol/teks di dalamnya
}

// --- Fungsi Tema ---
function applyTheme(theme) {
    const body = document.body;
    
    body.classList.remove('theme-rainbow', 'theme-blue', 'theme-green', 'theme-dark');
    
    if (theme !== 'rainbow') {
        body.classList.add(`theme-${theme}`);
    }

    themeDots.forEach(dot => {
        if (dot.dataset.theme === theme) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    currentTheme = theme;
    localStorage.setItem('mySimpleDoTheme', theme);
}


// --- Fungsi Utama Aplikasi ---

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
    
    // Muat bahasa dan tema sebelum menerjemahkan dan menampilkan
    const savedLang = localStorage.getItem('mySimpleDoLang');
    if (savedLang) {
        currentLang = savedLang;
        document.querySelector(`.lang-btn[data-lang="${currentLang}"]`).classList.add('active');
        document.querySelector(`.lang-btn[data-lang="${currentLang === 'id' ? 'en' : 'id'}"]`).classList.remove('active');
    } else {
        langIdButton.classList.add('active');
    }

    const savedTheme = localStorage.getItem('mySimpleDoTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('rainbow');
    }

    const savedMuteStatus = localStorage.getItem('mySimpleDoMute'); // NEW
    if (savedMuteStatus !== null) {
        isMuted = JSON.parse(savedMuteStatus);
        updateMuteButtonIcon(); // Update icon
    }

    translatePage(); // Ini akan memanggil displayTasks()
}

// Menampilkan tugas ke browser
function displayTasks() {
    taskList.innerHTML = '';

    let filteredAndSortedTasks = [...tasks];

    // --- TERAPKAN FILTER SAAT DISPLAY ---
    filteredAndSortedTasks = filteredAndSortedTasks.filter(task => {
        const now = new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        
        if (currentFilter === 'all') {
            return true;
        } else if (currentFilter === 'pending') {
            return task.status === 'pending';
        } else if (currentFilter === 'completed') {
            return task.status === 'completed';
        } else if (currentFilter === 'today') {
            return task.status === 'pending' && dueDate && 
                   dueDate.getDate() === now.getDate() &&
                   dueDate.getMonth() === now.getMonth() &&
                   dueDate.getFullYear() === now.getFullYear();
        } else if (currentFilter === 'upcoming') {
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            return task.status === 'pending' && dueDate && 
                   dueDate > now && dueDate.getTime() - now.getTime() <= oneWeek;
        }
        return false;
    });


    // --- TERAPKAN SORTIR SAAT DISPLAY ---
    filteredAndSortedTasks.sort((a, b) => {
        if (currentSort === 'dueDateAsc') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (currentSort === 'dueDateDesc') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(b.dueDate) - new Date(a.dueDate);
        } else if (currentSort === 'priorityHigh') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (currentSort === 'priorityLow') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (currentSort === 'createdAtDesc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (currentSort === 'createdAtAsc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0; // No sort
    });


    filteredAndSortedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.dataset.id = task.id;
        listItem.classList.add(task.status === 'completed' ? 'completed' : 'pending');

        // Untuk animasi slide-in
        if (task.isNew) {
            listItem.classList.add('new-item-added');
            setTimeout(() => {
                listItem.classList.remove('new-item-added');
                task.isNew = false;
                saveTasks();
            }, 500);
        }

        // --- Deskripsi Tugas (Clickable for Edit) ---
        const taskDescriptionSpan = document.createElement('span');
        taskDescriptionSpan.classList.add('task-description');
        taskDescriptionSpan.textContent = task.description;
        taskDescriptionSpan.onclick = () => enableEditMode(task.id); // Clickable
        listItem.appendChild(taskDescriptionSpan);

        // --- Metadata Tugas (Tanggal, Prioritas, Due Date) ---
        const taskMetaDiv = document.createElement('div');
        taskMetaDiv.classList.add('task-meta');

        // Tanggal Dibuat (createdAt)
        if (task.createdAt) {
            const createdAtDate = new Date(task.createdAt);
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
            const formattedDate = createdAtDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', options);
            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('task-timestamp');
            timestampSpan.innerHTML = `<i class="far fa-calendar-alt"></i> ${formattedDate}`;
            taskMetaDiv.appendChild(timestampSpan);
        }

        // Prioritas
        if (task.priority) {
            const prioritySpan = document.createElement('span');
            prioritySpan.classList.add('task-priority', task.priority);
            let priorityIcon = '';
            let priorityTextKey = '';
            if (task.priority === 'high') { priorityIcon = 'fa-fire'; priorityTextKey = 'priorityDisplayHigh'; }
            else if (task.priority === 'medium') { priorityIcon = 'fa-exclamation-triangle'; priorityTextKey = 'priorityDisplayMedium'; }
            else { priorityIcon = 'fa-flag'; priorityTextKey = 'priorityDisplayLow'; }
            prioritySpan.innerHTML = `<i class="fas ${priorityIcon}"></i> ${translations[currentLang][priorityTextKey]}`;
            taskMetaDiv.appendChild(prioritySpan);
        }

        // Due Date
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now && task.status === 'pending';
            const dueSoon = dueDate > now && dueDate.getTime() - now.getTime() < (24 * 60 * 60 * 1000) && task.status === 'pending';
            
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
            const formattedDueDate = dueDate.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', options);
            const duedateSpan = document.createElement('span');
            duedateSpan.classList.add('task-duedate');
            duedateSpan.innerHTML = `<i class="far fa-clock"></i> ${formattedDueDate}`;
            
            if (isOverdue) duedateSpan.style.color = '#dc3545';
            else if (dueSoon) duedateSpan.style.color = '#ffc107';

            taskMetaDiv.appendChild(duedateSpan);
        }

        listItem.appendChild(taskMetaDiv);

        // --- Tombol Aksi (Selesai, Edit, Hapus) ---
        const taskActionsDiv = document.createElement('div');
        taskActionsDiv.classList.add('task-actions');

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete-btn');
        completeButton.innerHTML = task.status === 'pending' ? `<i class="fas fa-check"></i> ${translations[currentLang].completeButton}` : `<i class="fas fa-undo"></i> ${translations[currentLang].undoButton}`;
        completeButton.onclick = () => toggleTaskStatus(task.id);
        taskActionsDiv.appendChild(completeButton);

        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.innerHTML = `<i class="fas fa-edit"></i> ${translations[currentLang].editButton}`;
        editButton.onclick = () => enableEditMode(task.id);
        taskActionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i> ${translations[currentLang].deleteButton}`;
        deleteButton.onclick = () => showDeleteConfirm(task.id);
        taskActionsDiv.appendChild(deleteButton);

        listItem.appendChild(taskActionsDiv);
        taskList.appendChild(listItem);
    });

    updateBadge();
    checkEmptyListMessage(); // NEW
}

// Update jumlah tugas
function updateBadge() {
    const badge = document.getElementById('taskCountBadge');
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    badge.textContent = translations[currentLang].tasksCount + pendingTasks;
}

// Cek dan tampilkan pesan kosong (NEW)
function checkEmptyListMessage() {
    if (taskList.children.length === 0) {
        emptyListMessage.style.opacity = '1';
        emptyListMessage.style.display = 'flex';
    } else {
        emptyListMessage.style.opacity = '0';
        emptyListMessage.style.display = 'none';
    }
}


function addTask() {
    const description = newTaskInput.value.trim();
    const dueDate = newDueDateInput.value;
    const priority = newPriorityInput.value;

    if (description) {
        tasks.push({ 
            id: Date.now(), 
            description, 
            status: 'pending',
            createdAt: new Date().toISOString(),
            dueDate: dueDate || null,
            priority: priority,
            isNew: true
        });
        newTaskInput.value = '';
        newDueDateInput.value = '';
        newPriorityInput.value = 'medium';
        saveTasks();
        displayTasks();
        playSound('add'); // NEW
    } else {
        alert(translations[currentLang].taskDescriptionEmpty);
    }
}

function toggleTaskStatus(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        const isCurrentlyPending = task.status === 'pending';
        task.status = isCurrentlyPending ? 'completed' : 'pending';
        
        // Animasi Confetti saat tugas selesai (NEW)
        if (isCurrentlyPending) { // Hanya jika baru saja diselesaikan
            const listItem = document.querySelector(`li[data-id="${id}"]`);
            if (listItem) {
                listItem.classList.add('confetti-animation-active'); // Add class
                for (let i = 0; i < 30; i++) { // Generate 30 confetti pieces
                    const confetti = document.createElement('div');
                    confetti.classList.add('confetti-piece');
                    confetti.style.left = `${Math.random() * 100}%`;
                    confetti.style.top = `${Math.random() * 100}%`; // Random vertical position too
                    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
                    listItem.appendChild(confetti);
                }
                setTimeout(() => {
                    listItem.classList.remove('confetti-animation-active');
                    listItem.querySelectorAll('.confetti-piece').forEach(c => c.remove());
                }, 1000); // Remove after animation
            }
            playSound('complete'); // NEW
        }


        saveTasks();
        displayTasks();
    }
}

// --- Konfirmasi Hapus Fungsi ---
function showDeleteConfirm(id) {
    taskIdToDelete = id;
    deleteConfirmModal.style.display = 'flex';
}

function hideDeleteConfirm() {
    deleteConfirmModal.style.display = 'none';
    taskIdToDelete = null;
}

confirmDeleteBtn.addEventListener('click', () => {
    if (taskIdToDelete !== null) {
        deleteTaskConfirmed(taskIdToDelete);
    }
    hideDeleteConfirm();
});

cancelDeleteBtn.addEventListener('click', () => {
    hideDeleteConfirm();
});

function deleteTaskConfirmed(id) {
    const taskItem = document.querySelector(`li[data-id="${id}"]`);
    if (taskItem) {
        taskItem.classList.add('removing');
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            displayTasks();
            playSound('delete'); // NEW
        }, 400);
    }
}

// --- Edit Mode Functions ---
function enableEditMode(id) {
    const listItem = document.querySelector(`li[data-id="${id}"]`);
    const task = tasks.find(t => t.id === id);

    if (listItem && task) {
        const taskDescriptionSpan = listItem.querySelector('.task-description');
        const taskActionsDiv = listItem.querySelector('.task-actions');
        
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.classList.add('edit-input');
        editInput.value = task.description;
        
        // Ganti span deskripsi dengan input field
        // taskDescriptionSpan akan dihapus, jadi simpan referensi parent untuk mengganti anak
        const parentOfDescription = taskDescriptionSpan.parentNode;
        parentOfDescription.replaceChild(editInput, taskDescriptionSpan);
        editInput.focus();

        taskActionsDiv.style.display = 'none'; // Sembunyikan tombol normal

        // Buat tombol Save dan Cancel
        const saveButton = document.createElement('button');
        saveButton.classList.add('save-edit-btn');
        saveButton.innerHTML = `<i class="fas fa-save"></i> ${translations[currentLang].saveButton}`; // Add icon
        saveButton.onclick = () => saveEdit(id, editInput.value);

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('cancel-edit-btn');
        cancelButton.innerHTML = `<i class="fas fa-times"></i> ${translations[currentLang].cancelButton}`; // Add icon
        cancelButton.onclick = () => cancelEdit(id, task.description);

        const editActionsDiv = document.createElement('div');
        editActionsDiv.classList.add('task-actions');
        editActionsDiv.id = `edit-actions-${id}`;
        editActionsDiv.appendChild(saveButton);
        editActionsDiv.appendChild(cancelButton);

        listItem.appendChild(editActionsDiv);
    }
}

function saveEdit(id, newDescription) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.description = newDescription.trim();
        saveTasks();
        displayTasks();
    }
}

function cancelEdit(id, originalDescription) {
    displayTasks();
}

// --- Filter Tasks Functions ---
// Event listener untuk tombol filter
filterAllButton.addEventListener('click', () => { currentFilter = 'all'; displayTasks(); });
filterPendingButton.addEventListener('click', () => { currentFilter = 'pending'; displayTasks(); });
filterCompletedButton.addEventListener('click', () => { currentFilter = 'completed'; displayTasks(); });
filterTodayButton.addEventListener('click', () => { currentFilter = 'today'; displayTasks(); });
filterUpcomingButton.addEventListener('click', () => { currentFilter = 'upcoming'; displayTasks(); });

// --- Sort Tasks Functions ---
sortBySelect.addEventListener('change', function() {
    currentSort = this.value;
    displayTasks();
});


// --- Search Tasks Function ---
searchTaskInput.addEventListener('keyup', function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.task-list li').forEach(listItem => {
        const descriptionText = listItem.querySelector('.task-description').textContent.toLowerCase();
        
        const status = listItem.classList.contains('completed') ? 'completed' : 'pending';
        let shouldBeDisplayedByFilter = false;
        if (currentFilter === 'all') {
            shouldBeDisplayedByFilter = true;
        } else if (currentFilter === 'pending') {
            shouldBeDisplayedByFilter = task.status === 'pending'; // Access actual task status
        } else if (currentFilter === 'completed') {
            shouldBeDisplayedByFilter = task.status === 'completed'; // Access actual task status
        } else if (currentFilter === 'today') { // NEW: Handle today filter
            const task = tasks.find(t => t.id == listItem.dataset.id); // Get the actual task object
            const now = new Date();
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            shouldBeDisplayedByFilter = task.status === 'pending' && dueDate && 
                   dueDate.getDate() === now.getDate() &&
                   dueDate.getMonth() === now.getMonth() &&
                   dueDate.getFullYear() === now.getFullYear();
        } else if (currentFilter === 'upcoming') { // NEW: Handle upcoming filter
            const task = tasks.find(t => t.id == listItem.dataset.id); // Get the actual task object
            const now = new Date();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            shouldBeDisplayedByFilter = task.status === 'pending' && dueDate && 
                   dueDate > now && dueDate.getTime() - now.getTime() <= oneWeek;
        }

        if (descriptionText.includes(query) && shouldBeDisplayedByFilter) {
             listItem.style.display = 'flex';
        } else {
            listItem.style.display = 'none';
        }
    });
});


// --- Global Event Listeners ---
addTaskButton.addEventListener('click', addTask);
newTaskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

langIdButton.addEventListener('click', () => {
    currentLang = 'id';
    localStorage.setItem('mySimpleDoLang', 'id');
    langIdButton.classList.add('active');
    langEnButton.classList.remove('active');
    translatePage();
});

langEnButton.addEventListener('click', () => {
    currentLang = 'en';
    localStorage.setItem('mySimpleDoLang', 'en');
    langEnButton.classList.add('active');
    langIdButton.classList.remove('active');
    translatePage();
});

// Event listener untuk pemilih tema
themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
        applyTheme(dot.dataset.theme);
    });
});

// Mute button functionality (NEW)
muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('mySimpleDoMute', isMuted);
    updateMuteButtonIcon();
});

function updateMuteButtonIcon() {
    if (isMuted) {
        muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Muat tugas saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', loadTasks);