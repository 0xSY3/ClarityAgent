import React from "react"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CodeBlockHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CodeBlockHeader({
  className,
  children,
  ...props
}: CodeBlockHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 border-b bg-muted/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CodeBlockContentProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
}

export function CodeBlockContent({
  className,
  children,
  ...props
}: CodeBlockContentProps) {
  return (
    <pre
      className={cn("p-4 overflow-auto text-sm", className)}
      {...props}
    >
      {children}
    </pre>
  )
}