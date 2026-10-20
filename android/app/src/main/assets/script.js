"use strict";

/* =========================================
   CODEALPHA SCIENTIFIC CALCULATOR
   Scientific calculator + local history
   Number formats: NORM, SCI, ENG
========================================= */

/* ---------- DISPLAY ELEMENTS ---------- */

const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const modeLabel = document.getElementById("mode-label");
const statusLabel = document.getElementById("status-label");
const angleToggle = document.getElementById("angle-toggle");

/* ---------- HISTORY ELEMENTS ---------- */

const historyToggle = document.getElementById("history-toggle");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");

const HISTORY_STORAGE_KEY = "codealpha_calculator_history";
const MAX_HISTORY = 50;

/* ---------- NUMBER FORMAT ELEMENTS ---------- */

const formatButtons = document.querySelectorAll("[data-format]");

/* ---------- CALCULATOR STATE ---------- */

let expression = "";
let angleMode = "DEG";
let numberFormat = "norm";
let justCalculated = false;
let lastAnswer = 0;

let calculationHistory = loadHistory();


/* =========================================
   DISPLAY AND NUMBER FORMATTING
========================================= */

function updateDisplay() {
  expressionDisplay.textContent = expression || "0";

  modeLabel.textContent = angleMode;
  angleToggle.textContent = angleMode;

  angleToggle.classList.toggle(
    "active",
    angleMode === "DEG"
  );

  formatButtons.forEach(button => {
    const active = button.dataset.format === numberFormat;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  try {
    const value = evaluateExpression(expression, true);

    if (value === null || !Number.isFinite(value)) {
      resultDisplay.textContent = expression ? "…" : "0";
      statusLabel.textContent = expression ? "INPUT" : "READY";
      return;
    }

    resultDisplay.textContent = formatDisplayNumber(value);
    statusLabel.textContent = "READY";

  } catch (error) {
    resultDisplay.textContent = expression ? "…" : "0";
    statusLabel.textContent = expression ? "INPUT" : "READY";
  }
}


/* Standard number formatting for expressions and calculations. */
function formatNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Math error");
  }

  if (Math.abs(value) < 1e-12) {
    value = 0;
  }

  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return String(value);
  }

  return Number(value.toPrecision(12)).toString();
}


/* Format the answer according to the selected display mode. */
function formatDisplayNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Math error");
  }

  if (Math.abs(value) < 1e-12) {
    value = 0;
  }

  if (value === 0) {
    return "0";
  }

  if (numberFormat === "sci") {
    return formatScientific(value, 1);
  }

  if (numberFormat === "eng") {
    return formatScientific(value, 3);
  }

  // NORM: ordinary decimals, with automatic scientific
  // notation for extremely large or small values.
  if (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-9) {
    return formatScientific(value, 1);
  }

  return formatNumber(value);
}


/*
  Scientific notation:
  exponentMultiple = 1 -> SCI
  exponentMultiple = 3 -> ENG

  Examples:
  SCI: 1500000 -> 1.5 × 10⁶
  ENG: 25000   -> 25 × 10³
  ENG: 0.000025 -> 25 × 10⁻⁶
*/
function formatScientific(value, exponentMultiple) {
  if (value === 0) {
    return "0";
  }

  const sign = value < 0 ? "−" : "";
  const absoluteValue = Math.abs(value);

  let exponent = Math.floor(Math.log10(absoluteValue));

  if (exponentMultiple === 3) {
    exponent = Math.floor(exponent / 3) * 3;
  }

  let coefficient = absoluteValue / Math.pow(10, exponent);

  // Round to 10 significant digits for readable output.
  coefficient = Number(coefficient.toPrecision(10));

  // Rounding can push a coefficient over its allowed range.
  if (exponentMultiple === 1 && coefficient >= 10) {
    coefficient /= 10;
    exponent++;
  }

  if (exponentMultiple === 3 && coefficient >= 1000) {
    coefficient /= 1000;
    exponent += 3;
  }

  const coefficientText = Number(coefficient.toPrecision(10)).toString();
  const exponentText = toSuperscript(exponent);

  return `${sign}${coefficientText} × 10${exponentText}`;
}


/* Convert integer exponents into mathematical superscripts. */
function toSuperscript(value) {
  const digits = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
  };

  return String(value)
    .split("")
    .map(character => digits[character] || character)
    .join("");
}


function showError(message) {
  resultDisplay.textContent = message;
  statusLabel.textContent = "ERROR";
}


/* =========================================
   EXPRESSION PREPARATION
========================================= */

function prepareExpression(input, preview = false) {
  let text = input.trim();

  if (!text) {
    return "";
  }

  text = text
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/[−]/g, "-");

  let openCount = 0;
  let closeCount = 0;

  for (const character of text) {
    if (character === "(") openCount++;
    if (character === ")") closeCount++;
  }

  if (closeCount > openCount) {
    throw new Error("Check parentheses");
  }

  if (preview) {
    text += ")".repeat(openCount - closeCount);
  }

  return text;
}


/* =========================================
   MATHEMATICAL PARSER
========================================= */

function evaluateExpression(input, preview = false) {
  if (!input.trim()) {
    return null;
  }

  let text = prepareExpression(input, preview);

  if (!text) {
    return null;
  }

  if (preview && /[+\-*/^.]$/.test(text)) {
    return null;
  }

  text = text.replace(/\bPI\b/gi, "pi");

  const tokens = tokenize(text);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(expected) {
    const token = tokens[position];

    if (expected !== undefined && token !== expected) {
      throw new Error("Invalid expression");
    }

    position++;
    return token;
  }

  function match(token) {
    if (peek() === token) {
      position++;
      return true;
    }

    return false;
  }

  function expressionValue() {
    let value = term();

    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = term();

      value = operator === "+"
        ? value + right
        : value - right;
    }

    return value;
  }

  function term() {
    let value = unary();

    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const right = unary();

      if (operator === "/") {
        if (right === 0) {
          throw new Error("Cannot divide by zero");
        }

        value /= right;
      } else {
        value *= right;
      }
    }

    return value;
  }

  function unary() {
    if (match("+")) {
      return unary();
    }

    if (match("-")) {
      return -unary();
    }

    return power();
  }

  function power() {
    let value = postfix();

    if (match("^")) {
      const exponent = unary();
      value = Math.pow(value, exponent);
    }

    return value;
  }

  function postfix() {
    let value = primary();

    while (true) {
      if (match("!")) {
        value = factorial(value);
      } else if (match("%")) {
        value /= 100;
      } else {
        break;
      }
    }

    return value;
  }

  function primary() {
    const token = peek();

    if (token === undefined) {
      throw new Error("Incomplete expression");
    }

    if (match("(")) {
      const value = expressionValue();
      consume(")");
      return value;
    }

    if (token === "pi") {
      consume();
      return Math.PI;
    }

    if (token === "e") {
      consume();
      return Math.E;
    }

    if (isNumber(token)) {
      consume();
      return Number(token);
    }

    if (isFunction(token)) {
      const functionName = consume();

      let argument;

      if (match("(")) {
        argument = expressionValue();
        consume(")");
      } else {
        argument = unary();
      }

      return applyFunction(functionName, argument);
    }

    throw new Error("Invalid expression");
  }

  const value = expressionValue();

  if (position < tokens.length) {
    throw new Error("Invalid expression");
  }

  if (!Number.isFinite(value)) {
    throw new Error("Math error");
  }

  return value;
}


/* =========================================
   TOKENIZER
========================================= */

function tokenize(input) {
  const tokens = [];
  let index = 0;

  while (index < input.length) {
    const character = input[index];

    if (/\s/.test(character)) {
      index++;
      continue;
    }

    const remaining = input.slice(index);

    const numberMatch = remaining.match(
      /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i
    );

    if (numberMatch) {
      tokens.push(numberMatch[0]);
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = remaining.match(/^[a-zA-Z]+/);

    if (identifierMatch) {
      const name = identifierMatch[0].toLowerCase();

      if (
        name !== "pi" &&
        name !== "e" &&
        !isFunction(name)
      ) {
        throw new Error("Unknown function");
      }

      tokens.push(name);
      index += identifierMatch[0].length;
      continue;
    }

    if ("+-*/^!%()".includes(character)) {
      tokens.push(character);
      index++;
      continue;
    }

    throw new Error("Invalid character");
  }

  const expanded = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const previous = expanded[expanded.length - 1];

    if (
      previous &&
      endsValue(previous) &&
      startsValue(current)
    ) {
      expanded.push("*");
    }

    expanded.push(current);
  }

  return expanded;
}


function endsValue(token) {
  return (
    isNumber(token) ||
    token === "pi" ||
    token === "e" ||
    token === ")" ||
    token === "!" ||
    token === "%"
  );
}


function startsValue(token) {
  return (
    isNumber(token) ||
    token === "pi" ||
    token === "e" ||
    token === "(" ||
    isFunction(token)
  );
}


function isNumber(token) {
  return (
    typeof token === "string" &&
    /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(token)
  );
}


function isFunction(name) {
  return [
    "sin", "cos", "tan",
    "asin", "acos", "atan",
    "log", "ln", "sqrt", "abs"
  ].includes(name);
}


/* =========================================
   SCIENTIFIC FUNCTIONS
========================================= */

function applyFunction(name, value) {
  const toRadians = angleMode === "DEG"
    ? Math.PI / 180
    : 1;

  const fromRadians = angleMode === "DEG"
    ? 180 / Math.PI
    : 1;

  switch (name) {
    case "sin":
      return Math.sin(value * toRadians);

    case "cos":
      return Math.cos(value * toRadians);

    case "tan": {
      const radians = value * toRadians;

      if (Math.abs(Math.cos(radians)) < 1e-12) {
        throw new Error("Undefined tangent");
      }

      return Math.tan(radians);
    }

    case "asin":
      if (value < -1 || value > 1) {
        throw new Error("Domain: -1 to 1");
      }

      return Math.asin(value) * fromRadians;

    case "acos":
      if (value < -1 || value > 1) {
        throw new Error("Domain: -1 to 1");
      }

      return Math.acos(value) * fromRadians;

    case "atan":
      return Math.atan(value) * fromRadians;

    case "log":
      if (value <= 0) {
        throw new Error("Log requires x > 0");
      }

      return Math.log10(value);

    case "ln":
      if (value <= 0) {
        throw new Error("Ln requires x > 0");
      }

      return Math.log(value);

    case "sqrt":
      if (value < 0) {
        throw new Error("Square root requires x ≥ 0");
      }

      return Math.sqrt(value);

    case "abs":
      return Math.abs(value);

    default:
      throw new Error("Unknown function");
  }
}


function factorial(value) {
  if (
    value < 0 ||
    !Number.isInteger(value) ||
    value > 170
  ) {
    throw new Error("Factorial needs an integer 0–170");
  }

  let answer = 1;

  for (let i = 2; i <= value; i++) {
    answer *= i;
  }

  return answer;
}


/* =========================================
   LOCAL CALCULATION HISTORY
========================================= */

function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(item =>
        item &&
        typeof item.expression === "string" &&
        typeof item.result === "number" &&
        Number.isFinite(item.result) &&
        typeof item.timestamp === "number"
      )
      .slice(0, MAX_HISTORY);

  } catch (error) {
    return [];
  }
}


function saveHistory() {
  try {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(calculationHistory)
    );

    return true;

  } catch (error) {
    return false;
  }
}


function addHistoryEntry(originalExpression, answer) {
  const entry = {
    expression: originalExpression,
    result: answer,
    timestamp: Date.now()
  };

  calculationHistory.unshift(entry);

  if (calculationHistory.length > MAX_HISTORY) {
    calculationHistory = calculationHistory.slice(0, MAX_HISTORY);
  }

  saveHistory();
  renderHistory();
}


function clearHistory() {
  if (calculationHistory.length === 0) {
    renderHistory();
    return;
  }

  calculationHistory = [];

  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    // Storage may be unavailable.
  }

  renderHistory();
}


function renderHistory() {
  historyList.replaceChildren();

  const count = calculationHistory.length;

  historyCount.textContent =
    `${count} ${count === 1 ? "calculation" : "calculations"}`;

  if (count === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";

    const icon = document.createElement("span");
    icon.className = "history-empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "◷";

    const title = document.createElement("p");
    title.textContent = "No calculations yet";

    const description = document.createElement("span");
    description.textContent =
      "Your completed calculations will appear here.";

    empty.append(icon, title, description);
    historyList.appendChild(empty);

    return;
  }

  calculationHistory.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-entry";

    button.setAttribute(
      "aria-label",
      `Reuse result ${formatDisplayNumber(entry.result)}`
    );

    const entryExpression = document.createElement("span");
    entryExpression.className = "history-entry-expression";
    entryExpression.textContent = entry.expression;

    const bottom = document.createElement("span");
    bottom.className = "history-entry-bottom";

    const result = document.createElement("span");
    result.className = "history-entry-result";
    result.textContent = formatDisplayNumber(entry.result);

    const hint = document.createElement("span");
    hint.className = "history-entry-hint";
    hint.textContent = "USE RESULT ↗";

    bottom.append(result, hint);
    button.append(entryExpression, bottom);

    button.addEventListener("click", () => {
      reuseHistoryEntry(index);
    });

    historyList.appendChild(button);
  });
}


function reuseHistoryEntry(index) {
  const entry = calculationHistory[index];

  if (!entry) {
    return;
  }

  // Keep the expression usable by the mathematical parser.
  expression = formatNumber(entry.result);
  lastAnswer = entry.result;
  justCalculated = true;

  closeHistory();
  updateDisplay();
}


/* =========================================
   HISTORY PANEL CONTROLS
========================================= */

function openHistory() {
  historyPanel.hidden = false;
  historyPanel.setAttribute("aria-hidden", "false");

  historyToggle.setAttribute("aria-expanded", "true");

  renderHistory();
}


function closeHistory() {
  historyPanel.hidden = true;
  historyPanel.setAttribute("aria-hidden", "true");

  historyToggle.setAttribute("aria-expanded", "false");
}


function toggleHistory() {
  if (historyPanel.hidden) {
    openHistory();
  } else {
    closeHistory();
  }
}


/* =========================================
   INPUT HELPERS
========================================= */

function insertValue(value) {
  if (justCalculated) {
    if ("+-*/^".includes(value)) {
      expression = formatNumber(lastAnswer);
    } else {
      expression = "";
    }

    justCalculated = false;
  }

  if (value === ".") {
    const currentNumber = expression.match(
      /(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i
    );

    if (currentNumber && currentNumber[0].includes(".")) {
      return;
    }

    if (
      !expression ||
      /[+\-*/^(]$/.test(expression)
    ) {
      expression += "0";
    }
  }

  expression += value;
  updateDisplay();
}


function clearAll() {
  expression = "";
  justCalculated = false;
  lastAnswer = 0;

  resultDisplay.textContent = "0";
  statusLabel.textContent = "READY";

  updateDisplay();
}


function deleteLast() {
  if (justCalculated) {
    expression = "";
    justCalculated = false;
  } else {
    expression = expression.slice(0, -1);
  }

  updateDisplay();
}


function toggleSign() {
  try {
    if (!expression) {
      expression = "-";
      updateDisplay();
      return;
    }

    const value = evaluateExpression(expression, true);

    if (value === null) {
      expression = "-(" + expression + ")";
    } else {
      expression = formatNumber(-value);
    }

    justCalculated = false;
    updateDisplay();

  } catch (error) {
    expression = expression
      ? "-(" + expression + ")"
      : "-";

    updateDisplay();
  }
}


/* =========================================
   SCIENTIFIC BUTTON ACTIONS
========================================= */

function applyScientificFunction(name) {
  if (name === "power") {
    if (justCalculated) {
      expression = formatNumber(lastAnswer);
      justCalculated = false;
    }

    expression += "^";
    updateDisplay();
    return;
  }

  try {
    if (expression && !/[+\-*/^.]$/.test(expression)) {
      const currentValue = evaluateExpression(expression, true);

      if (currentValue !== null) {
        let answer;

        if (name === "square") {
          answer = currentValue * currentValue;

        } else if (name === "factorial") {
          answer = factorial(currentValue);

        } else if (name === "reciprocal") {
          if (currentValue === 0) {
            throw new Error("Cannot divide by zero");
          }

          answer = 1 / currentValue;

        } else {
          answer = applyFunction(name, currentValue);
        }

        if (!Number.isFinite(answer)) {
          throw new Error("Math error");
        }

        expression = formatNumber(answer);
        lastAnswer = answer;
        justCalculated = false;

        updateDisplay();
        return;
      }
    }

  } catch (error) {
    showError(error.message || "Math error");
    return;
  }

  if (justCalculated) {
    expression = formatNumber(lastAnswer);
    justCalculated = false;
  }

  if (name === "square") {
    expression = "(" + expression + ")^2";

  } else if (name === "factorial") {
    expression += "!";

  } else if (name === "reciprocal") {
    expression = "1/(" + expression;

     } else {
    expression += name + "(";
  }

  updateDisplay();
}


/* =========================================
   CALCULATE AND SAVE HISTORY
========================================= */

function calculate() {
  if (!expression.trim()) {
    return;
  }

  const originalExpression = expression;

  try {
    const answer = evaluateExpression(expression, true);

    if (answer === null) {
      showError("Incomplete expression");
      return;
    }

    lastAnswer = answer;

    resultDisplay.textContent = formatDisplayNumber(answer);
    statusLabel.textContent = "COMPLETE";

    addHistoryEntry(originalExpression, answer);

    justCalculated = true;

  } catch (error) {
    showError(error.message || "Invalid expression");
  }
}


/* =========================================
   NUMBER FORMAT CONTROLS
========================================= */

formatButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedFormat = button.dataset.format;

    if (!["norm", "sci", "eng"].includes(selectedFormat)) {
      return;
    }

    numberFormat = selectedFormat;

    // Refresh the current answer and history display.
    updateDisplay();
    renderHistory();

    // Preserve the completed status when switching formats.
    if (justCalculated && expression) {
      try {
        const answer = evaluateExpression(expression, true);

        if (answer !== null) {
          resultDisplay.textContent = formatDisplayNumber(answer);
          statusLabel.textContent = "COMPLETE";
        }
      } catch (error) {
        // updateDisplay handles invalid expressions.
      }
    }
  });
});


/* =========================================
   BUTTON EVENTS
========================================= */

document.querySelectorAll("[data-value]").forEach(button => {
  button.addEventListener("click", () => {
    insertValue(button.dataset.value);
  });
});


document.querySelectorAll("[data-function]").forEach(button => {
  button.addEventListener("click", () => {
    applyScientificFunction(button.dataset.function);
  });
});


document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    switch (action) {
      case "clear":
        clearAll();
        break;

      case "delete":
        deleteLast();
        break;

      case "sign":
        toggleSign();
        break;

      case "calculate":
        calculate();
        break;

      case "toggle-history":
        toggleHistory();
        break;

      case "clear-history":
        clearHistory();
        break;
    }
  });
});


angleToggle.addEventListener("click", () => {
  angleMode = angleMode === "DEG" ? "RAD" : "DEG";
  updateDisplay();
});


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener("keydown", event => {
  if (
    event.target instanceof HTMLElement &&
    (
      event.target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
    )
  ) {
    return;
  }

  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    insertValue(key);
    return;
  }

  if (["+", "-", "*", "/", "^", "%", "(", ")"].includes(key)) {
    insertValue(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    deleteLast();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    if (!historyPanel.hidden) {
      closeHistory();
    } else {
      clearAll();
    }
  }
});


/* =========================================
   INITIALIZE
========================================= */

renderHistory();
updateDisplay();
