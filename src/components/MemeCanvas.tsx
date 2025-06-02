
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
}

interface MemeCanvasProps {
  image: string;
  textElements: TextElement[];
  onUpdateTextElement: (id: string, updates: Partial<TextElement>) => void;
}

const MemeCanvas = forwardRef<HTMLCanvasElement, MemeCanvasProps>(({ 
  image, 
  textElements, 
  onUpdateTextElement 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedElementRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => canvasRef.current!);

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Redimensionner le canvas pour correspondre à l'image
      const maxWidth = 600;
      const maxHeight = 600;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image
      ctx.drawImage(img, 0, 0, width, height);

      // Dessiner le texte
      textElements.forEach((element) => {
        ctx.font = `${element.fontWeight} ${element.fontSize}px Arial`;
        ctx.fillStyle = element.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';

        // Contour noir pour la lisibilité
        ctx.strokeText(element.text, element.x, element.y);
        // Texte blanc par-dessus
        ctx.fillText(element.text, element.x, element.y);
      });
    };
    img.src = image;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier si on clique sur un élément de texte
    for (const element of textElements) {
      const textWidth = element.text.length * (element.fontSize * 0.6);
      const textHeight = element.fontSize;

      if (
        x >= element.x - textWidth / 2 &&
        x <= element.x + textWidth / 2 &&
        y >= element.y - textHeight &&
        y <= element.y
      ) {
        draggedElementRef.current = element.id;
        dragOffsetRef.current = {
          x: x - element.x,
          y: y - element.y
        };
        canvas.style.cursor = 'grabbing';
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !draggedElementRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffsetRef.current.x;
    const y = e.clientY - rect.top - dragOffsetRef.current.y;

    onUpdateTextElement(draggedElementRef.current, { x, y });
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    draggedElementRef.current = null;
    canvas.style.cursor = 'default';
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier si on survole un élément de texte
    let isOverText = false;
    for (const element of textElements) {
      const textWidth = element.text.length * (element.fontSize * 0.6);
      const textHeight = element.fontSize;

      if (
        x >= element.x - textWidth / 2 &&
        x <= element.x + textWidth / 2 &&
        y >= element.y - textHeight &&
        y <= element.y
      ) {
        isOverText = true;
        break;
      }
    }

    canvas.style.cursor = isOverText ? 'grab' : 'default';
  };

  useEffect(() => {
    drawMeme();
  }, [image, textElements]);

  return (
    <div ref={containerRef} className="flex justify-center">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        className="border border-gray-300 rounded-lg shadow-lg max-w-full h-auto cursor-default"
        style={{ maxHeight: '600px' }}
      />
    </div>
  );
});

MemeCanvas.displayName = 'MemeCanvas';

export default MemeCanvas;
