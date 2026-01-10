interface StepperProps {
  currentStep: number
  steps: string[]
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className='mb-12 flex items-center justify-between'>
      {steps.map((step, index) => (
        <div
          key={index}
          className='flex flex-1 items-center'
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
              index < currentStep
                ? 'bg-green-600 text-white'
                : index === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className='ml-3 flex-1'>
            <p
              className={`text-sm font-semibold ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`ml-3 h-1 flex-1 transition-all ${
                index < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
