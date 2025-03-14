import { useEffect, useRef, useState } from "react";

const CameraFeed = ({ onPrediction }) => {
  const videoRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [wsStatus, setWsStatus] = useState('disconnected');

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/asl-translate/");
    setWs(socket);
    
    socket.onopen = () => setWsStatus('connected');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onPrediction(data);
    };
    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus('disconnected');
    };
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsStatus('error');
    };

    return () => socket.close();
  }, [onPrediction]);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
      setError(null);
    } catch (error) {
      setError("Camera access denied. Please enable camera permissions.");
      console.error("Error accessing webcam", error);
    }
    setIsLoading(false);
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsTranslating(false);
  };

  useEffect(() => {
    let interval;
    if (isTranslating && isStreaming) {
      interval = setInterval(captureFrame, 1000);
    }
    return () => clearInterval(interval);
  }, [isTranslating, isStreaming, ws]);

  const captureFrame = () => {
    if (!videoRef.current || !ws) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 224;
    canvas.height = 224;
    context.drawImage(videoRef.current, 0, 0, 224, 224);

    canvas.toBlob((blob) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(blob);
      }
    }, "image/jpeg");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
            <p className="text-red-500 text-center px-4">{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          {!isStreaming ? (
            <button
              onClick={startCamera}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Stop Camera
            </button>
          )}
          {isStreaming && (
            <button
              onClick={() => setIsTranslating(!isTranslating)}
              className={`px-4 py-2 rounded-lg ${
                isTranslating
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isTranslating ? "Pause Translation" : "Start Translation"}
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            wsStatus === 'connected' 
              ? isTranslating ? "bg-green-500 animate-pulse" : "bg-blue-500"
              : wsStatus === 'error' ? "bg-red-500" : "bg-gray-300"
          }`}></div>
          <span className="text-sm text-gray-600">
            {isTranslating ? "Translating" : wsStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;
