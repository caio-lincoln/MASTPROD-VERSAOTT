"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface BrandLogoProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "original" | "white" | "black" | "auto"
  width?: number
  height?: number
  className?: string
}

export function BrandLogo({ 
  variant = "auto", 
  width = 150, 
  height = 40, 
  className,
  ...props 
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getLogoSrc = () => {
    // If specific variant requested
    if (variant === "original") return "/logo/LogoOriginal.png"
    if (variant === "white") return "/logo/LogoBranca.png"
    if (variant === "black") return "/logo/LogoPreta.png"

    // Auto behavior
    if (!mounted) return "/logo/LogoOriginal.png" // Default SSR/Hydration
    
    return resolvedTheme === "dark" 
      ? "/logo/LogoBranca.png" 
      : "/logo/LogoOriginal.png"
  }

  const src = getLogoSrc()

  return (
    <div className={cn("relative flex items-center justify-center", className)} {...props}>
      <Image
        src={src}
        alt="MASTPROD SST"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  )
}
