'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon,
  ChevronDownIcon,
  CheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  EMAIL_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  EmailTemplate,
  getTemplatesByCategory,
  getAllEnabledTemplates
} from '@/lib/email-templates/registry';

interface EmailTemplateSelectorProps {
  selectedTemplate: EmailTemplate | null;
  onTemplateSelect: (template: EmailTemplate) => void;
  className?: string;
}

export default function EmailTemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  className = "" 
}: EmailTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const enabledTemplates = getAllEnabledTemplates();
  const categories = Object.entries(TEMPLATE_CATEGORIES);

  const filteredTemplates = selectedCategory === 'all' 
    ? enabledTemplates 
    : getTemplatesByCategory(selectedCategory as EmailTemplate['category']);

  const handleTemplateSelect = (template: EmailTemplate) => {
    onTemplateSelect(template);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Template Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            {selectedTemplate ? (
              <>
                <div className="font-medium text-gray-900">{selectedTemplate.name}</div>
                <div className="text-sm text-gray-600">{selectedTemplate.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${TEMPLATE_CATEGORIES[selectedTemplate.category].color}`}>
                    {TEMPLATE_CATEGORIES[selectedTemplate.category].icon} {TEMPLATE_CATEGORIES[selectedTemplate.category].name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-gray-900">Select Email Template</div>
                <div className="text-sm text-gray-600">Choose which email template to send</div>
              </>
            )}
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Category Filter */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-fuchsia-100 text-fuchsia-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Templates ({enabledTemplates.length})
              </button>
              {categories.map(([key, category]) => {
                const count = getTemplatesByCategory(key as EmailTemplate['category']).length;
                if (count === 0) return null;
                
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === key
                        ? category.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTemplates.length > 0 ? (
              <div className="p-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 ${
                      selectedTemplate?.id === template.id ? 'bg-fuchsia-50 border border-fuchsia-200' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{template.name}</span>
                        {selectedTemplate?.id === template.id && (
                          <CheckIcon className="w-4 h-4 text-fuchsia-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${TEMPLATE_CATEGORIES[template.category].color}`}>
                          {TEMPLATE_CATEGORIES[template.category].icon} {TEMPLATE_CATEGORIES[template.category].name}
                        </span>
                        <span className="text-xs text-gray-500">
                          Subject: {template.subject}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <EnvelopeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div className="text-sm">No templates found in this category</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
