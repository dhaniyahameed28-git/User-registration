
const userForm = document.getElementById("userForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const ageInput = document.getElementById("age");
const cityInput = document.getElementById("city");
const termsInput = document.getElementById("terms");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const ageError = document.getElementById("ageError");
const cityError = document.getElementById("cityError");
const genderError = document.getElementById("genderError");
const termsError = document.getElementById("termsError");

const formMessage = document.getElementById("formMessage");

const genderGroup = document.querySelector('input[name="gender"]').closest(".form-group");
const termsGroup = termsInput.closest(".form-group");

function showStatus(element, errorElement, isValid, message) {

    element.classList.remove("valid", "invalid");

    if (isValid) {
        element.classList.add("valid");
        errorElement.textContent = "";
    } else {
        element.classList.add("invalid");
        errorElement.textContent = message;
    }
}

function validateName() {

    const name = nameInput.value.trim();

    const namePattern = /^[A-Za-z ]{3,50}$/;

    const isValid = namePattern.test(name);

    showStatus(
        nameInput,
        nameError,
        isValid,
        "Enter a valid name (3–50 letters)"
    );

    return isValid;
}

function validateEmail() {

    const email = emailInput.value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValid = emailPattern.test(email);

    showStatus(
        emailInput,
        emailError,
        isValid,
        "Enter a valid email address"
    );

    return isValid;
}

function validatePhone() {

    const phone = phoneInput.value.trim();

    const phonePattern = /^[6-9]\d{9}$/;

    const isValid = phonePattern.test(phone);

    showStatus(
        phoneInput,
        phoneError,
        isValid,
        "Enter a valid 10-digit mobile number"
    );

    return isValid;
}

function validateAge() {

    const age = ageInput.value.trim();

    const isValid =
        age !== "" &&
        Number.isInteger(Number(age)) &&
        Number(age) >= 18 &&
        Number(age) <= 99;

    showStatus(
        ageInput,
        ageError,
        isValid,
        "Age must be between 18 and 99"
    );

    return isValid;
}

function validateCity() {

    const city = cityInput.value.trim();

    const isValid = city !== "";

    showStatus(
        cityInput,
        cityError,
        isValid,
        "Please select a city"
    );

    return isValid;
}

function validateGender() {

    const selectedGender =
        document.querySelector('input[name="gender"]:checked');

    const isValid = selectedGender !== null;

    showStatus(
        genderGroup,
        genderError,
        isValid,
        "Please select a gender"
    );

    return isValid;
}

function validateTerms() {

    const isValid = termsInput.checked;

    showStatus(
        termsGroup,
        termsError,
        isValid,
        "You must accept the terms"
    );

    return isValid;
}

function validateForm() {

    const results = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validateAge(),
        validateCity(),
        validateGender(),
        validateTerms()
    ];

    return results.every(Boolean);
}

nameInput.addEventListener("input", validateName);
nameInput.addEventListener("blur", validateName);

emailInput.addEventListener("input", validateEmail);
emailInput.addEventListener("blur", validateEmail);

phoneInput.addEventListener("input", validatePhone);
phoneInput.addEventListener("blur", validatePhone);

ageInput.addEventListener("input", validateAge);
ageInput.addEventListener("blur", validateAge);

cityInput.addEventListener("change", validateCity);
cityInput.addEventListener("blur", validateCity);

document.querySelectorAll('input[name="gender"]').forEach(function (radio) {
    radio.addEventListener("change", validateGender);
});

termsInput.addEventListener("change", validateTerms);

async function saveUser(event) {

    event.preventDefault();

    if (!validateForm()) {
        formMessage.textContent = "Please correct the errors above.";
        formMessage.style.color = "red";
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/users");

        if (!response.ok) {
            throw new Error("Unable to load users");
        }

        const users = await response.json();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();

        // Duplicate email check
        const duplicateEmail = users.some(function(user) {
            return user.email.toLowerCase() === email;
        });

        if (duplicateEmail) {
            showStatus(emailInput, emailError, false,
                "This email already exists");

            formMessage.textContent = "Email already registered!";
            formMessage.style.color = "red";
            return;
        }

        const selectedGender = document.querySelector(
            'input[name="gender"]:checked'
        ).value;

        const user = {
            id: Date.now().toString(),
            name: name,
            email: email,
            phone: phoneInput.value.trim(),
            age: Number(ageInput.value),
            city: cityInput.value,
            gender: selectedGender,
            createdAt: new Date().toISOString()
        };

        const saveResponse = await fetch(
            "http://localhost:3000/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            }
        );

        if (!saveResponse.ok) {
            throw new Error("Unable to save user");
        }

        formMessage.textContent = "User saved successfully!";
        formMessage.style.color = "green";
        await loadUsers(true);

        userForm.reset();

        userForm.querySelectorAll(".valid, .invalid")
            .forEach(function(element) {
                element.classList.remove("valid", "invalid");
            });

        document.querySelectorAll("small").forEach(function(element) {
            element.textContent = "";
        });

    } catch (error) {

        formMessage.textContent =
            "Server error! Please check JSON Server.";

        formMessage.style.color = "red";
        console.error(error);
    }
}

userForm.addEventListener("submit", saveUser);

// Store all users received from API
let usersData = [];

let currentPage = 1;
let pageSize = 5;

const userTableBody = document.getElementById("userTableBody");
const pageSizeSelect = document.getElementById("pageSize");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("pageNumbers");
const paginationInfo = document.getElementById("paginationInfo");

const API_URL = "http://localhost:3000/users";

async function loadUsers(showLastPage = false) {

    userTableBody.innerHTML = `
        <tr>
            <td colspan="8">Loading...</td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        usersData = await response.json();

        const totalPages = Math.ceil(usersData.length / pageSize);

        if (showLastPage) {
            currentPage = Math.max(1, totalPages);
        } else {
            currentPage = Math.min(
                currentPage,
                Math.max(1, totalPages)
            );
        }

        renderTable();
        renderPagination();

    } catch (error) {

        console.error(error);

        userTableBody.innerHTML = `
            <tr>
                <td colspan="8">Unable to load users</td>
            </tr>
        `;
    }
}


function renderTable() {

    userTableBody.innerHTML = "";

    if (usersData.length === 0) {

        userTableBody.innerHTML = `
            <tr>
                <td colspan="8">No records found</td>
            </tr>
        `;

        return;
    }

    const start = (currentPage - 1) * pageSize;

    const end = start + pageSize;

    const paginatedUsers = usersData.slice(start, end);

    paginatedUsers.forEach(function(user, index) {

        const row = document.createElement("tr");

        const values = [
            start + index + 1,
            user.name,
            user.email,
            user.phone,
            user.age,
            user.city,
            user.gender
        ];

        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "";

            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.classList.add("delete-btn");

        deleteButton.addEventListener("click", function() {
            deleteUser(user.id);
        });

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        userTableBody.appendChild(row);

    });

}


async function deleteUser(id) {

    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        alert("User deleted successfully!");

        await loadUsers();

    } catch (error) {

        console.error(error);

        alert("Unable to delete user.");

    }
}

function renderPagination() {

    const totalPages = Math.ceil(usersData.length / pageSize) || 1;

    pageNumbers.innerHTML = "";

    prevBtn.disabled = currentPage === 1;

    nextBtn.disabled = currentPage === totalPages;

    for (let i = 1; i <= totalPages; i++) {

        const button = document.createElement("button");

        button.textContent = i;

        if (i === currentPage) {
            button.classList.add("active");
        }

        button.addEventListener("click", function() {

            currentPage = i;

            renderTable();

            renderPagination();

        });

        pageNumbers.appendChild(button);
    }

    const start = usersData.length === 0
        ? 0
        : (currentPage - 1) * pageSize + 1;

    const end = Math.min(
        currentPage * pageSize,
        usersData.length
    );

    paginationInfo.textContent =
        `Showing ${start}–${end} of ${usersData.length} users`;

}

prevBtn.addEventListener("click", function() {

    if (currentPage > 1) {

        currentPage--;

        renderTable();

        renderPagination();
    }

});


nextBtn.addEventListener("click", function() {

    const totalPages = Math.ceil(usersData.length / pageSize);

    if (currentPage < totalPages) {

        currentPage++;

        renderTable();

        renderPagination();
    }

});


pageSizeSelect.addEventListener("change", function() {

    pageSize = Number(pageSizeSelect.value);

    currentPage = 1;

    renderTable();

    renderPagination();

});


loadUsers();


const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", function() {

    if (usersData.length === 0) {
        alert("No users available to download!");
        return;
    }

    const jsonData = JSON.stringify(usersData, null, 2);

    // Create Blob
    const blob = new Blob(
        [jsonData],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "users.json";

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);

});
