import { useAtom } from 'jotai';
import { ImageSrcAtom, LabelsAtom } from '../atoms';
import { Label } from './Label';
import { useEffect, useRef, useState, useCallback } from 'react';

export function ImageDisplay() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [labels] = useAtom(LabelsAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // 计算图片显示尺寸
  const updateDimensions = useCallback(() => {
    if (!imageRef.current || !containerRef.current || !imageLoaded) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let displayWidth, displayHeight;
    
    if (imageAspectRatio > containerAspectRatio) {
      displayWidth = containerWidth;
      displayHeight = containerWidth / imageAspectRatio;
    } else {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imageAspectRatio;
    }

    console.log('Updating dimensions:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      containerWidth,
      containerHeight,
      displayWidth,
      displayHeight,
      imageLoaded
    });

    setDimensions({
      width: displayWidth,
      height: displayHeight
    });
  }, [imageLoaded]);

  // 监听图片加载
  useEffect(() => {
    if (imageSrc) {
      setImageLoaded(false);
      setDimensions({ width: 0, height: 0 });
      setOriginalSize({ width: 0, height: 0 });
    }
  }, [imageSrc]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateDimensions);
    };

    if (imageLoaded) {
      updateDimensions();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, updateDimensions]);

  if (!imageSrc) {
    return (
      <div className="w-full h-[600px] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500">
        请先上传图片
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[600px] border-2 border-gray-600 rounded-lg overflow-hidden bg-gray-900"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Uploaded"
          className="max-w-full max-h-full object-contain"
          style={{ 
            width: dimensions.width || 'auto',
            height: dimensions.height || 'auto'
          }}
          onLoad={(e) => {
            const img = e.currentTarget;
            console.log('Image loaded, calculating dimensions...', {
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight
            });
            setOriginalSize({
              width: img.naturalWidth,
              height: img.naturalHeight
            });
            setImageLoaded(true);
            requestAnimationFrame(updateDimensions);
          }}
        />
        {imageLoaded && dimensions.width > 0 && dimensions.height > 0 && labels.map((label) => {
          console.log('Rendering label:', {
            label,
            containerDimensions: {
              width: containerRef.current?.clientWidth || 600,
              height: containerRef.current?.clientHeight || 600
            },
            imageDimensions: dimensions,
            originalSize
          });
          return (
            <Label
              key={label.id}
              {...label}
              containerDimensions={{
                width: containerRef.current?.clientWidth || 600,
                height: containerRef.current?.clientHeight || 600
              }}
              imageDimensions={dimensions}
              originalImageSize={originalSize}
            />
          );
        })}
      </div>
    </div>
  );
} 