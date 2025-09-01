import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import App from "./App";
import "./index.css";
import "./styles/theme.css";

// Ensure dark mode is always applied
document.documentElement.classList.add("dark");

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

createRoot(document.getElementById("root")!).render(<App />);
