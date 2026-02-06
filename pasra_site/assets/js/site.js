const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

const sections = Array.from(document.querySelectorAll("main section"));
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach((section) => observer.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

const revealables = document.querySelectorAll(".card, .step-card, .timeline-item, .hero-card");
revealables.forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});
