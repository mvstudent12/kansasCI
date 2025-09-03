document.addEventListener("DOMContentLoaded", () => {
  (function () {
    "use strict";

    /**
     * Apply .scrolled class to body as page scrolls
     */
    function toggleScrolled() {
      const selectBody = document.body;
      const selectHeader = document.querySelector("#header");
      if (!selectHeader) return;

      if (
        !selectHeader.classList.contains("scroll-up-sticky") &&
        !selectHeader.classList.contains("sticky-top") &&
        !selectHeader.classList.contains("fixed-top")
      )
        return;

      window.scrollY > 100
        ? selectBody.classList.add("scrolled")
        : selectBody.classList.remove("scrolled");
    }

    window.addEventListener("scroll", toggleScrolled);
    window.addEventListener("load", toggleScrolled);

    /**
     * Mobile nav toggle
     */
    const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");
    if (mobileNavToggleBtn) {
      function mobileNavToggle() {
        document.body.classList.toggle("mobile-nav-active");
        mobileNavToggleBtn.classList.toggle("bi-list");
        mobileNavToggleBtn.classList.toggle("bi-x");
      }

      mobileNavToggleBtn.addEventListener("click", mobileNavToggle);

      // Hide mobile nav on same-page/hash links
      document.querySelectorAll("#navmenu a").forEach((navmenu) => {
        navmenu.addEventListener("click", () => {
          if (document.body.classList.contains("mobile-nav-active")) {
            mobileNavToggle();
          }
        });
      });

      // Toggle mobile nav dropdowns
      document
        .querySelectorAll(".navmenu .toggle-dropdown")
        .forEach((navmenu) => {
          navmenu.addEventListener("click", function (e) {
            e.preventDefault();
            this.parentNode.classList.toggle("active");
            const next = this.parentNode.nextElementSibling;
            if (next) next.classList.toggle("dropdown-active");
            e.stopImmediatePropagation();
          });
        });
    }

    /**
     * Preloader
     */
    const preloader = document.querySelector("#preloader");
    if (preloader) {
      window.addEventListener("load", () => {
        preloader.remove();
      });
    }

    /**
     * Scroll top button
     */
    const scrollTop = document.querySelector(".scroll-top");
    if (scrollTop) {
      scrollTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      function toggleScrollTop() {
        window.scrollY > 100
          ? scrollTop.classList.add("active")
          : scrollTop.classList.remove("active");
      }

      window.addEventListener("load", toggleScrollTop);
      window.addEventListener("scroll", toggleScrollTop);
    }

    /**
     * Animation on scroll
     */
    function aosInit() {
      if (typeof AOS !== "undefined") {
        AOS.init({
          duration: 600,
          easing: "ease-in-out",
          once: true,
          mirror: false,
        });
      }
    }
    window.addEventListener("load", aosInit);

    /**
     * Init isotope layout and filters
     */
    document.querySelectorAll(".isotope-layout").forEach((isotopeItem) => {
      const layout = isotopeItem.getAttribute("data-layout") ?? "masonry";
      const filter = isotopeItem.getAttribute("data-default-filter") ?? "*";
      const sort = isotopeItem.getAttribute("data-sort") ?? "original-order";

      const container = isotopeItem.querySelector(".isotope-container");
      if (!container) return;

      let initIsotope;
      if (typeof imagesLoaded !== "undefined") {
        imagesLoaded(container, () => {
          if (typeof Isotope !== "undefined") {
            initIsotope = new Isotope(container, {
              itemSelector: ".isotope-item",
              layoutMode: layout,
              filter: filter,
              sortBy: sort,
            });
          }
        });
      }

      isotopeItem.querySelectorAll(".isotope-filters li").forEach((filters) => {
        filters.addEventListener("click", () => {
          const active = isotopeItem.querySelector(
            ".isotope-filters .filter-active"
          );
          if (active) active.classList.remove("filter-active");

          filters.classList.add("filter-active");
          if (initIsotope) {
            initIsotope.arrange({
              filter: filters.getAttribute("data-filter"),
            });
          }

          if (typeof aosInit === "function") {
            aosInit();
          }
        });
      });
    });

    /**
     * Init Swiper sliders
     */
    function initSwiper() {
      document.querySelectorAll(".init-swiper").forEach((swiperElement) => {
        const configElement = swiperElement.querySelector(".swiper-config");
        if (!configElement) return;

        const config = JSON.parse(configElement.innerHTML.trim());
        if (swiperElement.classList.contains("swiper-tab")) {
          if (typeof initSwiperWithCustomPagination === "function") {
            initSwiperWithCustomPagination(swiperElement, config);
          }
        } else if (typeof Swiper !== "undefined") {
          new Swiper(swiperElement, config);
        }
      });
    }
    window.addEventListener("load", initSwiper);

    /**
     * Initiate Pure Counter
     */
    if (typeof PureCounter !== "undefined") {
      new PureCounter();
    }
  })();
});
