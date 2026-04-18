import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon:        LucideIcon
  title:       string
  description: string
  action?:     React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-[#1E6B45]" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}
