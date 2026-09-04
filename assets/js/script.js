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
  if (window.innerWidth <= 500) {
    scale = 0.42;
  } else if (window.innerWidth <= 768) {
    scale = 0.75;
  } else if (window.innerWidth <= 900) {
    scale = 0.9;
  }

  // 2. Calculate horizontal translation for exact centering
  let tx = "0%";
  if (currentLocation === 1) {
    tx = "-25%"; // Center the right page (cover)
  } else if (currentLocation === maxLocation) {
    tx = "25%"; // Center the left page (back cover)
  }

  // Apply to positioner
  bookPositioner.style.transform = `scale(${scale}) translateX(${tx})`;
}

window.addEventListener("resize", updateCentering);

// Navigation Button Visibility
function updateNavButtons() {
  if (currentLocation === 1) {
    prevBtn.style.visibility = "hidden";
    prevBtn.style.opacity = "0";
    prevBtn.style.pointerEvents = "none";
  } else {
    prevBtn.style.visibility = "visible";
    prevBtn.style.opacity = "1";
    prevBtn.style.pointerEvents = "auto";
  }

  if (currentLocation === maxLocation) {
    nextBtn.style.visibility = "hidden";
    nextBtn.style.opacity = "0";
    nextBtn.style.pointerEvents = "none";
  } else {
    nextBtn.style.visibility = "visible";
    nextBtn.style.opacity = "1";
    nextBtn.style.pointerEvents = "auto";
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