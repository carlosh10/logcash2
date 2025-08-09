'use client'

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function StepProgress({ currentStep, totalSteps, steps }: StepProgressProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-hermes-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="absolute -top-1 transition-all duration-300"
             style={{ left: `${(currentStep / totalSteps) * 100}%`, transform: 'translateX(-50%)' }}>
          <div className="w-4 h-4 bg-hermes-orange rounded-full border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Step Info */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-old-money-gray">Step {currentStep} of {totalSteps}</span>
          <h3 className="font-semibold text-old-money-navy">{steps[currentStep - 1]}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-old-money-gray">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
      </div>
    </div>
  )
}