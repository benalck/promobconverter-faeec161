# AI Rules for Promob Converter Application

This document outlines the core technologies used in this application and provides clear guidelines on which libraries to use for specific functionalities.

## Tech Stack Overview

*   **React**: The application is built using React for a dynamic and responsive user interface.
*   **TypeScript**: All components and logic are written in TypeScript, ensuring type safety and improving code maintainability.
*   **Tailwind CSS**: Styling is handled exclusively with Tailwind CSS, providing utility-first classes for rapid and consistent UI development.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **React Router**: Client-side navigation and routing are managed using React Router for a seamless single-page application experience.
*   **Supabase**: Used as the backend-as-a-service for authentication, database management, and serverless functions (via RPC calls).
*   **Lucide React**: A comprehensive icon library integrated for all visual icons across the application.
*   **React Hook Form & Zod**: Forms are managed with React Hook Form for efficient state handling and validated using Zod for schema-based validation.
*   **Date-fns**: A lightweight and modular JavaScript date utility library used for all date and time manipulation and formatting.
*   **Recharts**: Utilized for creating responsive and customizable charts and data visualizations, particularly in the admin dashboard.
*   **Vite**: The project uses Vite as its build tool, offering a fast development server and optimized build process.
*   **DOMParser**: The native browser API for parsing XML content, used for extracting data from Promob XML files.

## Library Usage Rules

To maintain consistency and efficiency, please adhere to the following rules when developing:

*   **UI Components**: Always prioritize `shadcn/ui` components for building the user interface. If a specific component is not available or requires extensive customization, create a new component that wraps or extends `shadcn/ui` primitives, or build a new one using pure Tailwind CSS.
*   **Icons**: Use `lucide-react` for all icons. Ensure icons are appropriately sized and styled using Tailwind CSS classes.
*   **State Management**: For local component state, use React's `useState`. For global application state, leverage `useContext` (e.g., `AuthContext`). For server state management (data fetching, caching, and synchronization), prefer `@tanstack/react-query`.
*   **Routing**: All client-side navigation must be implemented using `react-router-dom`. Keep route definitions centralized in `src/App.tsx`.
*   **Styling**: Apply all styling using Tailwind CSS classes. Avoid inline styles unless absolutely necessary for dynamic, computed values.
*   **Backend & Database**: All authentication, database interactions, and calls to serverless functions (RPC) must be done through the `supabase` client from `src/integrations/supabase/client.ts`.
*   **Form Handling**: For any forms requiring input validation and state management, use `react-hook-form` in conjunction with `zod` for schema definition.
*   **Date & Time**: Use `date-fns` for any operations involving dates and times, including formatting, parsing, and calculations.
*   **XML Parsing**: For parsing XML content, use the native `DOMParser` API as demonstrated in `src/utils/xmlParser.ts`.
*   **Charts & Graphs**: For any data visualization needs, use `recharts`.