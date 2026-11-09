import React, { useState, useRef, useEffect, useId, useCallback } from "react";

export default function CustomSelect({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  error,
  helperText,
  icon,
  required = false,
  disabled = false,
  className = "",
  containerClassName = "",
  menuClassName = "",
  searchable = false,
  children,
}) {
  const generatedId = useId();
  const selectId = id || name || generatedId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Parse options: supports both `options` prop array and `<option>` children
  const parsedOptions = React.useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
      );
    }
    if (children) {
      const items = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          items.push({
            value: child.props.value ?? child.props.children,
            label: child.props.children || String(child.props.value),
          });
        }
      });
      return items;
    }
    return [];
  }, [options, children]);

  // Filter options if searchable is enabled
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return parsedOptions;
    }
    const q = searchQuery.toLowerCase().trim();
    return parsedOptions.filter((opt) =>
      String(opt.label).toLowerCase().includes(q)
    );
  }, [parsedOptions, searchable, searchQuery]);

  // Find currently selected option
  const selectedOption = parsedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Determine whether dropdown should open upwards or downwards based on viewport space
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If less than 240px below and more space above, open upwards
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = useCallback(
    (option) => {
      if (disabled) return;
      if (onChange) {
        // Standard synthetic event compatible with forms (e.g. e.target.value)
        onChange({
          target: {
            name: name || id,
            value: option.value,
          },
        });
      }
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    },
    [disabled, onChange, name, id]
  );

  // Close when clicking outside and handle keyboard navigation
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    function handleKeyDown(event) {
      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        triggerRef.current?.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (event.key === "Enter" || event.key === " ") {
        if (event.target === searchInputRef.current && event.key === " ") {
          return; // Allow space in search input
        }
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
      } else if (event.key === "Tab") {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && menuRef.current && highlightedIndex >= 0) {
      const optionEl = menuRef.current.children[highlightedIndex];
      if (optionEl && optionEl.scrollIntoView) {
        optionEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  function toggleOpen() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setSearchQuery("");
    // Default highlight to current selected option index
    const curIndex = filteredOptions.findIndex(
      (opt) => String(opt.value) === String(value)
    );
    setHighlightedIndex(curIndex >= 0 ? curIndex : 0);
  }

  return (
    <div className={`w-full relative ${containerClassName}`} ref={containerRef}>
      {/* Field Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs sm:text-[13px] font-semibold text-[#0B1B4F] mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* Hidden native input for native form serialization */}
      <input
        type="hidden"
        id={selectId}
        name={name}
        value={value ?? ""}
        required={required}
      />

      {/* Custom Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={label || placeholder}
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full relative flex items-center justify-between rounded-2xl border transition-all duration-150 bg-white px-3.5 sm:px-4 h-[46px] sm:h-[48px] select-none text-left cursor-pointer ${
          error
            ? "border-rose-400 ring-2 ring-rose-100"
            : isOpen
            ? "border-[#0A3D8F] ring-4 ring-[#0A3D8F]/10"
            : "border-[#D3DFEB] hover:border-[#B9D8EC] focus:border-[#0A3D8F] focus:ring-4 focus:ring-[#0A3D8F]/10"
        } ${
          disabled
            ? "opacity-60 bg-slate-50 cursor-not-allowed pointer-events-none"
            : ""
        } ${className}`}
      >
        {/* Left Section: Leading Icon and Selected Text */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {icon && (
            <span className="text-[#556987] shrink-0 select-none">
              {icon}
            </span>
          )}

          <span
            className={`text-[14px] truncate leading-normal ${
              selectedOption
                ? "text-[#0F172A] font-medium"
                : "text-[#8598B0] font-normal"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Right Section: Custom Animated Chevron */}
        <span className="text-[#8598B0] shrink-0 ml-1 transition-transform duration-200">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#0A387E]" : "text-[#8598B0]"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Floating Custom Dropdown Listbox */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label || placeholder}
          className={`absolute left-0 right-0 z-50 bg-white rounded-2xl border border-[#D5E8F8] shadow-[0_16px_40px_rgba(10,56,126,0.14)] p-1.5 animate-in fade-in zoom-in-95 duration-150 select-none ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${menuClassName}`}
        >
          {/* Optional Search Filter */}
          {searchable && (
            <div className="p-1 mb-1 border-b border-[#EEF4FA]">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-[#0F172A] bg-[#F8FBFE] border border-[#D3DFEB] rounded-xl outline-none focus:border-[#0A387E]"
              />
            </div>
          )}

          {/* Options Scroll Container */}
          <div
            ref={menuRef}
            className="max-h-60 overflow-y-auto space-y-0.5 overscroll-contain"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-4 text-xs text-[#8598B0] text-center font-medium">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-[13.5px] flex items-center justify-between cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? "bg-[#EAF4FE] text-[#0A387E] font-bold shadow-xs"
                        : isHighlighted
                        ? "bg-[#F4F8FC] text-[#0B1B4F]"
                        : "text-[#334155] hover:bg-[#F0F6FC] hover:text-[#0B1B4F]"
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>

                    {/* Active Checkmark Indicator */}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#0A387E] shrink-0 stroke-[2.5]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error & Helper Text */}
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#556987]">{helperText}</p>
      ) : null}
    </div>
  );
}
