function openChat() {
  alert("👋 Hello! Chat functionality coming soon...");
}

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav ul li a");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").slice(1) === id) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    {
      threshold: 0.6
    }
  );

  sections.forEach(section => observer.observe(section));
});

const form = document.getElementById('contactForm');
form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch("https://formspree.io/f/manjvnwy", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Thanks! Your message has been sent.");
      form.reset();
    } else {
      alert("Oops! Something went wrong.");
    }
  });

fetch('md/aboutme.md')
    .then(res => res.text())
    .then(md => {
      document.getElementById('about-content').innerHTML = marked.parse(md);
    })
    .catch(err => {
      document.getElementById('about-content').innerHTML = 'Failed to load content.';
      console.error(err);
    });