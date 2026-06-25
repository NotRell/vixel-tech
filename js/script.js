const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const themeBtn = document.getElementById("themeBtn");
const backToTop = document.getElementById("backToTop");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const testimonialList = document.getElementById("testimonialList");
const testimonialForm = document.getElementById("testimonialForm");
const testimonialStatus = document.getElementById("testimonialStatus");

const savedTheme = localStorage.getItem("theme");
const TESTIMONIAL_STORAGE_KEY = "vixelTechTestimonials";
let themeAnimationTimer;

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeBtn.textContent = "\u263e";
} else {
  themeBtn.textContent = "\u2600";
}

function runThemeAnimation() {
  const rect = themeBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  document.documentElement.style.setProperty("--theme-x", `${x}px`);
  document.documentElement.style.setProperty("--theme-y", `${y}px`);

  document.body.classList.remove("theme-switching");
  themeBtn.classList.remove("is-animating");

  void document.body.offsetWidth;

  document.body.classList.add("theme-switching");
  themeBtn.classList.add("is-animating");

  clearTimeout(themeAnimationTimer);
  themeAnimationTimer = setTimeout(() => {
    document.body.classList.remove("theme-switching");
    themeBtn.classList.remove("is-animating");
  }, 760);
}

menuBtn.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

themeBtn.addEventListener("click", () => {
  runThemeAnimation();
  const isLight = document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  themeBtn.textContent = isLight ? "\u263e" : "\u2600";
});

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("is-visible", window.scrollY > 420);
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const target = Number(entry.target.dataset.counter);
      let current = 0;
      const increment = Math.max(1, Math.ceil(target / 45));

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        entry.target.textContent = target === 96 ? `${current}%` : `${current}+`;
      }, 24);

      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);

document.querySelectorAll("[data-counter]").forEach((counter) => counterObserver.observe(counter));

function showError(id, message) {
  const target = document.getElementById(id);
  if (target) {
    target.textContent = message;
  }
}

function getStoredTestimonials() {
  try {
    const savedTestimonials = JSON.parse(localStorage.getItem(TESTIMONIAL_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedTestimonials)) {
      return [];
    }

    return savedTestimonials.filter((testimonial) => {
      return testimonial && typeof testimonial.message === "string" && testimonial.message.trim().length > 0;
    });
  } catch {
    return [];
  }
}

function saveStoredTestimonials(testimonials) {
  localStorage.setItem(TESTIMONIAL_STORAGE_KEY, JSON.stringify(testimonials.slice(0, 12)));
}

function createAnonymousAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "testimonial-avatar";
  avatar.setAttribute("aria-hidden", "true");
  return avatar;
}

function createTestimonialCard(testimonial) {
  const article = document.createElement("article");
  article.className = "testimonial-card";
  article.dataset.localTestimonial = "true";

  const message = document.createElement("p");
  const name = document.createElement("h3");
  const role = document.createElement("span");

  message.textContent = `"${testimonial.message}"`;
  name.textContent = testimonial.name || "Anonymous";
  role.textContent = testimonial.role || "Pengunjung";

  article.append(createAnonymousAvatar(), message, name, role);
  return article;
}

function renderStoredTestimonials() {
  if (!testimonialList) {
    return;
  }

  testimonialList.querySelectorAll("[data-local-testimonial='true']").forEach((item) => item.remove());

  const firstStaticCard = testimonialList.firstElementChild;
  getStoredTestimonials().forEach((testimonial) => {
    testimonialList.insertBefore(createTestimonialCard(testimonial), firstStaticCard);
  });
}

renderStoredTestimonials();

if (testimonialForm) {
  testimonialForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("testimonialName").value.trim();
    const role = document.getElementById("testimonialRole").value.trim();
    const message = document.getElementById("testimonialMessage").value.trim();

    showError("testimonialMessageError", "");
    testimonialStatus.textContent = "";

    if (message.length < 10) {
      showError("testimonialMessageError", "Testimonial minimal 10 karakter.");
      testimonialStatus.textContent = "Periksa kembali testimonial yang diisi.";
      testimonialStatus.className = "form-status is-error";
      return;
    }

    const testimonials = getStoredTestimonials();
    testimonials.unshift({
      name: name.slice(0, 48) || "Anonymous",
      role: role.slice(0, 56) || "Pengunjung",
      message: message.slice(0, 220),
      createdAt: new Date().toISOString(),
    });

    saveStoredTestimonials(testimonials);
    renderStoredTestimonials();
    testimonialForm.reset();
    testimonialStatus.textContent = "Testimonial tersimpan.";
    testimonialStatus.className = "form-status is-success";
  });
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isValid = true;

  showError("nameError", "");
  showError("emailError", "");
  showError("messageError", "");
  formStatus.textContent = "";

  if (name.length < 3) {
    showError("nameError", "Nama minimal 3 karakter.");
    isValid = false;
  }

  if (!emailPattern.test(email)) {
    showError("emailError", "Masukkan email yang valid.");
    isValid = false;
  }

  if (message.length < 10) {
    showError("messageError", "Pesan minimal 10 karakter.");
    isValid = false;
  }

  if (!isValid) {
    formStatus.textContent = "Periksa kembali data yang diisi.";
    formStatus.className = "form-status is-error";
    return;
  }

  formStatus.textContent = "Pesan berhasil divalidasi. Terima kasih!";
  formStatus.className = "form-status is-success";
  contactForm.reset();
});

document.getElementById("year").textContent = new Date().getFullYear();
