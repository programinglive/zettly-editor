import React from "react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
} from "lucide-react";

export interface BlockIconProps {
  name: string;
  className?: string;
}

export const BlockCommandIcon: React.FC<BlockIconProps> = ({ name, className = "h-4 w-4" }) => {
  switch (name) {
    case "Type":
      return <Type className={className} />;
    case "Heading1":
      return <Heading1 className={className} />;
    case "Heading2":
      return <Heading2 className={className} />;
    case "Heading3":
      return <Heading3 className={className} />;
    case "List":
      return <List className={className} />;
    case "ListOrdered":
      return <ListOrdered className={className} />;
    case "Quote":
      return <Quote className={className} />;
    case "Code":
      return <Code className={className} />;
    case "Minus":
      return <Minus className={className} />;
    default:
      return <Type className={className} />;
  }
};
