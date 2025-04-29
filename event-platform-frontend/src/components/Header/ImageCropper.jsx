import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg'; // Импорт из отдельного файла

export default function ImageCropper({ imageSrc, onCropComplete, aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedImage);
  };

  return (
    <div className="relative w-full h-[400px] bg-gray-800 rounded overflow-hidden">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropCompleteInternal}
      />
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white p-2 rounded shadow">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <button
          onClick={handleDone}
          className="bg-[#CAA07D] text-white px-4 py-1 rounded"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
