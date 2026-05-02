gsap.registerPlugin(ScrollTrigger);

const ease = "power3.out";

document.addEventListener("DOMContentLoaded", () => {
  gsap.set(".site-header", { y: -24, opacity: 0 });
  gsap.set(".hero .eyebrow, .hero h1, .hero-text, .hero-cta .btn", { y: 44, opacity: 0 });
  gsap.set(".gateway-card, .vehicle-card", { y: 56, opacity: 0, scale: 0.98 });

  const intro = gsap.timeline({ defaults: { ease } });

  intro
    .to(".site-header", {
      y: 0,
      opacity: 1,
      duration: 0.8
    })
    .to(".hero .eyebrow, .hero h1, .hero-text, .hero-cta .btn", {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.1
    }, "-=0.35");

  gsap.to(".hero-bg", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.to(".gateway-card", {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 1,
    stagger: 0.12,
    ease,
    scrollTrigger: {
      trigger: ".gateway",
      start: "top 75%",
      once: true
    }
  });

  gsap.to(".vehicle-card", {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.9,
    stagger: 0.08,
    ease,
    scrollTrigger: {
      trigger: ".inventory",
      start: "top 75%",
      once: true
    }
  });
});
