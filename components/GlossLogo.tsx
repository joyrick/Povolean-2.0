// components/GlossLogo.tsx
"use client";

import React from "react";
import Image from "next/image";

export default function GlossLogo({
  height = 60,
  width = 60,
}: {
  height?: number;
  width?: number;
  duration?: number;
}) {
  return (
    <div className="gloss-container">
      <Image
        src="/img/logo_2.png"
        alt="Your Logo"
        className="gloss-logo"
        width={width}
        height={height}
      />
      <div className="gloss-shine" />
      <style jsx>{`
        .gloss-container {
          position: relative;
          display: inline-block;
          width: ${width}px;
          height: ${height}px;
          overflow: hidden;
        }

        .gloss-logo {
          width: 100%;
          height: 100%;
          display: block;
        }

        .gloss-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: skewX(-20deg);
          animation: shine 2.5s ease-in-out infinite;
        }

        @keyframes shine {
          0% {
            left: -100%;
            opacity: 0;
          }
          50% {
            left: 100%;
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
