import React from "react";
import Image from "next/image";

interface BrickThumbnailProps {
  title: string;
  thumbnailUrl: string;
  onClick: () => void;
}

export function BrickThumbnail({
  title,
  thumbnailUrl,
  onClick,
}: BrickThumbnailProps) {
  return (
    <div
      className="sketch-border p-2 cursor-pointer transition-all hover:shadow-lg pencil-float bg-paperCream"
      onClick={onClick}
    >
      <Image
        src={thumbnailUrl}
        alt={title}
        className="rounded-sm w-full"
        width={400}
        height={225}
      />
      <p className="mt-2 text-sm relative inline-block text-charcoal">
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="100%"
            stroke="#333333"
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeDashoffset="100"
            className="animate-dash"
          />
        </svg>
        <span className="relative">{title}</span>
      </p>
    </div>
  );
}
