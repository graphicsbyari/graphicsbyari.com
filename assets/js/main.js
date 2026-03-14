(function () {
  const fallbackImages = {
    homeHero: "assets/images/home-hero.png",
    aboutHero: "assets/uploads/graphicsbyari-com-website-banners-1-1773124209428.png",
    servicesHero: "assets/uploads/graphicsbyari-com-website-banners-2-1773124749392.png",
    contactHero: "assets/uploads/graphicsbyari-com-website-banners-3-1773126194612.png",
    aboutPreview: "assets/uploads/untitled1371_20260310021230-png-1773123784752.png",
    caseStudy1: "assets/uploads/img_3743-jpg-1773120929496.jpg",
    caseStudy2: "assets/uploads/db-behance-1773120996926.png",
    caseStudy3: "assets/uploads/rebecca-b-cover-1773121730688.png",
    serviceBranding: "assets/uploads/_cover-1-1773125232073.png",
    serviceContent: "assets/uploads/_cover-1773124952760.png",
    serviceSocial: "assets/uploads/ingmar-r7dxww7fyh8-unsplash-1773125919132.jpg",
    productionDays: "assets/uploads/07cd35e8-5fa4-4789-bf10-cfef565f3343-1773120225835.jpg"
  };

  function loadImages() {
    return Promise.resolve(fallbackImages);
  }

  function applyImages(imageMap) {
    document.querySelectorAll("[data-image-key]").forEach(function (node) {
      const key = node.getAttribute("data-image-key");
      const src = imageMap[key] || fallbackImages[key];
      if (!src) {
        return;
      }

      if (node.getAttribute("data-image-type") === "background") {
        node.style.backgroundImage = "url('" + src + "')";
        node.setAttribute("data-image-loaded", "true");
      } else if (node.tagName.toLowerCase() === "img") {
        node.src = src;
      }
    });
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    const checkbox = document.querySelector(".nav-toggle-input");
    if (!toggle || !nav) {
      return;
    }

    function syncState() {
      const isOpen = checkbox ? checkbox.checked : nav.classList.contains("open");
      nav.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    if (checkbox) {
      checkbox.addEventListener("change", syncState);
      syncState();
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      syncState();
    });
  }


  function setYear() {
    const node = document.getElementById("year");
    if (node) {
      node.textContent = String(new Date().getFullYear());
    }
  }

  function initScrollAnimations() {
    const targets = new Set();

    function addTargets(selector) {
      document.querySelectorAll(selector).forEach(function (node) {
        if (node.classList.contains("hero")) {
          return;
        }
        targets.add(node);
      });
    }

    addTargets("main > section");
    addTargets(".grid-3 > *");
    addTargets(".testimonial-grid > *");
    addTargets(".service-list > *");
    addTargets(".contact-layout > *");
    addTargets(".about-preview > *");
    addTargets(".site-footer .footer-grid > *");

    const staggerGroups = [
      ".grid-3 > *",
      ".testimonial-grid > *",
      ".service-list > *",
      ".contact-layout > *",
      ".about-preview > *",
      ".site-footer .footer-grid > *"
    ];

    staggerGroups.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (node, index) {
        node.style.transitionDelay = String(index * 70) + "ms";
      });
    });

    const revealItems = Array.from(targets);
    revealItems.forEach(function (node) {
      node.setAttribute("data-reveal", "up");
    });

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, io) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (node) {
      observer.observe(node);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    setYear();
    initScrollAnimations();

    loadImages().then(function (imageMap) {
      applyImages(imageMap || fallbackImages);
    });
  });
})();
