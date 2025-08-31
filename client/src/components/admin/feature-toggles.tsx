import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function FeatureToggles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<any>({
    queryKey: ['/api/settings'],
  });

  const { data: stages = [] } = useQuery<any[]>({
    queryKey: ['/api/stages'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    updateSettingsMutation.mutate({
      features: {
        ...settings?.features,
        [feature]: enabled
      }
    });
  };

  const handleICOToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({
      isIcoActive: enabled
    });
  };

  const handleStageChange = (stageId: string) => {
    updateSettingsMutation.mutate({
      currentStageId: stageId
    });
  };

  const handleApiKeySave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const apiKeys = {
      rewonApiKey: formData.get('rewonApiKey') as string || undefined,
      nowpaymentsApiKey: formData.get('nowpaymentsApiKey') as string || undefined,
      nowpaymentsPublicKey: formData.get('nowpaymentsPublicKey') as string || undefined,
    };

    updateSettingsMutation.mutate({ apiKeys });
  };

  if (!settings) {
    return <div className="text-center py-8 text-muted-foreground">Loading settings...</div>;
  }

  const featureList = [
    { key: 'wallet', label: 'Wallet Connection', description: 'Show wallet connect button' },
    { key: 'purchase', label: 'Token Purchase', description: 'Show purchase interface' },
    { key: 'dashboard', label: 'Personal Dashboard', description: 'Show user portfolio' },
    { key: 'tokenomics', label: 'Tokenomics Page', description: 'Show tokenomics section' },
    { key: 'pioneers', label: 'Pioneers Hub', description: 'Show pioneers section' },
    { key: 'history', label: 'Transaction History', description: 'Show user transactions' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* General Settings */}
      <Card className="glass-card rounded-xl" data-testid="card-general-settings">
        <CardHeader>
          <CardTitle className="text-xl">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">ICO Status</p>
              <p className="text-sm text-muted-foreground">Enable or disable the entire ICO</p>
            </div>
            <Switch
              checked={settings.isIcoActive}
              onCheckedChange={handleICOToggle}
              data-testid="toggle-ico-active"
            />
          </div>

          <div>
            <Label htmlFor="active-stage" className="text-sm font-medium mb-2">Current Active Stage</Label>
            <Select value={settings.currentStageId} onValueChange={handleStageChange}>
              <SelectTrigger data-testid="select-active-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage: any) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card className="glass-card rounded-xl" data-testid="card-api-settings">
        <CardHeader>
          <CardTitle className="text-xl">API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleApiKeySave} className="space-y-4">
            <div>
              <Label htmlFor="rewon-api-key" className="text-sm font-medium mb-2">Rewon.io API Key</Label>
              <Input
                id="rewon-api-key"
                name="rewonApiKey"
                type="password"
                placeholder="Enter Rewon.io API key"
                defaultValue={settings.apiKeys?.rewonApiKey || ''}
                data-testid="input-rewon-api-key"
              />
            </div>
            <div>
              <Label htmlFor="nowpayments-api-key" className="text-sm font-medium mb-2">NOWPayments API Key</Label>
              <Input
                id="nowpayments-api-key"
                name="nowpaymentsApiKey"
                type="password"
                placeholder="Enter NOWPayments API key"
                defaultValue={settings.apiKeys?.nowpaymentsApiKey || ''}
                data-testid="input-nowpayments-api-key"
              />
            </div>
            <div>
              <Label htmlFor="nowpayments-public-key" className="text-sm font-medium mb-2">NOWPayments Public Key (IPN)</Label>
              <Input
                id="nowpayments-public-key"
                name="nowpaymentsPublicKey"
                type="password"
                placeholder="Enter NOWPayments Public Key for webhook verification"
                defaultValue={settings.apiKeys?.nowpaymentsPublicKey || ''}
                data-testid="input-nowpayments-public-key"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/80 text-accent-foreground transition-colors"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-api-keys"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save API Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card className="glass-card rounded-xl lg:col-span-2" data-testid="card-feature-toggles">
        <CardHeader>
          <CardTitle className="text-xl">Dashboard Feature Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureList.map((feature) => (
              <div 
                key={feature.key}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
                data-testid={`feature-toggle-${feature.key}`}
              >
                <div>
                  <p className="font-medium text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <Switch
                  checked={settings.features?.[feature.key as keyof typeof settings.features] || false}
                  onCheckedChange={(enabled) => handleFeatureToggle(feature.key, enabled)}
                  data-testid={`switch-${feature.key}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}