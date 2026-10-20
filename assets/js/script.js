'use strict';

// Elements
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const bookPositioner = document.getElementById("book-positioner");
const papers = document.querySelectorAll(".paper");
const indicatorsContainer = document.getElementById("page-indicators");

// State
let currentLocation = 1;
const numOfPapers = papers.length;
const maxLocation = numOfPapers + 1;
let isAnimating = false;
const FLIP_DURATION = 850; // ms

// Setup z-indexes and layer visibility so layers look physically correct and underlying pages never bleed through
function setZIndexes() {
  const isAnyFlipping = document.querySelector(".paper.flipping") !== null;

  papers.forEach((paper, index) => {
    const isFlipped = paper.classList.contains("flipped");
    const isFlipping = paper.classList.contains("flipping");
    
    // Z-index layering
    if (isFlipped) {
      paper.style.zIndex = index + 1;
    } else {
      paper.style.zIndex = 20 + (numOfPapers - index);
    }

    // Top visible page on the left: top flipped paper (currentLocation - 2)
    const isTopLeft = isFlipped && (index === currentLocation - 2);
    // Top visible page on the right: top unflipped paper (currentLocation - 1)
    const isTopRight = !isFlipped && (index === currentLocation - 1);
    
    // During an animation, keep the page underneath the flipping paper visible so there is no blank void
    const isUnderFlipping = isAnyFlipping && (
      (index === currentLocation - 3 && isFlipped) ||
      (index === currentLocation && !isFlipped)
    );

    if (isTopLeft || isTopRight || isFlipping || isUnderFlipping) {
      paper.style.visibility = "visible";
      paper.style.pointerEvents = "auto";
    } else {
      paper.style.visibility = "hidden";
      paper.style.pointerEvents = "none";
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
  const vw = Math.min(
    window.innerWidth || 800,
    document.documentElement.clientWidth || 800
  );

  // 1. Calculate responsive scale
  let scale = 1;
  if (vw <= 500) {
    scale = Math.max(0.38, Math.min(0.46, (vw - 16) / 800));
  } else if (vw <= 768) {
    scale = Math.min(0.75, (vw - 30) / 800);
  } else if (vw <= 950) {
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
    
    // Remove the flipping class after transition ends
    setTimeout(() => {
      paper.classList.remove("flipping");
      setZIndexes();
      isAnimating = false;
    }, FLIP_DURATION);
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
      isAnimating = false;
    }, FLIP_DURATION);
  }
}

function goNextPage() {
  if (isAnimating) return;
  if(currentLocation < maxLocation) {
    isAnimating = true;
    openPaper(currentLocation - 1);
    currentLocation++;
    setZIndexes();
    updateIndicators();
    updateCentering();
    updateNavButtons();
  }
}

function goPrevPage() {
  if (isAnimating) return;
  if(currentLocation > 1) {
    isAnimating = true;
    closePaper(currentLocation - 2);
    currentLocation--;
    setZIndexes();
    updateIndicators();
    updateCentering();
    updateNavButtons();
  }
}

window.goToSpread = function(spreadNum) {
  if (spreadNum === currentLocation || isAnimating) return;
  if (spreadNum > currentLocation) {
    while (currentLocation < spreadNum) {
      papers[currentLocation - 1].classList.remove("flipping");
      papers[currentLocation - 1].classList.add("flipped");
      currentLocation++;
    }
  } else if (spreadNum < currentLocation) {
    while (currentLocation > spreadNum) {
      papers[currentLocation - 2].classList.remove("flipping");
      papers[currentLocation - 2].classList.remove("flipped");
      currentLocation--;
    }
  }
  isAnimating = false;
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

// Contact Form Logic (Real Email Delivery via FormSubmit)
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formStatusMsg = document.getElementById("form-status-msg");

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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) return;

    const originalBtnContent = formBtn.innerHTML;
    formBtn.innerHTML = '<ion-icon name="sync-outline" class="spin-icon"></ion-icon> <span>Sending...</span>';
    formBtn.setAttribute("disabled", "");

    if (formStatusMsg) {
      formStatusMsg.className = "form-status-msg";
      formStatusMsg.textContent = "";
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get("fullname"),
      email: formData.get("email"),
      message: formData.get("message"),
      _subject: `New Portfolio Message from ${formData.get("fullname")}`,
      _template: "table",
      _captcha: "false"
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/aneeskhann5577@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && (result.success === "true" || result.success === true)) {
        formBtn.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon> <span>Message Sent!</span>';
        if (formStatusMsg) {
          formStatusMsg.className = "form-status-msg success";
          formStatusMsg.textContent = "Thank you! Your message has been sent successfully. I will get back to you soon.";
        }
        form.reset();
        setTimeout(() => {
          formBtn.innerHTML = originalBtnContent;
          formBtn.setAttribute("disabled", "");
        }, 4000);
      } else {
        throw new Error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      formBtn.innerHTML = originalBtnContent;
      formBtn.removeAttribute("disabled");
      if (formStatusMsg) {
        formStatusMsg.className = "form-status-msg error";
        formStatusMsg.textContent = "Failed to send. Please email directly at aneeskhann5577@gmail.com";
      }
    }
  });
}