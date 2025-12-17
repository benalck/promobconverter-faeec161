import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building2, 
  Settings, 
  CreditCard,
  Save,
  RefreshCw,
  Wallet,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  company_name: string;
  default_currency: string;
  default_unit: string;
  default_margin: number;
  sheet_cost: number;
  labor_cost_per_hour: number;
  markup: number;
  edge_banding_cost_per_meter: number;
  hardware_cost_percentage: number;
}

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [settings, setSettings] = useState<UserSettings>({
    company_name: '',
    default_currency: 'BRL',
    default_unit: 'mm',
    default_margin: 10,
    sheet_cost: 120,
    labor_cost_per_hour: 35,
    markup: 1.7,
    edge_banding_cost_per_meter: 2.5,
    hardware_cost_percentage: 15
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_cost_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          ...settings,
          sheet_cost: data.sheet_cost || 120,
          labor_cost_per_hour: data.labor_cost_per_hour || 35,
          markup: data.markup || 1.7,
          edge_banding_cost_per_meter: data.edge_banding_cost_per_meter || 2.5,
          hardware_cost_percentage: data.hardware_cost_percentage || 15
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, name: profile.name, phone: profile.phone } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil.",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    
    try {
      const { error } = await supabase
        .from('user_cost_settings')
        .upsert({
          user_id: user.id,
          sheet_cost: settings.sheet_cost,
          labor_cost_per_hour: settings.labor_cost_per_hour,
          markup: settings.markup,
          edge_banding_cost_per_meter: settings.edge_banding_cost_per_meter,
          hardware_cost_percentage: settings.hardware_cost_percentage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas configurações.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Calcular próxima recarga de créditos
  const getNextRefillDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência e configure suas preferências
          </p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Créditos</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da empresa (opcional)</Label>
                    <Input
                      id="company"
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      placeholder="Sua empresa"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={savingProfile}
                    className="w-full md:w-auto"
                  >
                    {savingProfile ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Perfil
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glass-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Configurações de Cálculo
                  </CardTitle>
                  <CardDescription>
                    Defina valores padrão para seus cálculos e orçamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda padrão</Label>
                      <Select 
                        value={settings.default_currency} 
                        onValueChange={(v) => setSettings({ ...settings, default_currency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidade de medida</Label>
                      <Select 
                        value={settings.default_unit} 
                        onValueChange={(v) => setSettings({ ...settings, default_unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mm">Milímetros (mm)</SelectItem>
                          <SelectItem value="cm">Centímetros (cm)</SelectItem>
                          <SelectItem value="m">Metros (m)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4">Valores de Custo</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sheet_cost">Custo da chapa (R$)</Label>
                        <Input
                          id="sheet_cost"
                          type="number"
                          value={settings.sheet_cost}
                          onChange={(e) => setSettings({ ...settings, sheet_cost: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="labor_cost">Custo mão de obra/hora (R$)</Label>
                        <Input
                          id="labor_cost"
                          type="number"
                          value={settings.labor_cost_per_hour}
                          onChange={(e) => setSettings({ ...settings, labor_cost_per_hour: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markup">Markup</Label>
                        <Input
                          id="markup"
                          type="number"
                          step="0.1"
                          value={settings.markup}
                          onChange={(e) => setSettings({ ...settings, markup: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edge_cost">Custo fita de borda/metro (R$)</Label>
                        <Input
                          id="edge_cost"
                          type="number"
                          step="0.1"
                          value={settings.edge_banding_cost_per_meter}
                          onChange={(e) => setSettings({ ...settings, edge_banding_cost_per_meter: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hardware_cost">Percentual ferragens (%)</Label>
                        <Input
                          id="hardware_cost"
                          type="number"
                          value={settings.hardware_cost_percentage}
                          onChange={(e) => setSettings({ ...settings, hardware_cost_percentage: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={savingSettings}
                    className="w-full md:w-auto"
                  >
                    {savingSettings ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Preferências
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Suas preferências são aplicadas automaticamente</h3>
                      <p className="text-sm text-muted-foreground">
                        Todas as configurações que você define aqui são usadas automaticamente 
                        nas suas próximas conversões e orçamentos. Quanto mais personalizado, 
                        mais eficiente é seu trabalho.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" id="credits">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glass-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Seus Créditos
                  </CardTitle>
                  <CardDescription>
                    Acompanhe e gerencie seus créditos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-6 h-6 text-primary" />
                        <span className="text-sm text-muted-foreground">Créditos disponíveis</span>
                      </div>
                      <p className="text-4xl font-bold text-primary">{user?.credits || 0}</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-muted/50 border">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Próxima recarga</span>
                      </div>
                      <p className="text-lg font-semibold">{getNextRefillDate()}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renovação automática mensal
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-green-700">Créditos renováveis automaticamente</h3>
                      <p className="text-sm text-muted-foreground">
                        Seus créditos são renovados automaticamente no primeiro dia de cada mês. 
                        Você sempre terá créditos disponíveis para usar o sistema normalmente.
                        Use sem preocupação!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
