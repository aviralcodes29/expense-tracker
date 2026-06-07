const form = document.getElementById("transactionForm");
const editIdInput = document.getElementById("editId");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionList = document.getElementById("transactionList");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterType = document.getElementById("filterType");
const themeToggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

if (darkMode) {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("darkMode", JSON.stringify(isDark));
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;
  const editId = editIdInput.value;

  if (!text || isNaN(amount) || amount <= 0 || !type || !category || !date) {
    alert("Please fill all fields correctly.");
    return;
  }

  const transaction = {
    id: editId ? Number(editId) : Date.now(),
    text,
    amount,
    type,
    category,
    date
  };

  if (editId) {
    transactions = transactions.map(item =>
      item.id === Number(editId) ? transaction : item
    );
    editIdInput.value = "";
  } else {
    transactions.push(transaction);
  }

  saveTransactions();
  form.reset();
  updateUI();
});

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveTransactions();
  updateUI();
}

function editTransaction(id) {
  const transaction = transactions.find(item => item.id === id);
  if (!transaction) return;

  editIdInput.value = transaction.id;
  textInput.value = transaction.text;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  categoryInput.value = transaction.category;
  dateInput.value = transaction.date;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function getFilteredTransactions() {
  const searchValue = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterCategory.value;
  const selectedType = filterType.value;

  return transactions.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchValue);
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesType = selectedType === "All" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });
}

function updateUI() {
  const filteredTransactions = getFilteredTransactions();

  const totalIncome = transactions
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  balanceEl.textContent = `₹${balance.toFixed(2)}`;
  incomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
  expenseEl.textContent = `₹${totalExpense.toFixed(2)}`;

  transactionList.innerHTML = "";

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `<li class="empty-state">No transactions found.</li>`;
    return;
  }

  filteredTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(item => {
      const li = document.createElement("li");
      li.className = `transaction-item ${item.type === "income" ? "income-item" : "expense-item"}`;

      li.innerHTML = `
        <div class="transaction-left">
          <h4>${item.text}</h4>
          <p>${item.category} • ${item.type} • ${item.date}</p>
        </div>
        <div class="transaction-right">
          <span class="amount ${item.type === "income" ? "income-text" : "expense-text"}">
            ${item.type === "income" ? "+" : "-"}₹${item.amount.toFixed(2)}
          </span>
          <button class="action-btn edit-btn" onclick="editTransaction(${item.id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTransaction(${item.id})">Delete</button>
        </div>
      `;

      transactionList.appendChild(li);
    });
}

searchInput.addEventListener("input", updateUI);
filterCategory.addEventListener("change", updateUI);
filterType.addEventListener("change", updateUI);

updateUI();