"use strict";

var STUDENT_NUMBER_RE = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
var MOBILE_RE = /^(09|\+639)\d{9}$/;
var PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/;

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return STUDENT_NUMBER_RE.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return PASSWORD_RE.test(value);
}

function isValidFullName(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_RE.test(value.trim());
}

function isValidMobile(value) {
  return typeof value === "string" && MOBILE_RE.test(value.trim());
}

function passwordProblems(value) {
  var problems = [];
  if (value.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) problems.push("one uppercase letter");
  if (!/\d/.test(value)) problems.push("one digit");
  if (!/[@$!]/.test(value)) problems.push("one of @, $, or !");
  if (/\s/.test(value)) problems.push("no spaces");
  return problems;
}

if (typeof document !== "undefined") {
  var form = document.getElementById("registrationForm");

  var fields = {
    fullName: document.getElementById("fullName"),
    studentNumber: document.getElementById("studentNumber"),
    email: document.getElementById("email"),
    mobileNumber: document.getElementById("mobileNumber"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    course: document.getElementById("course"),
    terms: document.getElementById("terms")
  };

  var passwordFeedback = document.getElementById("passwordFeedback");
  var successMessage = document.getElementById("successMessage");
  var summary = document.getElementById("registrationSummary");
  var summaryIds = {
    fullName: "summaryName",
    studentNumber: "summaryStudentNumber",
    email: "summaryEmail",
    mobileNumber: "summaryMobileNumber",
    course: "summaryCourse"
  };

  var checks = {
    fullName: function () {
      var v = fields.fullName.value.trim();
      if (v === "") return "Enter your full name.";
      if (v.length < 2) return "Full name must have at least 2 characters.";
      return "";
    },
    studentNumber: function () {
      var v = fields.studentNumber.value.trim();
      if (v === "") return "Enter your student number.";
      if (!isValidStudentNumber(v)) return "Enter a student number in the format 24-1234-123.";
      return "";
    },
    email: function () {
      var v = fields.email.value.trim();
      if (v === "") return "Enter your email address.";
      if (!isValidEmail(v)) return "Enter an email like name@example.com, with no spaces.";
      return "";
    },
    mobileNumber: function () {
      var v = fields.mobileNumber.value.trim();
      if (v === "") return "Enter your mobile number.";
      if (!isValidMobile(v)) return "Enter 09 or +639 followed by 9 digits, with no spaces or hyphens.";
      return "";
    },
    password: function () {
      var v = fields.password.value;
      if (v === "") return "Enter a password.";
      if (!isValidPassword(v)) return "Password must have " + passwordProblems(v).join(", ") + ".";
      return "";
    },
    confirmPassword: function () {
      var v = fields.confirmPassword.value;
      if (v === "") return "Confirm your password.";
      if (v !== fields.password.value) return "Passwords do not match.";
      return "";
    },
    course: function () {
      var v = fields.course.value;
      if (v !== "BSIT" && v !== "BSCS") return "Select BSIT or BSCS.";
      return "";
    },
    terms: function () {
      return fields.terms.checked ? "" : "You must agree to the terms to register.";
    }
  };

  function setError(name, message) {
    var errorEl = document.getElementById(name + "Error");
    var input = fields[name];
    errorEl.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(name) {
    var message = checks[name]();
    setError(name, message);
    return message === "";
  }

  function updatePasswordFeedback() {
    var v = fields.password.value;
    passwordFeedback.className = "feedback";
    if (v === "") {
      passwordFeedback.textContent = "";
      return;
    }
    var problems = passwordProblems(v);
    if (problems.length === 0) {
      passwordFeedback.textContent = "Password meets all rules.";
      passwordFeedback.classList.add("ok");
    } else {
      passwordFeedback.textContent = "Still needed: " + problems.join(", ") + ".";
      passwordFeedback.classList.add("bad");
    }
  }

  function clearOutput() {
    successMessage.textContent = "";
    summary.hidden = true;
    Object.keys(summaryIds).forEach(function (key) {
      document.getElementById(summaryIds[key]).textContent = "";
    });
  }

  function showSummary() {
    Object.keys(summaryIds).forEach(function (key) {
      var value = fields[key].value;
      if (key !== "course") value = value.trim();
      document.getElementById(summaryIds[key]).textContent = value;
    });
    successMessage.textContent = "Registration details validated successfully!";
    summary.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearOutput();

    var firstInvalid = null;
    Object.keys(checks).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = fields[name];
    });
    updatePasswordFeedback();

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    showSummary();
  });

  fields.password.addEventListener("input", function () {
    updatePasswordFeedback();
    if (fields.password.getAttribute("aria-invalid") === "true") validateField("password");
    if (fields.confirmPassword.value !== "" || fields.confirmPassword.getAttribute("aria-invalid") === "true") {
      validateField("confirmPassword");
    }
  });

  fields.fullName.addEventListener("blur", function () {
    validateField("fullName");
  });

  ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
    fields[name].addEventListener("input", function () {
      if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
    });
    fields[name].addEventListener("blur", function () {
      if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
    });
  });

  fields.course.addEventListener("change", function () { validateField("course"); });
  fields.terms.addEventListener("change", function () { validateField("terms"); });

  form.addEventListener("reset", function () {
    Object.keys(fields).forEach(function (name) { setError(name, ""); });
    passwordFeedback.textContent = "";
    passwordFeedback.className = "feedback";
    clearOutput();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber: isValidStudentNumber, isValidPassword: isValidPassword };
}