'use client'

import { useState } from 'react'

export interface CustomerDetails {
  fullName: string
  email: string
  phone: string
  companyName?: string
  notes?: string
}

interface SubmitJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (details: CustomerDetails) => Promise<void>
  isSubmitting: boolean
}

export default function SubmitJobModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: SubmitJobModalProps) {
  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        notes: '',
      })
      setErrors({})
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof CustomerDetails]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Submit Job Request
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                  errors.fullName ? 'border-rose-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm text-rose-500">{errors.fullName}</p>}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                  errors.email ? 'border-rose-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1"
              >
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${
                  errors.phone ? 'border-rose-500' : 'border-neutral-300 dark:border-neutral-600'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-rose-500">{errors.phone}</p>}
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1"
              >
                Company Name (Optional)
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1"
              >
                Additional Notes/Instructions (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                placeholder="Any special requirements or notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Job Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
