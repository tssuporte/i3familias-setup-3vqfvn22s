import { NavLink } from 'react-router-dom'
import {
  Home,
  CheckSquare,
  ShoppingBasket,
  Utensils,
  ShoppingCart,
  Calendar as CalendarIcon,
  BookOpen,
  DollarSign,
  Bell,
  BarChart3,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', url: '/app', icon: Home },
  { title: 'Tarefas', url: '/app/tasks', icon: CheckSquare },
  { title: 'Despensa', url: '/app/pantry', icon: ShoppingBasket },
  { title: 'Refeições', url: '/app/meals', icon: Utensils },
  { title: 'Compras', url: '/app/shopping', icon: ShoppingCart },
  { title: 'Calendário', url: '/app/calendar', icon: CalendarIcon },
  { title: 'Estudos', url: '/app/studies', icon: BookOpen },
  { title: 'Finanças', url: '/app/finances', icon: DollarSign },
  { title: 'Avisos', url: '/app/notices', icon: Bell },
  { title: 'Relatórios', url: '/app/reports', icon: BarChart3 },
  { title: 'Configurações', url: '/app/settings', icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary font-medium'
                          : 'text-sidebar-foreground'
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
