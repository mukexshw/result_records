/*
 Student Result Management System
 The subject lists below are examples.
 Replace them with your college's official syllabus.
*/

const SUBJECTS_BY_COURSE = {
    BCA: {
        1: ["Computer Fundamentals", "Programming in C", "Mathematics", "Digital Electronics", "English"],
        2: ["C Programming", "Data Structures", "Database Fundamentals", "Operating Systems", "Communication Skills"],
        3: ["Object-Oriented Programming with C++", "Computer Networks", "Web Technologies", "Software Engineering", "Mathematics"],
        4: ["Java Programming", "Database Management Systems", "Computer Architecture", "Python Programming", "Environmental Studies"],
        5: ["Computer Graphics", "Artificial Intelligence", "PHP and Web Development", "Cyber Security", "Elective"],
        6: ["Project Work", "Cloud Computing", "Data Analytics", "Mobile Application Development", "Elective"]
    },

    BBA: {
        1: ["Principles of Management", "Business Communication", "Financial Accounting", "Business Mathematics", "Microeconomics"],
        2: ["Organizational Behaviour", "Marketing Management", "Business Statistics", "Macroeconomics", "Business Law"],
        3: ["Human Resource Management", "Cost Accounting", "Business Research Methods", "Business Environment", "Entrepreneurship"],
        4: ["Financial Management", "Operations Management", "Consumer Behaviour", "Management Information Systems", "Business Taxation"],
        5: ["Strategic Management", "International Business", "Advertising Management", "Project Management", "Elective"],
        6: ["Business Ethics", "Startup Management", "Business Analytics", "Project Work", "Elective"]
    },

    "B.Com": {
        1: ["Financial Accounting", "Business Law", "Business Economics", "Business Communication", "Business Mathematics"],
        2: ["Corporate Accounting", "Business Statistics", "Company Law", "Cost Accounting", "Environmental Studies"],
        3: ["Income Tax", "Auditing", "Corporate Law", "Financial Management", "Computer Applications"],
        4: ["GST and Indirect Tax", "Management Accounting", "Marketing Management", "Banking and Insurance", "Business Research"],
        5: ["Advanced Accounting", "E-Commerce", "Human Resource Management", "Entrepreneurship", "Elective"],
        6: ["Financial Markets", "International Business", "Investment Management", "Project Work", "Elective"]
    },

    BA: {
        1: ["English", "History", "Political Science", "Sociology", "Environmental Studies"],
        2: ["English", "History", "Political Science", "Economics", "Communication Skills"],
        3: ["English", "History", "Sociology", "Psychology", "Elective"],
        4: ["Political Science", "Economics", "History", "Public Administration", "Elective"],
        5: ["Literature", "Sociology", "Political Science", "Research Methods", "Elective"],
        6: ["Modern History", "Social Issues", "Political Theory", "Project Work", "Elective"]
    },

    "B.Sc": {
        1: ["Physics", "Chemistry", "Mathematics", "Computer Fundamentals", "English"],
        2: ["Physics", "Chemistry", "Mathematics", "Programming Fundamentals", "Environmental Studies"],
        3: ["Electronics", "Statistics", "Computer Programming", "Mathematics", "Elective"],
        4: ["Data Structures", "Operating Systems", "Electronics", "Mathematics", "Elective"],
        5: ["Database Systems", "Computer Networks", "Applied Mathematics", "Practical", "Elective"],
        6: ["Project Work", "Data Analysis", "Advanced Computing", "Practical", "Elective"]
    },

    MCA: {
        1: ["Advanced Programming", "Data Structures", "Database Systems", "Computer Networks", "Discrete Mathematics"],
        2: ["Java Programming", "Operating Systems", "Software Engineering", "Web Technologies", "Data Analytics"],
        3: ["Artificial Intelligence", "Cloud Computing", "Cyber Security", "Machine Learning", "Elective"],
        4: ["Project Work", "Industry Internship", "Advanced Elective", "Seminar", "Practical"]
    }
};

const PASS_MARK_PER_SUBJECT = 33;
const STORAGE_KEY = "srms_records";

let currentResult = null;
let editingId = null;
let records = loadRecords();

const $ = id => document.getElementById(id);


// Load records saved in this browser.
function loadRecords() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn("Could not read saved records:", error);
        return [];
    }
}


// Save records in browser storage.
function saveRecords() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(records)
        );

        return true;
    } catch (error) {
        alert("Could not save records. Check browser storage.");
        return false;
    }
}


// Convert "1st Semester" into the number 1.
function semesterNumber(value) {
    const match = String(value || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
}


// Get subjects based on selected course and semester.
function getSelectedSubjects() {
    const course = $("course").value;
    const semester = semesterNumber($("semester").value);

    return (
        SUBJECTS_BY_COURSE[course] &&
        SUBJECTS_BY_COURSE[course][semester]
    ) || [];
}


// Give every subject input a unique ID.
function subjectKey(name, index) {
    return `subject_${index}`;
}


// Generate subject input fields dynamically.
function renderSubjectInputs(previousMarks = {}) {
    const container = $("subjectsContainer");
    const selectedSubjects = getSelectedSubjects();

    container.replaceChildren();

    selectedSubjects.forEach((name, index) => {
        const field = document.createElement("div");
        field.className = "field";

        const label = document.createElement("label");
        const id = subjectKey(name, index);

        label.htmlFor = id;
        label.textContent = name;

        const input = document.createElement("input");
        input.type = "number";
        input.id = id;
        input.name = id;
        input.min = "0";
        input.max = "100";
        input.step = "1";
        input.required = true;
        input.inputMode = "numeric";
        input.placeholder = "0–100";
        input.setAttribute(
            "aria-label",
            `${name} marks out of 100`
        );

        const previous = previousMarks[name];

        if (previous !== undefined && previous !== null) {
            input.value = previous;
        }

        field.append(label, input);
        container.appendChild(field);
    });

    $("subjectCount").textContent =
        `${selectedSubjects.length} subject${selectedSubjects.length === 1 ? "" : "s"}`;

    $("maximumMarks").textContent =
        selectedSubjects.length * 100;

    $("marksDescription").textContent =
        `Step 2 of 3 — ${$("course").value}, ${$("semester").value}: enter marks out of 100`;
}


// Show a particular step of the form.
function showPage(number) {
    document.querySelectorAll(".form-page").forEach(page => {
        page.classList.remove("active");
    });

    const page = $("page" + number);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".progress-step").forEach(
        (step, index) => {
            step.classList.toggle("active", index < number);
        }
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Validate required fields and marks.
function validatePage(pageNumber) {
    const page = $("page" + pageNumber);

    for (const input of page.querySelectorAll("input, select")) {
        if (!input.checkValidity()) {
            input.reportValidity();
            input.focus();
            return false;
        }

        if (input.type === "number") {
            const value = input.value.trim();

            if (
                value === "" ||
                !Number.isFinite(Number(value)) ||
                Number(value) < 0 ||
                Number(value) > 100
            ) {
                input.setCustomValidity(
                    "Enter a mark between 0 and 100."
                );

                input.reportValidity();
                input.setCustomValidity("");
                input.focus();

                return false;
            }

            if (!Number.isInteger(Number(value))) {
                input.setCustomValidity(
                    "Enter whole-number marks."
                );

                input.reportValidity();
                input.setCustomValidity("");
                input.focus();

                return false;
            }
        }
    }

    return true;
}


// Move from student details to marks entry.
function goToMarks() {
    if (!validatePage(1)) return;

    const subjectList = getSelectedSubjects();

    if (!subjectList.length) {
        alert("Please select a valid course and semester.");
        return;
    }

    // Preserve marks already entered for the same subjects.
    const previousMarks = {};

    subjectList.forEach((name, index) => {
        const input = $(subjectKey(name, index));

        if (input && input.value !== "") {
            previousMarks[name] = input.value;
        }
    });

    renderSubjectInputs(previousMarks);
    showPage(2);
}


// Collect student information.
function getStudentDetails() {
    return {
        name: $("studentName").value.trim(),
        rollNo: $("rollNo").value.trim(),
        course: $("course").value,
        semester: $("semester").value,
        department: $("department").value.trim(),
        session: $("session").value.trim()
    };
}


// Calculate total, percentage, grade and result.
function calculateResult() {
    const selectedSubjects = getSelectedSubjects();

    if (!selectedSubjects.length) {
        alert("No subjects are configured for this course and semester.");
        return null;
    }

    const marks = {};

    for (
        let index = 0;
        index < selectedSubjects.length;
        index++
    ) {
        const name = selectedSubjects[index];
        const input = $(subjectKey(name, index));

        if (!input || input.value.trim() === "") {
            if (input) {
                input.reportValidity();
                input.focus();
            }

            return null;
        }

        const value = Number(input.value);

        if (
            !Number.isInteger(value) ||
            value < 0 ||
            value > 100
        ) {
            alert(
                `Enter a whole-number mark from 0 to 100 for ${name}.`
            );

            input.focus();
            return null;
        }

        marks[name] = value;
    }

    const values = Object.values(marks);

    const total = values.reduce(
        (sum, value) => sum + value,
        0
    );

    const maximum = selectedSubjects.length * 100;

    const percentage = Number(
        ((total / maximum) * 100).toFixed(2)
    );

    // Every subject must meet the pass mark.
    const passed = values.every(
        value => value >= PASS_MARK_PER_SUBJECT
    );

    let grade;

    if (!passed) grade = "F";
    else if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "E";

    return {
        marks,
        subjectNames: selectedSubjects.slice(),
        total,
        maximum,
        percentage,
        grade,
        status: passed ? "PASS" : "FAIL"
    };
}


// Generate the academic result.
function generateResult() {
    if (!validatePage(1)) {
        showPage(1);
        return;
    }

    if (!validatePage(2)) return;

    const result = calculateResult();

    if (!result) return;

    currentResult = {
        ...getStudentDetails(),
        ...result
    };

    renderResult(currentResult);
    showPage(3);
}


// Display the result safely on the page.
function renderResult(student) {
    const card = $("resultCard");
    card.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Student Marksheet";
    card.appendChild(heading);

    const details = document.createElement("div");
    details.className = "result-details";

    const subjectNames =
        student.subjectNames ||
        Object.keys(student.marks || {});

    const items = [
        ["Student Name", student.name],
        ["Roll Number", student.rollNo],
        ["Course", student.course],
        ["Semester", student.semester],
        ["Department", student.department],
        ["Academic Session", student.session],

        ...subjectNames.map(name => [
            name,
            `${student.marks[name]} / 100`
        ]),

        [
            "Total Marks",
            `${student.total} / ${student.maximum}`
        ],
        ["Percentage", `${student.percentage}%`],
        ["Grade", student.grade]
    ];

    items.forEach(([label, value]) => {
        const item = document.createElement("div");
        item.className = "result-item";

        const small = document.createElement("small");
        small.textContent = label;

        const strong = document.createElement("strong");
        strong.textContent = value ?? "";

        item.append(small, strong);
        details.appendChild(item);
    });

    card.appendChild(details);

    const status = document.createElement("span");

    status.className =
        `result-status ${student.status === "PASS" ? "pass" : "fail"}`;

    status.textContent = student.status;

    card.appendChild(status);
}


// Create a unique record ID.
function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 8);
}


// Save a new student result or update an existing one.
function saveStudent() {
    if (!currentResult) {
        alert("Please generate a result first.");
        return;
    }

    const duplicate = records.find(record =>
        String(record.rollNo).toLowerCase() ===
            currentResult.rollNo.toLowerCase() &&
        record.id !== editingId
    );

    if (duplicate) {
        alert(
            "This roll number already exists. Use a unique roll number."
        );
        return;
    }

    const oldRecords = records.slice();

    if (editingId !== null) {
        records = records.map(record =>
            record.id === editingId
                ? {
                    ...currentResult,
                    id: editingId,
                    createdAt:
                        record.createdAt ||
                        new Date().toISOString()
                }
                : record
        );
    } else {
        records.push({
            ...currentResult,
            id: createId(),
            createdAt: new Date().toISOString()
        });
    }

    if (!saveRecords()) {
        records = oldRecords;
        return;
    }

    editingId = null;
    displayRecords();

    alert("Student result saved successfully.");

    $("studentForm").reset();
    currentResult = null;

    $("department").value = "Computer Applications";
    $("subjectsContainer").replaceChildren();
    $("subjectCount").textContent = "0 subjects";
    $("maximumMarks").textContent = "0";

    showPage(1);
}


// Show saved records and update the statistics.
function displayRecords() {
    const body = $("recordsBody");

    const search = $("searchInput")
        .value.trim().toLowerCase();

    body.replaceChildren();

    const filtered = records.filter(record =>
        String(record.name || "").toLowerCase().includes(search) ||
        String(record.rollNo || "").toLowerCase().includes(search)
    );

    $("emptyMessage").hidden = filtered.length > 0;

    filtered.forEach(record => {
        const row = document.createElement("tr");

        const maximum =
            record.maximum ??
            (Object.keys(record.marks || {}).length * 100);

        const values = [
            record.rollNo,
            record.name,
            record.course,
            record.semester || "—",
            `${record.total}/${maximum}`,
            `${record.percentage}%`,
            record.grade,
            record.status
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editStudent(record.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteStudent(record.id);
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        body.appendChild(row);
    });

    $("totalRecords").textContent = records.length;

    $("passedRecords").textContent =
        records.filter(record => record.status === "PASS").length;

    $("failedRecords").textContent =
        records.filter(record => record.status === "FAIL").length;
}


// Load an existing record for editing.
function editStudent(id) {
    const student = records.find(record => record.id === id);

    if (!student) return;

    editingId = id;

    $("studentName").value = student.name || "";
    $("rollNo").value = student.rollNo || "";
    $("course").value = student.course || "";
    $("semester").value = student.semester || "";
    $("department").value = student.department || "";
    $("session").value = student.session || "";

    renderSubjectInputs(student.marks || {});

    currentResult = { ...student };

    showPage(1);

    alert(
        "Record loaded. Update the details or marks, then generate and save the result."
    );
}


// Delete a saved record.
function deleteStudent(id) {
    const student = records.find(record => record.id === id);

    if (
        !student ||
        !confirm(`Delete the record for ${student.name}?`)
    ) {
        return;
    }

    const oldRecords = records.slice();

    records = records.filter(record => record.id !== id);

    if (!saveRecords()) {
        records = oldRecords;
        return;
    }

    if (editingId === id) {
        editingId = null;
        currentResult = null;
    }

    displayRecords();
}


// Escape CSV values and reduce formula injection risk.
function csvCell(value) {
    let text = String(value ?? "");

    if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
}


// Export saved results to a CSV file.
function exportCSV() {
    if (!records.length) {
        alert("There are no records to export.");
        return;
    }

    const headers = [
        "Roll Number",
        "Student Name",
        "Course",
        "Semester",
        "Department",
        "Session",
        "Subjects and Marks",
        "Total",
        "Maximum",
        "Percentage",
        "Grade",
        "Status"
    ];

    const rows = records.map(record => [
        record.rollNo,
        record.name,
        record.course,
        record.semester,
        record.department,
        record.session,

        Object.entries(record.marks || {})
            .map(([name, mark]) => `${name}: ${mark}`)
            .join("; "),

        record.total,
        record.maximum ??
            (Object.keys(record.marks || {}).length * 100),
        record.percentage,
        record.grade,
        record.status
    ]);

    const csv = "\uFEFF" +
        [headers, ...rows]
            .map(row => row.map(csvCell).join(","))
            .join("\r\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "student-results.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}


// Connect buttons to their functions.
$("continueButton").addEventListener("click", goToMarks);

$("backToDetails").addEventListener("click", () => {
    showPage(1);
});

$("generateButton").addEventListener("click", generateResult);

$("editMarksButton").addEventListener("click", () => {
    showPage(2);
});

$("saveButton").addEventListener("click", saveStudent);

$("printButton").addEventListener("click", () => {
    window.print();
});

$("exportButton").addEventListener("click", exportCSV);

$("searchInput").addEventListener("input", displayRecords);


// Refresh subjects when the course or semester changes.
$("course").addEventListener("change", () => {
    if ($("semester").value) {
        renderSubjectInputs();
    }
});

$("semester").addEventListener("change", () => {
    if ($("course").value) {
        renderSubjectInputs();
    }
});

$("studentForm").addEventListener("submit", event => {
    event.preventDefault();
});


// Initialize the application.
displayRecords();
showPage(1);