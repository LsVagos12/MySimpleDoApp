// Mengambil referensi elemen HTML
const newTaskInput = document.getElementById("newTaskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

// Array untuk menyimpan tugas-tugas
let tasks = [];

// Fungsi untuk menyimpan tugas ke localStorage
function saveTasks() {
  localStorage.setItem("mySimpleDoTasks", JSON.stringify(tasks));
}

// Fungsi untuk memuat tugas dari localStorage
function loadTasks() {
  const storedTasks = localStorage.getItem("mySimpleDoTasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
  displayTasks(); // Tampilkan tugas setelah dimuat
}

// Fungsi untuk menambahkan tugas baru
function addTask() {
  const taskDescription = newTaskInput.value.trim(); // Ambil nilai input dan hapus spasi di awal/akhir

  if (taskDescription !== "") {
    const newId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
    tasks.push({
      id: newId,
      description: taskDescription,
      status: "pending", // Status awal adalah 'pending'
    });
    newTaskInput.value = ""; // Kosongkan input setelah ditambahkan
    saveTasks(); // Simpan tugas ke localStorage
    displayTasks(); // Perbarui tampilan daftar tugas
  } else {
    alert("Deskripsi tugas tidak boleh kosong!");
  }
}

// Fungsi untuk menampilkan (me-render) semua tugas ke HTML
function displayTasks() {
  taskList.innerHTML = ""; // Kosongkan daftar yang ada sebelum me-render ulang

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.dataset.id = task.id; // Menyimpan ID tugas sebagai atribut data

    if (task.status === "completed") {
      listItem.classList.add("completed"); // Tambahkan kelas 'completed' jika tugas selesai
    }

    const taskText = document.createElement("span");
    taskText.textContent = task.description;
    listItem.appendChild(taskText);

    const buttonContainer = document.createElement("div"); // Wadah untuk tombol

    // Tombol Mark Complete/Pending
    const completeButton = document.createElement("button");
    completeButton.classList.add("complete-btn");
    completeButton.textContent = task.status === "pending" ? "Selesai" : "Batal Selesai";
    completeButton.onclick = () => toggleTaskStatus(task.id); // Panggil fungsi toggle status
    buttonContainer.appendChild(completeButton);

    // Tombol Hapus
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.textContent = "Hapus";
    deleteButton.onclick = () => deleteTask(task.id); // Panggil fungsi hapus tugas
    buttonContainer.appendChild(deleteButton);

    listItem.appendChild(buttonContainer); // Tambahkan wadah tombol ke item daftar
    taskList.appendChild(listItem); // Tambahkan item daftar ke daftar tugas utama
  });
}

// Fungsi untuk mengubah status tugas (selesai/belum selesai)
function toggleTaskStatus(id) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex > -1) {
    tasks[taskIndex].status = tasks[taskIndex].status === "pending" ? "completed" : "pending";
    saveTasks(); // Simpan perubahan status
    displayTasks(); // Perbarui tampilan
  }
}

// Fungsi untuk menghapus tugas
function deleteTask(id) {
  // Filter array tasks, hanya menyisakan tugas yang ID-nya tidak sama dengan ID yang akan dihapus
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks(); // Simpan perubahan setelah penghapusan
  displayTasks(); // Perbarui tampilan
}

// Event Listeners
// Saat tombol 'Tambah Tugas' diklik
addTaskButton.addEventListener("click", addTask);

// Saat tombol Enter ditekan di input tugas
newTaskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

// Muat tugas saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", loadTasks);
