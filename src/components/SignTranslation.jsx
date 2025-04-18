const confidenceThreshold = 60;

const getProgressColor = (confidence) => {
  if (confidence > 80) return "bg-green-500";
  if (confidence > 50) return "bg-yellow-500";
  return "bg-red-500";
};

const SignTranslation = ({ prediction = {} }) => {
  const confidence = Math.round((prediction.confidence || 0) * 100);
  const label = confidence >= confidenceThreshold
    ? prediction.translation
    : "No sign detected";

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-700">Detected Sign</h2>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-3xl font-bold text-blue-600 break-words">
            {label}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Confidence</span>
          <span className="text-sm font-medium text-blue-600">{confidence}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(confidence)} rounded-full transition-all duration-300`}
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SignTranslation;
