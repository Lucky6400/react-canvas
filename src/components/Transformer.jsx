/* eslint-disable react/prop-types */

import { Transformer } from 'react-konva';

const TransformerComp = ({ loadedImages, currentImageIndex, handleTransformerChange }) => {
    return (
        <Transformer
            ref={(node) => {
                if (node) {
                    node.getLayer().batchDraw();
                }
            }}
            draggable
            rotateEnabled={false}
            keepRatio={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={(oldBox, newBox) => {
                // Limit resizing to stay within image boundaries
                if (
                    newBox.x < 0 ||
                    newBox.y < 0 ||
                    newBox.width > loadedImages[currentImageIndex].width ||
                    newBox.height > loadedImages[currentImageIndex].height
                ) {
                    return oldBox;
                }
                return newBox;
            }}
            anchorFill="blue"
            borderDash={[6, 2]}
            borderStroke="blue"
            onTransform={handleTransformerChange}
        />
    )
}

export default TransformerComp