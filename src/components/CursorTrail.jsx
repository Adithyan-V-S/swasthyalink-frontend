import React, { useEffect, useRef } from "react";

const TRAIL_LENGTH = 8;
const TRAIL_COLOR = "bg-indigo-400/70";

const CursorTrail = () => {
  const trailRefs = useRef([]);
  const positions = useRef(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })));

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      positions.current[0] = { x: clientX, y: clientY };
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        positions.current[i] = {
          x: positions.current[i].x + (positions.current[i - 1].x - positions.current[i].x) * 0.25,
          y: positions.current[i].y + (positions.current[i - 1].y - positions.current[i].y) * 0.25,
        };
      }
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${positions.current[i].x - 8}px, ${positions.current[i].y - 8}px, 0)`;
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, i) => (
        <div
          key={i}
          ref={el => (trailRefs.current[i] = el)}
          className={`pointer-events-none fixed top-0 left-0 w-4 h-4 rounded-full ${TRAIL_COLOR} shadow-lg z-[9999] transition-transform duration-75 ease-out`}
          style={{
            opacity: 1 - i / TRAIL_LENGTH,
            filter: `blur(${i * 1.5}px)`
          }}
        />
      ))}
    </>
  );
};

export default CursorTrail; 