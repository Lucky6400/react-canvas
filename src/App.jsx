import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';
import './App.css'
import HelpBox from './components/HelpBox';
import { imageUrls } from './data/images';
import TransformerComp from './components/Transformer';

function App() {
  const [rectangles, setRectangles] = useState([]);
  const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [savedRectangles, setSavedRectangles] = useState([]);

  const handleSaveChanges = () => {
    setSavedRectangles([...rectangles]);
    setSelectedRectangleIndex(null);
  };

  useEffect(() => {
    const loadImage = (url) => {
      const image = new window.Image();
      image.src = url;
      image.onload = () => {
        setLoadedImages((prevImages) => [...prevImages, image]);
      };
    };

    imageUrls.forEach((url) => loadImage(url));
    //eslint-disable-next-line
  }, []);

  const stageRef = useRef(null);
  const drawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const rectangleRef = useRef(null);

  const handleDownloadAnnotations = () => {
    const annotations = {};
    annotations[imageUrls[currentImageIndex]] = rectangles.map((rect) => ({
      x1: rect.x,
      y1: rect.y,
      x2: rect.x + rect.width,
      y2: rect.y + rect.height,
    }));

    const jsonAnnotations = JSON.stringify(annotations, null, 2);

    const downloadLink = document.createElement('a');
    const blob = new Blob([jsonAnnotations], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'annotations.json';
    downloadLink.click();

    URL.revokeObjectURL(url);
  };

  const handleMouseDown = () => {
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    startPointRef.current = point;
    drawingRef.current = true;

    rectangleRef.current = {
      x: startPointRef.current.x,
      y: startPointRef.current.y,
      width: 0,
      height: 0,
    };
  };

  const handleMouseMove = () => {
    if (!drawingRef.current) {
      return;
    }
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const width = point.x - startPointRef.current.x;
    const height = point.y - startPointRef.current.y;

    rectangleRef.current.width = width;
    rectangleRef.current.height = height;

    stage.batchDraw();
  };

  const handleMouseUp = () => {
    if (!drawingRef.current) {
      return;
    }
    drawingRef.current = false;

    // Save the drawn rectangle to the rectangles state
    if (rectangleRef.current.width !== 0 && rectangleRef.current.height !== 0) {
      setRectangles((prevRectangles) => [...prevRectangles, { ...rectangleRef.current }]);
    }

    // Clear the rectangle reference
    rectangleRef.current = null;
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % loadedImages.length);
    setSelectedRectangleIndex(null);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? loadedImages.length - 1 : prevIndex - 1
    );
    setSelectedRectangleIndex(null);
  };

  const handleRectangleClick = (index, e) => {
    console.log(index);
    setSelectedRectangleIndex(index);
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  };

  const handleStageClick = () => {
    console.log("stage clicked");
    setSelectedRectangleIndex(null);
  };

  const handleVerticalMinus = () => {
    handleResize(0, -10);
  };

  const handleVerticalPlus = () => {
    handleResize(0, 10);
  };

  const handleHorizontalMinus = () => {
    handleResize(-10, 0);
  };

  const handleHorizontalPlus = () => {
    handleResize(10, 0);
  };

  const handleResize = (widthChange, heightChange) => {
    if (selectedRectangleIndex !== null) {
      const rects = [...rectangles];
      const selectedRect = rects[selectedRectangleIndex];
      const newWidth = selectedRect.width + widthChange;
      const newHeight = selectedRect.height + heightChange;

      if (newWidth > 0 && newHeight > 0) {
        rects[selectedRectangleIndex] = {
          ...selectedRect,
          width: newWidth,
          height: newHeight,
        };
        setRectangles(rects);
      }
    }
  };

  const handleTransformerChange = (newAttrs) => {
    const rects = [...rectangles];
    rects[selectedRectangleIndex] = {
      ...rects[selectedRectangleIndex],
      ...newAttrs,
    };
    setRectangles(rects);
  };

  const handleRemoveRectangle = () => {
    const updatedRectangles = rectangles.filter((_, index) => index !== selectedRectangleIndex);
    setRectangles(updatedRectangles);
    setSelectedRectangleIndex(null);
  };

  const handleUndoChanges = () => {
    setRectangles([...savedRectangles]);
    setSelectedRectangleIndex(null);
  };


  const renderRectangles = () => {
    return rectangles.map((rect, index) => (
      <Rect
        key={index}
        {...rect}
        stroke={selectedRectangleIndex === index ? "red" : "blue"}
        strokeWidth={2}
        onClick={(e) => handleRectangleClick(index, e)}
        draggable
      />
    ));
  };

  return (
    <div className='cont'>
      <HelpBox />
      <h1>Image Annotation Tool</h1>

      <div className="dfl g1">

        <button onClick={handlePrevImage}>Previous Image</button> {" "}
        <button onClick={handleNextImage}>Next Image</button>
        <button onClick={handleDownloadAnnotations}>Submit</button>
      </div>
      {selectedRectangleIndex !== null && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button onClick={handleVerticalMinus}>v-</button>
          <button onClick={handleVerticalPlus}>v+</button>
          <button onClick={handleHorizontalMinus}>h-</button>
          <button onClick={handleHorizontalPlus}>h+</button>
          {selectedRectangleIndex !== null && (
            <button onClick={handleRemoveRectangle}>🗑️</button>
          )}
          
          <button onClick={handleSaveChanges}>Save</button>
          <button onClick={handleUndoChanges}>Undo</button>
        </div>
      )}
      <Stage
        ref={stageRef}
        width={800}
        height={400}
        onClick={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {loadedImages.length > 0 && (
            <Image
              width={800}
              height={600}
              image={loadedImages[currentImageIndex]} />
          )}
          {renderRectangles()}
          {rectangleRef.current && (
            <Rect
              {...rectangleRef.current}
              stroke="blue"
              strokeWidth={2}
              dash={[6, 2]}
            />
          )}
          {selectedRectangleIndex !== null && (
            <TransformerComp loadedImages={loadedImages} handleTransformerChange={handleTransformerChange} currentImageIndex={currentImageIndex} />
          )}
        </Layer>
      </Stage>

    </div>
  );
}

export default App;
