import { supabase } from '@/integrations/supabase/client';

export async function logAdminAction(
  actionType: string,
  targetUserId: string | null = null,
  details: Record<string, any> | null = null
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || null;

    if (!adminId) {
      console.warn('Admin action attempted without authenticated admin user. Action:', actionType);
      return;
    }

    const { error } = await supabase.rpc('log_admin_action', {
      p_action_type: actionType,
      p_target_user_id: targetUserId,
      p_details: details,
      p_admin_id: adminId
    });

    if (error) {
      console.error('Error logging admin action:', error);
    } else {
      console.log('Admin action logged:', actionType, { adminId, targetUserId, details });
    }
  } catch (error) {
    console.error('Unexpected error in logAdminAction:', error);
  }
}