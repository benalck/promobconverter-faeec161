-- Drop the trigger that depends on the role column
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;

-- Remove deprecated role column from profiles table
-- Roles are now managed exclusively through user_roles table for security
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Create secure function for admins/CEOs to manage user roles
CREATE OR REPLACE FUNCTION public.manage_user_role(
  p_target_user_id UUID,
  p_role app_role,
  p_action TEXT -- 'add' or 'remove'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Only admins and CEOs can manage roles
  IF NOT public.is_admin_or_ceo() THEN
    RAISE EXCEPTION 'Access denied. Only admins and CEOs can manage roles.';
  END IF;

  -- Prevent users from modifying their own roles
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own role.';
  END IF;

  -- Prevent non-CEOs from creating CEOs or admins
  IF NOT public.is_ceo() AND p_role IN ('admin', 'ceo') THEN
    RAISE EXCEPTION 'Only CEOs can assign admin or CEO roles.';
  END IF;

  IF p_action = 'add' THEN
    -- Add role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, p_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the action
    PERFORM public.log_admin_action(
      'assign_role',
      p_target_user_id,
      jsonb_build_object('role', p_role, 'action', 'add')
    );
    
    RETURN jsonb_build_object(
      'success', TRUE,
      'message', 'Role added successfully',
      'role', p_role
    );
    
  ELSIF p_action = 'remove' THEN
    -- Remove role
    DELETE FROM public.user_roles
    WHERE user_id = p_target_user_id AND role = p_role;
    
    -- Log the action
    PERFORM public.log_admin_action(
      'remove_role',
      p_target_user_id,
      jsonb_build_object('role', p_role, 'action', 'remove')
    );
    
    RETURN jsonb_build_object(
      'success', TRUE,
      'message', 'Role removed successfully',
      'role', p_role
    );
    
  ELSE
    RAISE EXCEPTION 'Invalid action. Use "add" or "remove".';
  END IF;
END;
$$;

-- Create convenience function to set a user's role (replaces all roles with single role)
CREATE OR REPLACE FUNCTION public.set_user_role(
  p_target_user_id UUID,
  p_role app_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Only admins and CEOs can manage roles
  IF NOT public.is_admin_or_ceo() THEN
    RAISE EXCEPTION 'Access denied. Only admins and CEOs can manage roles.';
  END IF;

  -- Prevent users from modifying their own roles
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own role.';
  END IF;

  -- Prevent non-CEOs from creating CEOs or admins
  IF NOT public.is_ceo() AND p_role IN ('admin', 'ceo') THEN
    RAISE EXCEPTION 'Only CEOs can assign admin or CEO roles.';
  END IF;

  -- Remove all existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = p_target_user_id;
  
  -- Add the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user_id, p_role);
  
  -- Log the action
  PERFORM public.log_admin_action(
    'set_role',
    p_target_user_id,
    jsonb_build_object('new_role', p_role)
  );
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Role set successfully',
    'role', p_role
  );
END;
$$;