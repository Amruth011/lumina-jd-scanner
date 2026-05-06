import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // Global configuration
  gsap.config({
    nullTargetWarn: false,
  });
}

export { gsap, ScrollTrigger };
export default gsap;
