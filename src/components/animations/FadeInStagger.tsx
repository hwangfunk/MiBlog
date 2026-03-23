"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface FadeInStaggerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerDelay?: number;
  initialY?: number;
  duration?: number;
}

export const FadeInStagger = ({
  children,
  staggerDelay = 0.1,
  initialY = 15,
  duration = 0.4,
  ...props
}: FadeInStaggerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const FadeInStaggerItem = ({
  children,
  ...props
}: HTMLMotionProps<"div">) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
