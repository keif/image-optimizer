import { CheckCircle2, Loader2 } from 'lucide-react';

interface Stage {
  id: string;
  label: string;
  estimatedDuration?: string;
}

interface ProgressIndicatorProps {
  stages: Stage[];
  currentStage: number;
  totalStages: number;
  message?: string;
}

export default function ProgressIndicator({
  stages,
  currentStage,
  totalStages,
  message,
}: ProgressIndicatorProps) {
  const progress = ((currentStage) / totalStages) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Processing...
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStage + 1} of {totalStages}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stages List */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isComplete = index < currentStage;
            const isCurrent = index === currentStage;
            const isUpcoming = index > currentStage;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                    : isComplete
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-purple-900 dark:text-purple-100'
                        : isComplete
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {stage.estimatedDuration && isCurrent && (
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Estimated: {stage.estimatedDuration}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Message */}
        {message && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-100">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
