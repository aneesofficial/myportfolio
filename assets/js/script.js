'use strict';

// Elements
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const bookPositioner = document.getElementById("book-positioner");
const papers = document.querySelectorAll(".paper");
const indicatorsContainer = document.getElementById("page-indicators");

// State
let currentLocation = 1;
let numOfPapers = papers.length; // 8 papers
let maxLocation = numOfPapers + 1; // 9 locations

// Setup z-indexes so the layers look physically correct
function setZIndexes() {
  papers.forEach((paper, index) => {
    if (paper.classList.contains("flipped")) {
      paper.style.zIndex = index + 1;
    } else {
      paper.style.zIndex = numOfPapers - index;
    }
  });
}

setZIndexes();

// Indicators
function setupIndicators() {
  indicatorsContainer.innerHTML = '';
  for(let i = 1; i <= maxLocation; i++) {
    const dot = document.createElement("div");
    dot.classList.add("indicator-dot");
    if(i === currentLocation) dot.classList.add("active");
    dot.addEventListener("click", () => goToSpread(i));
    indicatorsContainer.appendChild(dot);
  }
}
setupIndicators();

function updateIndicators() {
  const dots = document.querySelectorAll(".indicator-dot");
  dots.forEach((dot, index) => {
    if(index + 1 === currentLocation) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

// Universal Centering Logic
function updateCentering() {
  // 1. Calculate responsive scale
  let scale = 1;
  if (window.innerWidth <= 768) {
    scale = 1; // Rely on CSS width for mobile to keep text readable
  } else if (window.innerWidth <= 900) {
    scale = 0.9;
  }

  // 2. Calculate horizontal translation for exact centering
  let tx = "0%";
  let controlsLeft = "50%"; // Default to center of book (spine)
  let controlsWidth = "100%"; // Default width

  if (currentLocation === 1) {
    tx = "-25%"; // Center the right page (cover)
    controlsLeft = "75%"; // Center controls under the right half (600px)
    controlsWidth = "50%";
  } else if (currentLocation === maxLocation) {
    tx = "25%"; // Center the left page (back cover)
    controlsLeft = "25%"; // Center controls under the left half (200px)
    controlsWidth = "50%";
  }

  // Apply to positioner
  bookPositioner.style.transform = `scale(${scale}) translateX(${tx})`;

  // Apply to controls
  const bookControls = document.getElementById("book-controls");
  if (bookControls) {
    bookControls.style.left = controlsLeft;
    bookControls.style.width = controlsWidth;
    bookControls.style.transition = "left 0.8s cubic-bezier(0.45, 0.05, 0.25, 1), width 0.8s cubic-bezier(0.45, 0.05, 0.25, 1)";
  }
}

window.addEventListener("resize", updateCentering);

// Navigation Button Visibility
function updateNavButtons() {
  if (currentLocation === 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentLocation === maxLocation) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

// Flipping Logic with high z-index during transition
function openPaper(index) {
  if (index >= 0 && index < numOfPapers) {
    const paper = papers[index];
    paper.classList.add("flipping");
    paper.classList.add("flipped");
    
    // Remove the flipping class after transition ends (0.85s)
    setTimeout(() => {
      paper.classList.remove("flipping");
      setZIndexes();
    }, 850);
  }
}

function closePaper(index) {
  if (index >= 0 && index < numOfPapers) {
    const paper = papers[index];
    paper.classList.add("flipping");
    paper.classList.remove("flipped");
    
    setTimeout(() => {
      paper.classList.remove("flipping");
      setZIndexes();
    }, 850);
  }
}

function goNextPage() {
  if(currentLocation < maxLocation) {
    openPaper(currentLocation - 1);
    currentLocation++;
    setZIndexes();
    updateIndicators();
    updateCentering();
    updateNavButtons();
  }
}

function goPrevPage() {
  if(currentLocation > 1) {
    closePaper(currentLocation - 2);
    currentLocation--;
    setZIndexes();
    updateIndicators();
    updateCentering();
    updateNavButtons();
  }
}

window.goToSpread = function(spreadNum) {
  if (spreadNum > currentLocation) {
    while (currentLocation < spreadNum) {
      openPaper(currentLocation - 1);
      currentLocation++;
    }
  } else if (spreadNum < currentLocation) {
    while (currentLocation > spreadNum) {
      closePaper(currentLocation - 2);
      currentLocation--;
    }
  }
  setZIndexes();
  updateIndicators();
  updateCentering();
  updateNavButtons();
}

// Event Listeners
prevBtn.addEventListener("click", goPrevPage);
nextBtn.addEventListener("click", goNextPage);

// Initialization
updateCentering();
updateNavButtons();

// Contact Form Logic
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formInputs && formBtn) {
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (form.checkValidity()) {
      alert("Message sent successfully! (Demo Mode)");
      form.reset();
      formBtn.setAttribute("disabled", "");
    }
  });
}