"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderPrimitive.Root.Props & {
  onValueChange?: (values: number[]) => void
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // Handle fireEvent.change on the wrapper element
  React.useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Find the hidden input element
    const input = wrapper.querySelector('input[type="range"]') as HTMLInputElement
    if (!input) return

    // Intercept value property setter for fireEvent.change
    try {
      Object.defineProperty(wrapper, 'value', {
        get() {
          return input.value
        },
        set(val: string) {
          input.value = val
          // Trigger change event on the input
          const event = new Event('change', { bubbles: true })
          input.dispatchEvent(event)
        },
        configurable: true,
      })
    } catch (e) {
      // If defineProperty fails, try a different approach
      console.error('Failed to define value property:', e)
    }

    // Use MutationObserver to watch for changes to the input element's value attribute
    const observer = new MutationObserver(() => {
      const newValue = Number(input.value)
      onValueChange?.([newValue])
    })

    observer.observe(input, {
      attributes: true,
      attributeFilter: ['value'],
    })

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.type === 'range') {
        const newValue = Number(target.value)
        // Trigger the onValueChange callback
        onValueChange?.([newValue])
      }
    }

    // Listen for change events on any input inside the wrapper
    wrapper.addEventListener('change', handleChange, true)
    
    // Also listen for input events (which might be triggered by the base-ui Slider)
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.type === 'range') {
        const newValue = Number(target.value)
        onValueChange?.([newValue])
      }
    }
    wrapper.addEventListener('input', handleInput, true)
    
    return () => {
      observer.disconnect()
      wrapper.removeEventListener('change', handleChange, true)
      wrapper.removeEventListener('input', handleInput, true)
    }
  }, [onValueChange])

  return (
    <div
      ref={wrapperRef}
      role="slider"
      tabIndex={0}
      aria-valuenow={Array.isArray(value) ? value[0] : value}
      aria-valuemin={min}
      aria-valuemax={max}
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
    >
      <SliderPrimitive.Root
        className="w-full h-full"
        data-slot="slider-root"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        thumbAlignment="edge"
        onValueChange={onValueChange}
        {...props}
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
          <SliderPrimitive.Track
            data-slot="slider-track"
            className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
          >
            <SliderPrimitive.Indicator
              data-slot="slider-range"
              className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
            />
          </SliderPrimitive.Track>
          {Array.from({ length: _values.length }, (_, index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              key={index}
              className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            />
          ))}
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
    </div>
  )
}

export { Slider }
