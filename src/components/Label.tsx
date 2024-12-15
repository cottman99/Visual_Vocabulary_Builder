import { Label as LabelType } from '../atoms';

interface LabelProps extends LabelType {
  containerDimensions: {
    width: number;
    height: number;
  };
  imageDimensions: {
    width: number;
    height: number;
  };
}

export function Label(props: LabelProps) {
  const { 
    box_2d, 
    english, 
    chinese, 
    phonetic, 
    style, 
    originalImageSize, 
    containerDimensions, 
    imageDimensions 
  } = props;

  if (!box_2d || imageDimensions.width <= 0 || imageDimensions.height <= 0) {
    console.log('Invalid dimensions or box_2d:', { box_2d, imageDimensions });
    return null;
  }

  // 1. 解析 API 返回的坐标 [ymin, xmin, ymax, xmax]
  const [ymin, xmin, ymax, xmax] = box_2d;

  // 2. 将坐标从1000x1000空间转换到原始图片尺寸
  const originalBox = {
    x1: (xmin / 1000) * originalImageSize.width,
    y1: (ymin / 1000) * originalImageSize.height,
    x2: (xmax / 1000) * originalImageSize.width,
    y2: (ymax / 1000) * originalImageSize.height
  };

  console.log('Original image coordinates:', {
    from: [ymin, xmin, ymax, xmax],
    to: originalBox,
    originalImageSize
  });

  // 3. 计算图片在容器中的缩放和偏移
  const imageAspectRatio = originalImageSize.width / originalImageSize.height;
  const containerAspectRatio = containerDimensions.width / containerDimensions.height;

  let displayWidth, displayHeight, offsetX, offsetY;

  if (imageAspectRatio > containerAspectRatio) {
    // 图片较宽，以容器宽度为准
    displayWidth = containerDimensions.width;
    displayHeight = displayWidth / imageAspectRatio;
    offsetX = 0;
    offsetY = (containerDimensions.height - displayHeight) / 2;
  } else {
    // 图片较高，以容器高度为准
    displayHeight = containerDimensions.height;
    displayWidth = displayHeight * imageAspectRatio;
    offsetX = (containerDimensions.width - displayWidth) / 2;
    offsetY = 0;
  }

  // 4. 计算缩放比例（从原始图片尺寸到显示尺寸）
  const scale = displayWidth / originalImageSize.width;

  // 5. 转换边界框坐标到显示空间
  const convertedBox = {
    x1: Math.round(originalBox.x1 * scale + offsetX),
    y1: Math.round(originalBox.y1 * scale + offsetY),
    x2: Math.round(originalBox.x2 * scale + offsetX),
    y2: Math.round(originalBox.y2 * scale + offsetY)
  };

  // 6. 计算标签位置（边界框中心）
  const position = {
    x: Math.round((convertedBox.x1 + convertedBox.x2) / 2),
    y: Math.round((convertedBox.y1 + convertedBox.y2) / 2)
  };

  console.log('Coordinate conversion:', {
    normalized: [ymin, xmin, ymax, xmax],
    original: originalBox,
    display: convertedBox,
    position,
    scale,
    offsets: { offsetX, offsetY }
  });

  // 计算边界框样式
  const boxStyle = {
    left: `${convertedBox.x1}px`,
    top: `${convertedBox.y1}px`,
    width: `${convertedBox.x2 - convertedBox.x1}px`,
    height: `${convertedBox.y2 - convertedBox.y1}px`,
    border: `2px solid ${style.borderColor}`,
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    backgroundColor: `${style.shadingColor}1a`  // 使用 10% 的透明度
  };

  // 计算标签样式
  const labelStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)',  // 居中对齐
    backgroundColor: `${style.shadingColor}dd`,
    color: style.textColor,
    borderColor: style.borderColor,
    zIndex: 10
  };

  return (
    <>
      {/* 边界框 */}
      <div className="box absolute pointer-events-none" style={boxStyle} />
      
      {/* 标签文本 */}
      <div
        className="absolute label-box p-2 rounded border-2 bg-opacity-80 z-10 pointer-events-none whitespace-nowrap"
        style={labelStyle}
      >
        <div className="text-sm font-medium text-center">{english}</div>
        {phonetic && <div className="text-xs opacity-75 text-center font-mono">{phonetic}</div>}
        <div className="text-sm text-center">{chinese}</div>
      </div>
    </>
  );
} 