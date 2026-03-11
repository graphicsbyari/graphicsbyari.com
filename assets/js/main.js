(function () {
  const fallbackImages = {
    homeHero: "assets/images/home-hero.png",
    aboutHero: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80",
    servicesHero: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=2000&q=80",
    contactHero: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=2000&q=80",
    aboutPreview: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
    caseStudy1: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    caseStudy2: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80",
    caseStudy3: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    serviceBranding: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1400&q=80",
    serviceContent: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    serviceSocial: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80",
    productionDays: "https://images.unsplash.com/photo-1593697821028-7f0d6f85f685?auto=format&fit=crop&w=1400&q=80"
  };

  function loadImages() {
    return fetch("assets/data/site-images.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Image manifest not found");
        }
        return response.json();
      })
      .catch(function () {
        return fallbackImages;
      });
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
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form || !status) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = "Thanks for reaching out. Your inquiry has been received and Graphics by Ari will follow up soon.";
      form.reset();
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
    initContactForm();
    setYear();
    initScrollAnimations();

    loadImages().then(function (imageMap) {
      applyImages(imageMap || fallbackImages);
    });
  });
})();
