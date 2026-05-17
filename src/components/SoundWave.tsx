import { motion } from "framer-motion";

const BAR_COUNT = 48;

/**
 * SoundWave renders an elegant visual animated audio wave bar representation.
 */
const SoundWave = () => {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = BAR_COUNT / 2;
    const distFromCenter = Math.abs(i - center) / center;
    // Create a natural wave envelope — taller in center, shorter at edges
    const maxHeight = 60 * (1 - distFromCenter * 0.7);
    const minHeight = 6 + Math.random() * 4;
    const duration = 1.2 + Math.random() * 1.4;
    const delay = i * 0.04 + Math.random() * 0.3;

    return { maxHeight, minHeight, duration, delay };
  });

  return (
    <div className="w-full flex items-center justify-center pointer-events-none select-none py-6">
      <div className="flex items-center gap-[3px] h-20">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full sound-wave-bar"
            initial={{ height: bar.minHeight }}
            animate={{
              height: [bar.minHeight, bar.maxHeight, bar.minHeight * 1.5, bar.maxHeight * 0.7, bar.minHeight],
            }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bar.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SoundWave;
