"use client";
import * as React from "react";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

// Utility function to replace cn
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const radius = 100;
  const [visible, setVisible] = React.useState(false);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            rgba(0, 139, 139, 0.3),
            transparent 80%
          )
        `
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="p-[2px] rounded-lg transition duration-300 group/input relative"
    >
      <input
        type={type}
        className={cn(
          `flex h-10 w-full border-none bg-black/20 text-white rounded-md px-3 py-2 text-sm
          placeholder:text-neutral-400
          focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-[#008B8B]
          disabled:cursor-not-allowed disabled:opacity-50
          group-hover/input:shadow-none transition duration-400`,
          className
        )}
        ref={ref}
        {...props}
      />
    </motion.div>
  );
});

Input.displayName = "Input";

export { Input };
