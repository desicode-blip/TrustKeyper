import React from "react";
import { Building2 } from "lucide-react";

type PropertyImageGalleryProps = {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function PropertyImageGallery({ images, selectedIndex, onSelect }: PropertyImageGalleryProps) {
  const hasImages = images.length > 0;
  const count = hasImages ? images.length : 1;

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-gray-100"
        style={{ aspectRatio: "16 / 9", maxHeight: 360 }}
      >
        {hasImages ? (
          <img
            src={images[selectedIndex]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <Building2 size={48} className="mb-2 opacity-40" />
            <p className="text-sm font-medium">No photos uploaded</p>
          </div>
        )}
        {hasImages && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {selectedIndex + 1} / {count}
          </span>
        )}
      </div>
      {hasImages && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => onSelect(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 transition-all ${
                selectedIndex === i ? "ring-2 ring-primary ring-offset-1" : "opacity-75 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
