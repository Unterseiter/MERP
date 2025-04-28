import { useState, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageUploader = ({ onImageCropped, loading }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 16/9 });
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoaded = (img) => {
    setImage(img);
    return false;
  };

  const getCroppedImg = useCallback(() => {
    if (!image || !crop.width || !crop.height) {
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [crop, image]);

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImage(croppedImageUrl);
      onImageCropped(croppedImageBlob);
    } catch (e) {
      console.error('Ошибка при обрезке изображения', e);
    }
  };

  return (
    <div>
      <label className="block text-gray-700 mb-1">Изображение события</label>
      
      {!src ? (
        <input
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="p-2 border rounded w-full"
          disabled={loading}
        />
      ) : (
        <div className="space-y-4">
          <ReactCrop
            src={src}
            crop={crop}
            ruleOfThirds
            onImageLoaded={onImageLoaded}
            onChange={setCrop}
            className="max-h-96"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCropComplete}
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Подтвердить обрезку
            </button>
            <button
              onClick={() => setSrc(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Выбрать другое фото
            </button>
          </div>
          {croppedImage && (
            <div className="mt-4">
              <p className="text-gray-600 mb-2">Предпросмотр (16:9):</p>
              <img 
                src={croppedImage} 
                alt="Cropped preview" 
                className="w-full aspect-video object-cover border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;