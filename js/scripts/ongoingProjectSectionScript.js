// Updated budget filter with range support
document.addEventListener("DOMContentLoaded", function () {
  console.log("Budget range filter loaded");

  // Force add carousel styles with higher specificity
  addCarouselStyles();

  const categoryFilter = document.getElementById("categoryFilter");
  const scaleFilter = document.getElementById("scaleFilter");
  const projectList = document.getElementById("projectList");

  // Carousel state
  let currentSlide = 0;
  let slidesPerView = getSlidesPerView();
  let totalSlides = 0;
  let autoSlideInterval = null;

  // Create category buttons with updated budget ranges
  createCategoryButtons();

  // Initialize
  loadProjects();

  // Window resize handler
  window.addEventListener("resize", function () {
    slidesPerView = getSlidesPerView();
    updateCarouselPosition();
  });

  function getSlidesPerView() {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }

 
  function addCarouselStyles() {
    const existingStyle = document.getElementById("carousel-styles");
    if (existingStyle) existingStyle.remove();

    const style = document.createElement("style");
    style.id = "carousel-styles";
    style.textContent = `
        /* Force override existing styles */
        #projectList, .project-list {
            display: block !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        
        /* Category Filter Styles */
        .category-filter-container {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            margin: 20px 0 !important;
            padding: 0 20px !important;
            justify-content: center !important;
            align-items: center !important;
        }
        
        .category-btn {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 12px 20px !important;
            border: 2px solid #114CC2FF !important;
            border-radius: 25px !important;
            background: transparent !important;
            color: #114CC2FF !important;
            font-size: 17px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            text-decoration: none !important;
            white-space: nowrap !important;
        }
        
        .category-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
        }
        
        .category-btn.active {
            background: #114CC2FF !important;
            border:none !important;
            color: white !important;
        }
        
        .budget-select {
            padding: 12px 20px !important;
            border: 2px solid #114CC2FF !important;
            border-radius: 25px !important;
            background: rgba(255,255,255,0) !important;
            color: #114CC2FF !important;
            font-size: 17px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            padding:15px !important;
            outline: none !important;
            min-width: 180px !important;
        }
        
        /* CAROUSEL CONTAINER */
        .projectcarousel-container {
            position: relative !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 20px !important;
            overflow: hidden !important;
            background: transparent !important;
            min-height: 590px !important;
        }
        
        .carousel-wrapper {
            position: relative !important;
            overflow: hidden !important;
            border-radius: 15px !important;
            // box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
            background: rgba(255,255,255 0) !important;
            min-height: 400px !important;
        }
        
        /* CAROUSEL TRACK */
        .carousel-track {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            transition: transform 0.5s ease-in-out !important;
            will-change: transform !important;
            width: 100% !important;
            min-height: 400px !important;
            /* Center single items */
            justify-content: flex-start !important;
        }
        
        /* CAROUSEL SLIDES */
        .carousel-slide {
            flex: 0 0 33.333% !important;
            min-width: 0 !important;
            padding: 10px !important;
            box-sizing: border-box !important;
            display: block !important;
            height: 550px !important;
        }
        
        /* Special case for single project - center it */
        .carousel-track:has(.carousel-slide:first-child:last-child) {
            justify-content: center !important;
        }
        
        /* Alternative for browsers that don't support :has() */
        .carousel-track.single-project {
            justify-content: center !important;
        }
        
        .carousel-track.single-project .carousel-slide {
            flex: 0 0 400px !important;
            max-width: 400px !important;
        }
        
        /* Responsive slide widths */
        @media (max-width: 1199px) {
            .carousel-slide {
                flex: 0 0 50% !important;
            }
            
            .carousel-track.single-project .carousel-slide {
                flex: 0 0 350px !important;
                max-width: 350px !important;
            }
        }
        
        @media (max-width: 767px) {
            .carousel-slide {
                flex: 0 0 100% !important;
            }
            
            .carousel-track.single-project .carousel-slide {
                flex: 0 0 100% !important;
                max-width: 100% !important;
            }
        }
        
        /* CARD STYLES */
        .carousel-slide .card {
            height: 100% !important;
            background: white !important;
            border-radius: 15px !important;
            overflow: hidden !important;
            // box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            border: 1px solid #e1e5e9 !important;
            position: relative !important;
            display: block !important;
            margin: 0 auto !important; /* Center cards */
        }
        
        .carousel-slide .card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Navigation Controls */
        .carousel-controls {
            position: absolute !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            background: rgba(255, 255, 255, 0.9) !important;
            border: none !important;
            width: 50px !important;
            height: 50px !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 18px !important;
            color: #0A1E46 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            z-index: 1000 !important;
        }
        
        .carousel-controls:hover {
            background: #0A1E46 !important;
            color: white !important;
            transform: translateY(-50%) scale(1.1) !important;
        }
        
        .carousel-prev {
            left: 10px !important;
        }
        
        .carousel-next {
            right: 10px !important;
        }
        
        /* Indicators */
        .carousel-indicators {
            display: none;
            justify-content: center !important;
            gap: 8px !important;
            margin-top: 20px !important;
            padding: 10px !important;
        }
        
        .carousel-indicator {
            width: 12px !important;
            height: 12px !important;
            border-radius: 50% !important;
            background: #d1d5db !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }
        
        .carousel-indicator.active {
            background: #0A1E46 !important;
            transform: scale(1.2) !important;
        }
        
        /* Status Badges */
        .status-badge {
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            color: white !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            border-radius: 0 15px 0 12px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            z-index: 10 !important;
        }
        
        .status-proposed {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
        }
        
        .status-ongoing {
            background: linear-gradient(135deg, #27ae60, #229954) !important;
        }
        
        .status-completed {
            background: linear-gradient(135deg, #2980b9, #2471a3) !important;
        }
        
        .status-onhold {
            background: linear-gradient(135deg, #f39c12, #e67e22) !important;
        }
        
        .status-unknown {
            background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
        }
        
        /* Loading and No Results */
        .carousel-loading, .carousel-no-results {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 60px 20px !important;
            text-align: center !important;
            color: #6b7280 !important;
            min-height: 400px !important;
        }
        
        .loading-spinner {
            width: 50px !important;
            height: 50px !important;
            border: 4px solid #f3f4f6 !important;
            border-top: 4px solid #0A1E46 !important;
            border-radius: 50% !important;
            animation: spin 1s linear infinite !important;
            margin-bottom: 20px !important;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Font Awesome Fix */
        .fas, .fa {
            font-family: "Font Awesome 6 Free" !important;
            font-weight: 900 !important;
        }
    `;
    document.head.appendChild(style);

    // Add Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement("link");
      fontAwesome.rel = "stylesheet";
      fontAwesome.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      document.head.appendChild(fontAwesome);
    }
  }

  function createCategoryButtons() {
    let container = document.querySelector(".category-filter-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "category-filter-container";

      const projectSection = projectList || document.body;
      projectSection.parentNode.insertBefore(container, projectSection);
    }

    const categories = [
      { id: "all", name: "All Projects", icon: "fas fa-star" },
      { id: "1", name: "Health", icon: "fas fa-heartbeat" },
      { id: "2", name: "Environment", icon: "fas fa-leaf" },
      { id: "3", name: "Education", icon: "fas fa-graduation-cap" },
      { id: "4", name: "Infrastructure", icon: "fas fa-city" },
      { id: "5", name: "Social", icon: "fas fa-users" },
    ];

    let buttonsHTML = "";

    categories.forEach(function (category) {
      const isActive = category.id === "all" ? "active" : "";
      buttonsHTML += `
                <button class="category-btn ${isActive}" data-category="${category.id}">
                    <i class="${category.icon}"></i>
                    ${category.name}
                </button>
            `;
    });

    // Updated budget ranges
    buttonsHTML += `
            <select class="budget-select" id="budgetSelect">
                <option value="all">All Budgets</option>
                <option value="0-1000000">₹0 - ₹10 Lakh</option>
                <option value="1000000-2000000">₹10 Lakh - ₹20 Lakh</option>
                <option value="2000000-5000000">₹20 Lakh - ₹50 Lakh</option>
                <option value="5000000-10000000">₹50 Lakh - ₹1 Crore </option>
                <option value="10000001-50000000">₹1 Crore - ₹5 Crore</option>
                <option value="50000001-100000000">₹5 Crore - ₹10 Crore</option>
                <option value="100000001-200000000">₹10 Crore - ₹20 Crore</option>
                <option value="200000001-300000000">₹20 Crore - ₹30 Crore</option>
                <option value="300000001-999999999">₹30 Crore+</option>

            </select>
        `;

    container.innerHTML = buttonsHTML;

    // Add event listeners
    container.querySelectorAll(".category-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        container.querySelectorAll(".category-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");

        const categoryId = this.dataset.category;
        handleCategoryButtonChange(categoryId);
      });
    });

    const budgetSelect = container.querySelector("#budgetSelect");
    if (budgetSelect) {
      budgetSelect.addEventListener("change", function () {
        handleBudgetChange();
      });
    }
  }

  // Helper function to parse budget range
  function parseBudgetRange(rangeString) {
    if (!rangeString || rangeString === "all") {
      return { min: 0, max: Number.MAX_VALUE };
    }

    const parts = rangeString.split("-");
    if (parts.length !== 2) {
      return { min: 0, max: Number.MAX_VALUE };
    }

    const min = parseInt(parts[0]) || 0;
    const max = parseInt(parts[1]) || Number.MAX_VALUE;

    return { min, max };
  }

  // Helper function to check if project budget falls within range
  function isProjectInBudgetRange(projectBudget, budgetRange) {
    const budget = parseInt(projectBudget) || 0;
    const range = parseBudgetRange(budgetRange);
    return budget >= range.min && budget <= range.max;
  }

  
  function initializeCarousel(projects) {
    console.log("Initializing carousel with projects:", projects.length);

    if (!projects || projects.length === 0) {
      displayNoProjects();
      return;
    }

    slidesPerView = getSlidesPerView();

    // ALWAYS use carousel layout for consistency
    // Remove the condition that switches to simple grid
    totalSlides = Math.ceil(projects.length / slidesPerView);
    currentSlide = 0;

    const carouselHTML = createCarouselHTML(projects);
    projectList.innerHTML = carouselHTML;

    setTimeout(function () {
      updateSlideWidths();
      updateCarouselPosition();
      addCarouselEventListeners();
      addTouchSupport();

      // Only start auto-play if there are multiple slides
      if (totalSlides > 1) {
        startAutoPlay();
      }

      updateIndicators();
    }, 100);
  }

  
  function createCarouselHTML(projects) {
    let slidesHTML = "";

    projects.forEach(function (project, index) {
      slidesHTML += `
            <div class="carousel-slide" role="listitem" aria-label="Project ${
              index + 1
            }">
                ${createProjectCard(project)}
            </div>
        `;
    });

    let indicatorsHTML = "";
    // Only show indicators if there are multiple slides
    if (totalSlides > 1) {
      for (let i = 0; i < totalSlides; i++) {
        const activeClass = i === 0 ? "active" : "";
        indicatorsHTML += `
                <div class="carousel-indicator ${activeClass}" 
                     data-slide="${i}" 
                     role="button" 
                     aria-label="Go to slide ${i + 1}"
                     tabindex="0">
                </div>`;
      }
    }

    // Show controls only if there are multiple slides
    const showControls = totalSlides > 1;

    return `
        <div class="projectcarousel-container" role="region" aria-label="Project Carousel" tabindex="0">
            <div class="carousel-wrapper">
                ${
                  showControls
                    ? `
                    <button class="carousel-controls carousel-prev" id="prevBtn" aria-label="Previous project">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <button class="carousel-controls carousel-next" id="nextBtn" aria-label="Next project">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                `
                    : ""
                }
                <div class="carousel-track" id="carouselTrack" role="list">
                    ${slidesHTML}
                </div>
            </div>
            ${
              showControls && indicatorsHTML
                ? `
                <div class="carousel-indicators" id="carouselIndicators" role="group" aria-label="Carousel navigation">
                    ${indicatorsHTML}
                </div>
            `
                : ""
            }
        </div>
    `;
  }

  function addCarouselEventListeners() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const indicators = document.querySelectorAll(".carousel-indicator");

    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        previousSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        nextSlide();
      });
    }

    indicators.forEach(function (indicator, index) {
      indicator.addEventListener("click", function () {
        goToSlide(index);
      });
    });
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
    } else {
      currentSlide = 0;
    }
    updateCarouselPosition();
  }

  function previousSlide() {
    if (currentSlide > 0) {
      currentSlide--;
    } else {
      currentSlide = totalSlides - 1;
    }
    updateCarouselPosition();
  }

  function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarouselPosition();
  }

 
  function updateCarouselPosition() {
    const track = document.getElementById("carouselTrack");
    if (track) {
      const slides = track.querySelectorAll(".carousel-slide");

      // Add class for single project styling
      if (slides.length === 1) {
        track.classList.add("single-project");
      } else {
        track.classList.remove("single-project");
      }

      // Only translate if there are multiple slides
      if (totalSlides > 1) {
        const translateX = -(currentSlide * (100 / slidesPerView));
        track.style.transform = `translateX(${translateX}%)`;
      } else {
        track.style.transform = "translateX(0%)";
      }
    }
    updateIndicators();
  }
  function updateIndicators() {
    const indicators = document.querySelectorAll(".carousel-indicator");
    indicators.forEach(function (indicator, index) {
      indicator.classList.toggle("active", index === currentSlide);
    });
  }

  function updateSlideWidths() {
    const slides = document.querySelectorAll(".carousel-slide");
    const width = 100 / slidesPerView + "%";

    slides.forEach(function (slide) {
      slide.style.flex = `0 0 ${width}`;
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides > 1) {
      autoSlideInterval = setInterval(function () {
        nextSlide();
      }, 4000);

      const carouselWrapper = document.querySelector(".carousel-wrapper");
      if (carouselWrapper) {
        carouselWrapper.addEventListener("mouseenter", function () {
          stopAutoPlay();
        });

        carouselWrapper.addEventListener("mouseleave", function () {
          startAutoPlay();
        });
      }
    }
  }

  function stopAutoPlay() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
  }

  // Touch support
  function addTouchSupport() {
    const carouselWrapper = document.querySelector(".carousel-wrapper");
    if (!carouselWrapper) return;

    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    carouselWrapper.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
        stopAutoPlay();
      },
      { passive: true }
    );

    carouselWrapper.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging) return;
        e.preventDefault();
      },
      { passive: false }
    );

    carouselWrapper.addEventListener(
      "touchend",
      function (e) {
        if (!isDragging) return;

        touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
          if (swipeDistance > 0) {
            nextSlide();
          } else {
            previousSlide();
          }
        }

        isDragging = false;
        startAutoPlay();
      },
      { passive: true }
    );
  }

  // Filter handling functions
  function handleCategoryButtonChange(categoryId) {
    const budgetSelect = document.querySelector("#budgetSelect");
    const selectedBudget = budgetSelect ? budgetSelect.value : "all";

    showLoading();

    if (categoryId === "all" && selectedBudget === "all") {
      loadProjects();
    } else if (categoryId !== "all" && selectedBudget === "all") {
      loadProjectsByCategory(categoryId);
    } else if (categoryId === "all" && selectedBudget !== "all") {
      loadProjectsByBudgetRange(selectedBudget);
    } else {
      loadProjectsByCategoryAndBudgetRange(categoryId, selectedBudget);
    }
  }

  function handleBudgetChange() {
    const activeButton = document.querySelector(".category-btn.active");
    const selectedCategory = activeButton
      ? activeButton.dataset.category
      : "all";

    const budgetSelect = document.querySelector("#budgetSelect");
    const selectedBudget = budgetSelect ? budgetSelect.value : "all";

    showLoading();

    if (selectedCategory === "all" && selectedBudget === "all") {
      loadProjects();
    } else if (selectedCategory !== "all" && selectedBudget === "all") {
      loadProjectsByCategory(selectedCategory);
    } else if (selectedCategory === "all" && selectedBudget !== "all") {
      loadProjectsByBudgetRange(selectedBudget);
    } else {
      loadProjectsByCategoryAndBudgetRange(selectedCategory, selectedBudget);
    }
  }

  // API functions
  function loadProjects() {
    console.log("Loading all projects...");
    ProjectService.listAll(0, 100)
      .then(function (response) {
        if (
          response &&
          response.status === 200 &&
          response.data &&
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          const activeProjects = filterActiveProjects(response.data.content);
          console.log("Active projects found:", activeProjects.length);
          initializeCarousel(activeProjects);
        } else {
          console.log("No valid data in response");
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects:", error);
        displayNoProjects();
      });
  }

  function loadProjectsByCategory(categoryId) {
    ProjectService.projectbycategry(categoryId)
      .then(function (response) {
        if (response && response.status === 200 && response.data) {
          let projectsArray = [];
          if (response.data.content && Array.isArray(response.data.content)) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }

          if (projectsArray.length > 0) {
            const activeProjects = filterActiveProjects(projectsArray);
            initializeCarousel(activeProjects);
          } else {
            displayNoProjects();
          }
        } else {
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects by category:", error);
        displayNoProjects();
      });
  }

  // Updated function to handle budget ranges
  function loadProjectsByBudgetRange(budgetRange) {
    // Get all projects and filter by budget range on client side
    ProjectService.listAll(0, 1000)
      .then(function (response) {
        if (response && response.status === 200) {
          let projectsArray = [];
          if (
            response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }

          if (projectsArray.length > 0) {
            // Filter by budget range and active status
            const filteredProjects = projectsArray.filter(function (project) {
              const isActive =
                project.projectStatus === "Proposed" ||
                project.projectStatus === "Ongoing";
              const matchesBudgetRange = isProjectInBudgetRange(
                project.projectBudget,
                budgetRange
              );
              return isActive && matchesBudgetRange;
            });

            if (filteredProjects.length > 0) {
              initializeCarousel(filteredProjects);
            } else {
              displayNoProjects();
            }
          } else {
            displayNoProjects();
          }
        } else {
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects by budget range:", error);
        displayNoProjects();
      });
  }

  // Updated function to handle both category and budget range
  function loadProjectsByCategoryAndBudgetRange(categoryId, budgetRange) {
    console.log(
      "Loading projects with Category:",
      categoryId,
      "Budget Range:",
      budgetRange
    );

    ProjectService.projectbycategry(categoryId)
      .then(function (response) {
        let projectsArray = [];
        if (response && response.status === 200 && response.data) {
          if (response.data.content && Array.isArray(response.data.content)) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }
        }

        console.log("Projects from category API:", projectsArray.length);

        if (projectsArray.length > 0) {
          // Filter by budget range and active status
          const filteredProjects = projectsArray.filter(function (project) {
            const isActive =
              project.projectStatus === "Proposed" ||
              project.projectStatus === "Ongoing";
            const matchesBudgetRange = isProjectInBudgetRange(
              project.projectBudget,
              budgetRange
            );

            console.log(
              `${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Active: ${isActive}, Budget Range Match: ${matchesBudgetRange}`
            );

            return isActive && matchesBudgetRange;
          });

          console.log("Final filtered projects:", filteredProjects.length);

          if (filteredProjects.length > 0) {
            initializeCarousel(filteredProjects);
          } else {
            displayNoProjectsWithDetails(categoryId, budgetRange);
          }
        } else {
          displayNoProjectsWithDetails(categoryId, budgetRange);
        }
      })
      .catch(function (error) {
        console.error("Error loading projects:", error);
        displayNoProjectsWithDetails(categoryId, budgetRange);
      });
  }

  function filterActiveProjects(projects) {
    if (!Array.isArray(projects)) {
      return [];
    }

    const activeProjects = projects.filter(function (project) {
      const isProposed = project.projectStatus === "Proposed";
      const isOngoing = project.projectStatus === "Ongoing";
      return isProposed || isOngoing;
    });

    console.log(
      "Filtered active projects:",
      activeProjects.length,
      "from",
      projects.length
    );
    return activeProjects;
  }

  function createProjectCard(project) {
    const budget = project.projectBudget
      ? "₹" + Number(project.projectBudget).toLocaleString("en-IN")
      : "Budget not specified";
    const title =
      project.projectName || project.projectTitle || "Untitled Project";
    const description =
      project.projectShortDescription ||
      project.projectDescription ||
      "No description available";
    const category = getCategoryName(project.categoryId) || "Uncategorized";
    const mainImage =
      project.projectMainImage ||
      "https://via.placeholder.com/300x200?text=No+Image";
    const projectId = project.projectId || project.id || 0;
    const raisedAmount = project.raisedAmount || 0;
    const progressPercentage = project.projectBudget
      ? ((raisedAmount / project.projectBudget) * 100).toFixed(1)
      : 0;

    const statusDisplay = project.projectStatus || "Unknown";
    const statusClass = getStatusClass(project.projectStatus);

    return `
            <div class="card" data-project-id="${projectId}">
                <div class="status-badge ${statusClass}">
                    ${statusDisplay}
                </div>
                <div class="placeholder" style="height: 200px; overflow: hidden;">
                    <img src="${mainImage}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'height: 200px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #6b7280;\\'>No Image Available</div>';">
                </div>
                <div class="card-content" style="padding: 20px;">
                    <div class="tag" style="background: #e5f3ff; color: #0066cc; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block; margin-bottom: 10px;">${escapeHtml(
                      category
                    )}</div>
                    <h3 class="title" style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 10px 0; line-height: 1.4;  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;">${escapeHtml(
                      title
                    )}</h3>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px; line-height: 1.5;    height: 55px;
">${escapeHtml(
                      description.substring(0, 100)
                    )}${description.length > 100 ? "..." : ""}</p>
                    <div class="cost" style="color: #059669; font-weight: 600; margin-bottom: 15px;">
                        Funding Required: ${budget}
                    </div>
                    ${
                      raisedAmount > 0
                        ? `
                        <div class="donate-progress" style="margin-bottom: 15px;">
                            <div class="progress-info" style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                                <span>₹${Number(raisedAmount).toLocaleString(
                                  "en-IN"
                                )} raised</span>
                                <span>${progressPercentage}%</span>
                            </div>
                            <div class="progress-bar" style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                                <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); width: ${Math.min(
                                  progressPercentage,
                                  100
                                )}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    <a class="view-link view-more-btn" href="./donatenow.html?id=${projectId}" style="display: inline-block;  background: linear-gradient(135deg, #3b82f6 0%, #1059b0 100%); border-radius: 8px; text-decoration: none; font-weight: 500; text-align: center; transition: all 0.3s ease;" ">View Details</a>
                </div>
            </div>
        `;
  }

  function getStatusClass(status) {
    switch (status) {
      case "Proposed":
        return "status-proposed";
      case "Ongoing":
        return "status-ongoing";
      case "Completed":
        return "status-completed";
      case "On Hold":
        return "status-onhold";
      default:
        return "status-unknown";
    }
  }

  function getCategoryName(categoryId) {
    const categories = {
      1: "Health",
      2: "Environment",
      3: "Education",
      4: "Infrastructure",
      5: "Social",
    };
    return categories[categoryId] || "Uncategorized";
  }

  function escapeHtml(text) {
    if (typeof text !== "string") return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Enhanced no projects display with filter details
  function displayNoProjectsWithDetails(categoryId, budgetRange) {
    const categoryName =
      getCategoryName(parseInt(categoryId)) || "Selected Category";
    const budgetDisplay =
      budgetRange !== "all" ? budgetRange.replace("-", " - ₹") : "All Budgets";

    stopAutoPlay();
    projectList.innerHTML = `
            <div class="carousel-no-results">
                <i class="fas fa-filter" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
                <h3 style="color: #374151; margin-bottom: 10px;">No Projects Found</h3>
                <p style="color: #6b7280; margin-bottom: 15px; text-align: center; max-width: 400px;">
                    No active projects found for <strong>${categoryName}</strong> in budget range <strong>₹${budgetDisplay}</strong>
                </p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
                    <button onclick="clearBudgetFilter()" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">Clear Budget Filter</button>
                    <button onclick="clearCategoryFilter()" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">Clear Category Filter</button>
                    <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">Reset All Filters</button>
                </div>
            </div>
        `;
  }

  function displayNoProjects() {
    stopAutoPlay();
    projectList.innerHTML = `
            <div class="carousel-no-results">
                <i class="fas fa-search" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
                <h3 style="color: #374151; margin-bottom: 10px;">No Active Projects Found</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">No active projects (Proposed or Ongoing) match your current filter criteria.</p>
                <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">Reset Filters</button>
            </div>
        `;
  }

  function showLoading() {
    stopAutoPlay();
    projectList.innerHTML = `
            <div class="carousel-loading">
                <div class="loading-spinner"></div>
                <p style="color: #6b7280; font-size: 16px;">Loading amazing projects...</p>
            </div>
        `;
  }

  // Helper functions for partial filter clearing
  window.clearBudgetFilter = function () {
    const budgetSelect = document.querySelector("#budgetSelect");
    if (budgetSelect) {
      budgetSelect.value = "all";
    }

    const activeButton = document.querySelector(".category-btn.active");
    const selectedCategory = activeButton
      ? activeButton.dataset.category
      : "all";

    if (selectedCategory === "all") {
      loadProjects();
    } else {
      loadProjectsByCategory(selectedCategory);
    }
  };

  window.clearCategoryFilter = function () {
    const container = document.querySelector(".category-filter-container");
    if (container) {
      container.querySelectorAll(".category-btn").forEach(function (btn) {
        btn.classList.remove("active");
        if (btn.dataset.category === "all") {
          btn.classList.add("active");
        }
      });
    }

    const budgetSelect = document.querySelector("#budgetSelect");
    const selectedBudget = budgetSelect ? budgetSelect.value : "all";

    if (selectedBudget === "all") {
      loadProjects();
    } else {
      loadProjectsByBudgetRange(selectedBudget);
    }
  };

  // Global reset function
  window.resetFilters = function () {
    const container = document.querySelector(".category-filter-container");
    if (container) {
      container.querySelectorAll(".category-btn").forEach(function (btn) {
        btn.classList.remove("active");
        if (btn.dataset.category === "all") {
          btn.classList.add("active");
        }
      });

      const budgetSelect = container.querySelector("#budgetSelect");
      if (budgetSelect) {
        budgetSelect.value = "all";
      }
    }

    loadProjects();
  };

  // Enhanced responsive handling
  function handleResponsiveChanges() {
    const newSlidesPerView = getSlidesPerView();
    if (newSlidesPerView !== slidesPerView) {
      slidesPerView = newSlidesPerView;

      const slides = document.querySelectorAll(".carousel-slide");
      if (slides.length > 0) {
        totalSlides = Math.ceil(slides.length / slidesPerView);

        if (currentSlide >= totalSlides) {
          currentSlide = Math.max(0, totalSlides - 1);
        }

        updateCarouselPosition();
        updateIndicators();
        updateSlideWidths();
      }
    }
  }

  // Enhanced window resize handler with debouncing
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      handleResponsiveChanges();
    }, 250);
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", function () {
    stopAutoPlay();
  });
});

// Helper function to format budget range display
function formatBudgetRange(rangeString) {
  if (!rangeString || rangeString === "all") {
    return "All Budgets";
  }

  const parts = rangeString.split("-");
  if (parts.length !== 2) {
    return rangeString;
  }

  const min = parseInt(parts[0]);
  const max = parseInt(parts[1]);

  const formatAmount = (amount) => {
    if (amount >= 10000000) {
      return (
        "₹" +
        (amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1) +
        " Crore"
      );
    } else if (amount >= 100000) {
      return (
        "₹" + (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1) + " Lakh"
      );
    } else if (amount >= 1000) {
      return "₹" + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + "K";
    } else {
      return "₹" + amount.toLocaleString("en-IN");
    }
  };

  return `${formatAmount(min)} - ${formatAmount(max)}`;
}

// Prevent form submission on Enter key
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    e.target.tagName !== "BUTTON" &&
    e.target.tagName !== "A"
  ) {
    e.preventDefault();
  }
});
