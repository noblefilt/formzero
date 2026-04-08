import { Database, Puzzle, LayoutDashboard } from "lucide-react"
import { NavLink, useParams } from "react-router"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar"

export function FormNav() {
  const params = useParams()
  const formId = params.formId

  const formItems = formId ? [
    {
      title: "Submissions",
      url: `/forms/${formId}/submissions`,
      icon: Database,
    },
    {
      title: "Integration",
      url: `/forms/${formId}/integration`,
      icon: Puzzle,
    },
  ] : []

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/forms/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {formItems.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Current Form</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {formItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  )
}
