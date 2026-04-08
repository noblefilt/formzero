import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "#/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip"

export type Submission = {
  id: string
  form_id: string
  data: Record<string, any>
  created_at: number
}

export function createColumns(
  submissions: Submission[],
  options?: {
    onView?: (submission: Submission) => void
    onDelete?: (id: string) => void
  }
): ColumnDef<Submission>[] {
  // Time column comes first
  const timeColumn: ColumnDef<Submission> = {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("created_at") as number
      const date = new Date(timestamp)
      const relativeTime = formatDistanceToNow(date, {
        addSuffix: true,
      })
      const exactTime = date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "medium",
      })
      return (
        <TooltipProvider delayDuration={1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-muted-foreground">
                {relativeTime}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{exactTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  }

  // Extract all unique field names from submission data
  const fieldNames = new Set<string>()
  submissions.forEach((submission) => {
    Object.keys(submission.data).forEach((key) => fieldNames.add(key))
  })

  // Sort field names: email first if exists, then alphabetically
  const sortedFields = Array.from(fieldNames).sort((a, b) => {
    if (a === "email") return -1
    if (b === "email") return 1
    return a.localeCompare(b)
  })

  // Create columns for each field
  const dataColumns: ColumnDef<Submission>[] = sortedFields.map((fieldName) => {
    // Make email column sortable
    if (fieldName === "email") {
      return {
        id: fieldName,
        accessorFn: (row) => row.data[fieldName],
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const value = row.original.data[fieldName]
          return <div className="text-sm">{value?.toString() || ""}</div>
        },
      }
    }

    // Regular columns
    return {
      id: fieldName,
      accessorFn: (row) => row.data[fieldName],
      header: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      cell: ({ row }) => {
        const value = row.original.data[fieldName]
        return <div className="text-sm">{value?.toString() || ""}</div>
      },
    }
  })

  // Action column
  const actionColumn: ColumnDef<Submission> = {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const submission = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => options?.onView?.(submission)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete this submission?")) {
                  options?.onDelete?.(submission.id)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }

  return [timeColumn, ...dataColumns, actionColumn]
}
