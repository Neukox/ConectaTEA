interface StepperProps {
  currentStep: number
  steps: string[]
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between mb-12">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
              index < currentStep
                ? 'bg-green-600 text-white'
                : index === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-semibold ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 ml-3 transition-all ${
                index < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
