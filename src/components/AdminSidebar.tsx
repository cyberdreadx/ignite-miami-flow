import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Shield,
  Home,
  Settings,
  BarChart3
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3, id: "dashboard" },
  { title: "Analytics", url: "/admin#analytics", icon: TrendingUp, id: "analytics" },
  { title: "Users", url: "/admin#users", icon: Users, id: "users" },
  { title: "Posts", url: "/admin#posts", icon: MessageSquare, id: "posts" },
  { title: "Pending", url: "/admin#pending", icon: Clock, id: "pending" },
  { title: "Moderation", url: "/admin#moderation", icon: Shield, id: "moderation" },
];

const generalItems = [
  { title: "Back to Feed", url: "/", icon: Home, id: "home" },
];

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname + location.hash;

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin#dashboard";
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Admin Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.url.includes("#") ? (
                      <button
                        className={`w-full text-left ${getNavCls({ isActive: isActive(item.url) })}`}
                        onClick={() => {
                          const elementId = item.url.split("#")[1];
                          const element = document.getElementById(elementId);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "start" });
                            // Update URL without triggering navigation
                            window.history.pushState({}, "", item.url);
                          }
                        }}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/admin"}
                        className={getNavCls}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
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
  );
}