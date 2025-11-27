'use client';

import { useState } from 'react';
import { Tag as TagIcon, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface TagFilterProps {
  allTags: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ allTags, selectedTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagName) => {
            const tag = allTags.find(t => t.name === tagName);
            if (!tag) return null;
            
            return (
              <span
                key={tagName}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => toggleTag(tagName)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Tag selector popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter by tags
            {selectedTags.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {selectedTags.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Select Tags
              </h4>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllTags}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {allTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tags available
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                      selectedTags.includes(tag.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    {tag.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {tag.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
