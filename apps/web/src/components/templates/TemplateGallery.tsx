'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, BookOpen, Code, CheckSquare, Calendar, Lightbulb, Search } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  icon: any;
  tags: string[];
}

const TEMPLATE_CATEGORIES = [
  { id: 'docs', name: 'Documentation', icon: BookOpen },
  { id: 'meeting', name: 'Meetings', icon: Calendar },
  { id: 'project', name: 'Project Management', icon: CheckSquare },
  { id: 'technical', name: 'Technical', icon: Code },
  { id: 'creative', name: 'Creative', icon: Lightbulb },
];

const BUILT_IN_TEMPLATES: Template[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for taking structured meeting notes',
    category: 'meeting',
    icon: Calendar,
    tags: ['meeting', 'notes', 'agenda'],
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
- 
- 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1


### Topic 2


## Action Items
- [ ] Task 1 - Assigned to: 
- [ ] Task 2 - Assigned to: 

## Next Steps


## Notes

`,
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Comprehensive project planning template',
    category: 'project',
    icon: CheckSquare,
    tags: ['project', 'planning', 'roadmap'],
    content: `# Project Plan: [Project Name]

## Overview
**Start Date:** 
**End Date:** 
**Project Manager:** 
**Budget:** 

## Objectives
1. 
2. 
3. 

## Scope
### In Scope
- 
- 

### Out of Scope
- 
- 

## Timeline & Milestones
| Milestone | Due Date | Status |
|-----------|----------|--------|
| Phase 1   |          | 🟡 In Progress |
| Phase 2   |          | ⚪ Not Started |

## Team & Responsibilities
| Name | Role | Responsibilities |
|------|------|-----------------|
|      |      |                 |

## Resources Required
- 
- 

## Risks & Mitigation
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
|      |        |             |                     |

## Success Criteria
1. 
2. 
3. 
`,
  },
  {
    id: 'technical-spec',
    name: 'Technical Specification',
    description: 'Document technical requirements and architecture',
    category: 'technical',
    icon: Code,
    tags: ['technical', 'architecture', 'specs'],
    content: `# Technical Specification: [Feature Name]

## Overview
Brief description of the feature/system.

## Requirements

### Functional Requirements
1. **FR1:** 
2. **FR2:** 

### Non-Functional Requirements
1. **NFR1 - Performance:** 
2. **NFR2 - Security:** 
3. **NFR3 - Scalability:** 

## Architecture

### System Components
\`\`\`
[Diagram placeholder]
\`\`\`

### Data Model
\`\`\`typescript
interface Entity {
  id: string;
  // Add fields
}
\`\`\`

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/... | ...         |
| POST   | /api/... | ...         |

## Technology Stack
- **Frontend:** 
- **Backend:** 
- **Database:** 
- **Infrastructure:** 

## Security Considerations
- 
- 

## Testing Strategy
- **Unit Tests:** 
- **Integration Tests:** 
- **E2E Tests:** 

## Deployment Plan
1. 
2. 
3. 

## Monitoring & Alerting
- 
- 
`,
  },
  {
    id: 'design-doc',
    name: 'Design Document',
    description: 'Document design decisions and rationale',
    category: 'docs',
    icon: BookOpen,
    tags: ['design', 'documentation', 'decisions'],
    content: `# Design Document: [Feature/System Name]

## Context & Problem Statement
Describe the problem we're trying to solve.

## Goals
1. 
2. 
3. 

## Non-Goals
- 
- 

## Proposed Solution

### High-Level Design


### Detailed Design


## Alternatives Considered

### Alternative 1: [Name]
**Pros:**
- 

**Cons:**
- 

### Alternative 2: [Name]
**Pros:**
- 

**Cons:**
- 

## Decision Rationale
Why we chose the proposed solution over alternatives.

## Impact Analysis

### Performance Impact


### Security Impact


### Maintenance Impact


## Open Questions
1. 
2. 

## Timeline
| Phase | Duration | Dependencies |
|-------|----------|--------------|
|       |          |              |
`,
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming Session',
    description: 'Capture ideas and creative thinking',
    category: 'creative',
    icon: Lightbulb,
    tags: ['brainstorm', 'ideas', 'creative'],
    content: `# Brainstorming: [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Participants:** 
- 
- 

## Problem/Challenge


## Ideas

### 💡 Idea 1: [Name]
**Description:** 

**Pros:**
- 

**Cons:**
- 

**Feasibility:** ⭐⭐⭐☆☆

---

### 💡 Idea 2: [Name]
**Description:** 

**Pros:**
- 

**Cons:**
- 

**Feasibility:** ⭐⭐⭐☆☆

---

### 💡 Idea 3: [Name]
**Description:** 

**Pros:**
- 

**Cons:**
- 

**Feasibility:** ⭐⭐⭐☆☆

---

## Voting Results
| Idea | Votes | Priority |
|------|-------|----------|
|      |       |          |

## Next Steps
1. 
2. 
3. 

## Action Items
- [ ] 
- [ ] 
`,
  },
  {
    id: 'api-doc',
    name: 'API Documentation',
    description: 'Document API endpoints and usage',
    category: 'technical',
    icon: Code,
    tags: ['api', 'documentation', 'reference'],
    content: `# API Documentation

## Base URL
\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication
All requests require an API key in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /resource
Get a list of resources.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | int | No | Page number (default: 1) |
| limit | int | No | Items per page (default: 10) |

**Response:**
\`\`\`json
{
  "data": [],
  "pagination": {
    "page": 1,
    "totalPages": 10,
    "total": 100
  }
}
\`\`\`

**Status Codes:**
- \`200\` - Success
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found

---

### POST /resource
Create a new resource.

**Body:**
\`\`\`json
{
  "name": "string",
  "description": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "2025-01-01T00:00:00Z"
}
\`\`\`

---

## Rate Limits
- 100 requests per minute
- 5000 requests per hour

## Error Handling
All errors follow this format:
\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`
`,
  },
];

interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateGallery({ open, onClose, onSelect }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = BUILT_IN_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Gallery</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {TEMPLATE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{template.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No templates found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
