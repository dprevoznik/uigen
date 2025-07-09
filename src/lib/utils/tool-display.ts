import { FileText, Edit, Folder, Plus, Trash2, RotateCcw } from "lucide-react";

export interface ToolDisplayInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  getContextualMessage?: (args: any) => string;
}

export const toolDisplayMap: Record<string, ToolDisplayInfo> = {
  str_replace_editor: {
    name: "File Editor",
    icon: Edit,
    getContextualMessage: (args) => {
      if (!args) return "File Editor";
      
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      const { command, path, old_str, new_str } = parsedArgs;
      
      if (command === "create") {
        return `Creating file: ${path}`;
      } else if (command === "str_replace") {
        return `Editing file: ${path}`;
      } else if (command === "view") {
        return `Reading file: ${path}`;
      }
      
      return `Editing file: ${path}`;
    }
  },
  file_manager: {
    name: "File Manager",
    icon: Folder,
    getContextualMessage: (args) => {
      if (!args) return "File Manager";
      
      const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
      const { action, path } = parsedArgs;
      
      switch (action) {
        case "create":
          return `Creating: ${path}`;
        case "delete":
          return `Deleting: ${path}`;
        case "rename":
          return `Renaming: ${path}`;
        case "list":
          return `Listing directory: ${path}`;
        default:
          return `File Manager: ${path}`;
      }
    }
  }
};

export function getToolDisplayInfo(toolName: string, args?: any): ToolDisplayInfo {
  const tool = toolDisplayMap[toolName];
  
  if (!tool) {
    // Fallback for unknown tools
    return {
      name: toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: FileText,
      getContextualMessage: () => toolName
    };
  }
  
  return {
    ...tool,
    name: tool.getContextualMessage ? tool.getContextualMessage(args) : tool.name
  };
}