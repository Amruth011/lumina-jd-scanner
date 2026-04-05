import { motion } from "framer-motion";

const BAR_COUNT = 56;

const SoundWave = () => {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = BAR_COUNT / 2;
    const distFromCenter = Math.abs(i - center) / center;
    const maxHeight = 48 * (1 - distFromCenter * 0.8);
    const minHeight = 4 + Math.random() * 3;
    const duration = 1.0 + Math.random() * 1.2;
    const delay = i * 0.035 + Math.random() * 0.2;

    return { maxHeight, minHeight, duration, delay };
  });

  return (
    <div className="w-full flex items-center justify-center pointer-events-none select-none py-4">
      <div className="flex items-center gap-[2.5px] h-14">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className="w-[2.5px] rounded-full sound-wave-bar"
            initial={{ height: bar.minHeight }}
            animate={{
              height: [bar.minHeight, bar.maxHeight, bar.minHeight * 1.3, bar.maxHeight * 0.6, bar.minHeight],
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
