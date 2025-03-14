import { useState } from "react";
import CameraFeed from "./components/CameraFeed";
import SignTranslation from "./components/SignTranslation";

function App() {
  const [prediction, setPrediction] = useState({ label: "None", confidence: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-600 mb-8 drop-shadow-sm">
          Sign Language Translator
        </h1>
        <div className="grid md:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          <CameraFeed onPrediction={setPrediction} />
          <SignTranslation prediction={prediction} />
        </div>
      </div>
    </div>
  );
}

export default App;
