'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  FileText,
  Languages,
  CheckCircle,
  Lightbulb,
  Code,
  MessageSquare,
  ListTodo,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  selectedText?: string;
  onInsert?: (text: string) => void;
}

const AI_ACTIONS = [
  {
    id: 'improve',
    name: 'Improve Writing',
    description: 'Make text clearer and more professional',
    icon: Sparkles,
    requiresText: true,
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a concise summary',
    icon: FileText,
    requiresText: true,
  },
  {
    id: 'fix-grammar',
    name: 'Fix Grammar',
    description: 'Correct grammar and spelling',
    icon: CheckCircle,
    requiresText: true,
  },
  {
    id: 'translate',
    name: 'Translate',
    description: 'Translate to another language',
    icon: Languages,
    requiresText: true,
    requiresLanguage: true,
  },
  {
    id: 'outline',
    name: 'Generate Outline',
    description: 'Create content outline',
    icon: ListTodo,
    requiresText: false,
  },
  {
    id: 'generate-ideas',
    name: 'Generate Ideas',
    description: 'Brainstorm creative ideas',
    icon: Lightbulb,
    requiresText: false,
  },
  {
    id: 'generate-code',
    name: 'Generate Code',
    description: 'Create code snippets',
    icon: Code,
    requiresText: false,
  },
  {
    id: 'extract-tasks',
    name: 'Extract Tasks',
    description: 'Find action items',
    icon: ListTodo,
    requiresText: true,
  },
];

export function AIAssistant({ open, onClose, selectedText = '', onInsert }: AIAssistantProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [input, setInput] = useState(selectedText);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const { toast } = useToast();

  const handleAction = async (actionId: string) => {
    setSelectedAction(actionId);
    const action = AI_ACTIONS.find(a => a.id === actionId);
    
    if (action?.requiresText && !input.trim()) {
      toast({
        title: 'Input required',
        description: 'Please provide some text to work with.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      const requestData: any = {};

      switch (actionId) {
        case 'improve':
        case 'summarize':
        case 'fix-grammar':
        case 'extract-tasks':
          requestData.text = input;
          break;
        case 'translate':
          requestData.text = input;
          requestData.targetLanguage = targetLanguage;
          break;
        case 'outline':
          requestData.topic = input;
          break;
        case 'generate-ideas':
          requestData.topic = input;
          requestData.count = 5;
          break;
        case 'generate-code':
          requestData.description = input;
          requestData.language = 'typescript';
          break;
      }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionId,
          data: requestData,
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      const result = Array.isArray(data.result) ? data.result.join('\n\n') : data.result;
      setOutput(result);

      toast({
        title: 'Success',
        description: 'AI generated response successfully!',
      });
    } catch (error) {
      console.error('AI error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (output && onInsert) {
      onInsert(output);
      toast({
        title: 'Inserted',
        description: 'AI-generated content has been inserted.',
      });
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedAction(null);
    setOutput('');
    setInput(selectedText);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Assistant
          </DialogTitle>
        </DialogHeader>

        {!selectedAction ? (
          // Action selection
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose an AI action to help with your content:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {AI_ACTIONS.map((action) => {
                const Icon = action.icon;
                const canUse = !action.requiresText || selectedText.trim().length > 0;
                
                return (
                  <button
                    key={action.id}
                    onClick={() => canUse && handleAction(action.id)}
                    disabled={!canUse}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      canUse
                        ? 'hover:border-primary hover:shadow-md cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{action.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        {action.requiresText && !selectedText && (
                          <p className="text-xs text-orange-500 mt-1">
                            Select text first
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Action processing
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {AI_ACTIONS.find(a => a.id === selectedAction)?.name}
              </h3>
              <Button variant="outline" size="sm" onClick={handleReset}>
                ← Back
              </Button>
            </div>

            {selectedAction === 'translate' && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  disabled={loading}
                >
                  <option value="Spanish">Spanish</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Input</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text or topic here..."
                className="min-h-[120px]"
                disabled={loading}
              />
            </div>

            {output && (
              <div>
                <label className="text-sm font-medium mb-2 block">AI Output</label>
                <div className="p-4 border rounded-lg bg-muted min-h-[120px] whitespace-pre-wrap">
                  {output}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleAction(selectedAction)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              {output && onInsert && (
                <Button onClick={handleInsert} variant="outline">
                  Insert into Editor
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
