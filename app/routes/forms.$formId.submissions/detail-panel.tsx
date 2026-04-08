import { formatDistanceToNow } from "date-fns"
import { Trash2, Clock, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { Submission } from "./columns"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

interface DetailPanelProps {
  submission: Submission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function DetailPanel({
  submission,
  open,
  onOpenChange,
  onDelete,
  isDeleting,
}: DetailPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!submission) return null

  const date = new Date(submission.created_at)
  const relativeTime = formatDistanceToNow(date, { addSuffix: true })
  const exactTime = date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "medium",
  })

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(key)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) return
    onDelete(submission.id)
    onOpenChange(false)
  }

  const dataEntries = Object.entries(submission.data)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Submission Details</SheetTitle>
          <SheetDescription className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{relativeTime}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground/80">{exactTime}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-4 space-y-1">
          {dataEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No data fields in this submission.</p>
          ) : (
            dataEntries.map(([key, value]) => {
              const displayValue = value !== undefined && value !== null ? String(value) : ""
              const isLongValue = displayValue.length > 100

              return (
                <div key={key} className="group rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {key}
                    </label>
                    {displayValue && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(key, displayValue)}
                      >
                        {copiedField === key ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  {isLongValue ? (
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {displayValue}
                    </p>
                  ) : (
                    <p className="text-sm font-medium">{displayValue || <span className="text-muted-foreground italic">Empty</span>}</p>
                  )}
                </div>
              )
            })
          )}
        </div>

        <Separator />

        <SheetFooter className="flex-row gap-2">
          <div className="text-xs text-muted-foreground truncate flex-1">
            ID: {submission.id}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
