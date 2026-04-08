import * as React from "react"
import { ChevronsUpDown, Plus, Pencil, Trash2 } from "lucide-react"
import { useFetcher, useLocation, useNavigate, useParams } from "react-router"
import type { Form } from "#/types/form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "#/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Button } from "#/components/ui/button"

type FormSwitcherProps = {
  forms: (Form & { submission_count?: number })[]
}

export function FormSwitcher({ forms }: FormSwitcherProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const params = useParams()
  const formId = params.formId || forms[0].id
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const fetcher = useFetcher<{ error?: string }>()
  const location = useLocation();

  const activeForm = forms.find((form) => form.id === formId) || forms[0]
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [targetForm, setTargetForm] = React.useState<(Form & { submission_count?: number }) | null>(null)
  const actionFetcher = useFetcher()

  // Close dialog on successful submission
  React.useEffect(() => {
    setIsDialogOpen(false)
    setIsRenameDialogOpen(false)
  }, [location.pathname])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <img src="/favicon.svg" alt="" className="size-8 rounded-lg" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeForm.name}</span>
                <span className="truncate text-xs">{activeForm.submission_count !== undefined ? `${activeForm.submission_count} submissions` : activeForm.id}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Forms
            </DropdownMenuLabel>
            {forms.map((form) => (
              <DropdownMenuItem
                key={form.id}
                onClick={() => navigate(`/forms/${form.id}/submissions`)}
                className="gap-2 p-2 group"
              >
                <img src="/favicon.svg" alt="" className="size-6 rounded-md shrink-0" />
                <span className="flex-1 truncate">{form.name}</span>
                {form.submission_count !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums group-hover:hidden">{form.submission_count}</span>
                )}
                <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="p-1 rounded hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTargetForm(form)
                      setIsRenameDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTargetForm(form)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => setIsDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add form</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Create a new form to start collecting submissions.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form method="post" action="/forms">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contact Form"
                  required
                />
                {fetcher.data && "error" in fetcher.data && (
                  <p className="text-sm text-destructive">{fetcher.data.error as string}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={fetcher.state === "submitting"}>
                {fetcher.state === "submitting" ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Form</DialogTitle>
            <DialogDescription>
              Change the display name of "{targetForm?.name}".
            </DialogDescription>
          </DialogHeader>
          <actionFetcher.Form method="post" action="/forms">
            <input type="hidden" name="intent" value="rename" />
            <input type="hidden" name="formId" value={targetForm?.id || ""} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rename-name">New Name</Label>
                <Input
                  id="rename-name"
                  name="name"
                  defaultValue={targetForm?.name || ""}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionFetcher.state === "submitting"}>
                {actionFetcher.state === "submitting" ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </actionFetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{targetForm?.name}"? This will also delete all {targetForm?.submission_count || 0} submission(s). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={actionFetcher.state === "submitting"}
              onClick={() => {
                if (!targetForm) return
                const formData = new FormData()
                formData.append("intent", "delete")
                formData.append("formId", targetForm.id)
                actionFetcher.submit(formData, { method: "post", action: "/forms" })
                setIsDeleteDialogOpen(false)
              }}
            >
              {actionFetcher.state === "submitting" ? "Deleting..." : "Delete Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  )
}
