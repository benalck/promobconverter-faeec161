# AI Rules for Promob Converter Application

This document outlines the technical stack and guidelines for developing features within the Promob Converter application.

## Tech Stack Overview

*   **Frontend Framework**: React (with TypeScript) for building interactive user interfaces.
*   **Build Tool**: Vite for a fast development experience and optimized builds.
*   **Styling**: Tailwind CSS for utility-first CSS, enabling rapid and consistent styling.
*   **UI Components**: Shadcn/ui provides a collection of accessible and customizable UI components built on Radix UI.
*   **Routing**: React Router for declarative navigation within the single-page application.
*   **Backend as a Service (BaaS)**: Supabase for authentication, database management, and serverless functions (RPC calls).
*   **Data Fetching & Caching**: Tanstack Query (React Query) for managing server state, data fetching, and caching.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **Form Management**: React Hook Form for efficient form handling and Zod for schema-based validation.
*   **Date Utilities**: Date-fns for parsing, formatting, and manipulating dates.
*   **XML Processing**: Native DOMParser for client-side XML parsing.

## Library Usage Rules

To maintain consistency, performance, and readability, please adhere to the following guidelines when implementing new features or modifying existing ones:

*   **UI Components**:
    *   **Always** prioritize using components from `shadcn/ui` (imported from `@/components/ui`).
    *   If a required component is not available in `shadcn/ui` or needs significant custom behavior, create a new, dedicated component file in `src/components/`.
*   **Styling**:
    *   **Exclusively** use Tailwind CSS classes for all styling. Avoid inline styles or separate CSS modules unless absolutely necessary for global overrides in `src/index.css`.
*   **Icons**:
    *   **Always** use icons from the `lucide-react` library.
*   **Routing**:
    *   **Always** use `react-router-dom` for all navigation and route definitions. Keep main routes in `src/App.tsx`.
*   **State Management & Data Fetching**:
    *   For local component state, use React's `useState` and `useReducer` hooks.
    *   For global client-side state, use React's `useContext` (e.g., `AuthContext`).
    *   For server-side data fetching, caching, and synchronization, use `Tanstack Query` (React Query).
*   **Authentication & Database**:
    *   **All** authentication and database interactions (CRUD operations, RPC calls) must be performed using the `supabase` client (imported from `@/integrations/supabase/client`).
*   **Date Handling**:
    *   **Always** use `date-fns` for any date formatting, parsing, or manipulation tasks.
*   **XML Parsing**:
    *   For client-side XML parsing, use the native `DOMParser` API as demonstrated in `src/utils/xmlParser.ts` and `src/utils/cutOptimizer.ts`.
*   **Form Handling & Validation**:
    *   **Always** use `react-hook-form` for managing form state and submissions.
    *   **Always** use `zod` for defining form schemas and performing validation.
*   **Toasts/Notifications**:
    *   **Always** use the custom `useToast` hook (from `@/hooks/use-toast`) for displaying user notifications.
*   **Utility Functions**:
    *   For combining and conditionally applying Tailwind CSS classes, use the `cn` utility function (from `@/lib/utils`).