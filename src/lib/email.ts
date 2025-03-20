
export const sendConfirmationEmail = async (email: string, confirmationUrl?: string) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        confirmationUrl: confirmationUrl || `${window.location.origin}/verify`
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar email de confirmação:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    return { success: false, error };
  }
};
