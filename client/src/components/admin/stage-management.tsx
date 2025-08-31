import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { IcoStage } from "@shared/schema";

export default function StageManagement() {
  const [selectedStage, setSelectedStage] = useState<IcoStage | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stages = [] } = useQuery<any[]>({
    queryKey: ['/api/stages'],
  });

  const updateStageMutation = useMutation({
    mutationFn: async (updatedStage: Partial<IcoStage>) => {
      if (!selectedStage) throw new Error("No stage selected");
      
      const response = await fetch(`/api/stages/${selectedStage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStage)
      });

      if (!response.ok) {
        throw new Error('Failed to update stage');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stages'] });
      toast({
        title: "Stage Updated",
        description: "Stage details have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update stage",
        variant: "destructive",
      });
    }
  });

  const handleStageEdit = (stage: IcoStage) => {
    setSelectedStage(stage);
  };

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStage) return;

    const formData = new FormData(e.currentTarget);
    updateStageMutation.mutate({
      name: formData.get('name') as string,
      tokenPrice: formData.get('tokenPrice') as string,
      totalTokens: parseInt(formData.get('totalTokens') as string),
      soldTokens: parseInt(formData.get('soldTokens') as string),
      minPurchase: parseInt(formData.get('minPurchase') as string),
      maxPurchase: parseInt(formData.get('maxPurchase') as string),
    });
  };

  const getStageStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'bg-primary/20 text-primary';
      case 'completed': return 'bg-green-400/20 text-green-400';
      case 'upcoming': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Stages List */}
      <Card className="glass-card rounded-xl" data-testid="card-stages-list">
        <CardHeader>
          <CardTitle className="text-xl">ICO Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage: any, index: number) => {
              const progress = stage.totalTokens > 0 ? (stage.soldTokens / stage.totalTokens) * 100 : 0;
              
              return (
                <Card 
                  key={stage.id}
                  className={`glass-card cursor-pointer transition-colors ${
                    selectedStage?.id === stage.id ? 'border-primary/50' : 'border-border'
                  }`}
                  onClick={() => handleStageEdit(stage)}
                  data-testid={`stage-card-${index}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${stage.status === 'active' ? 'text-primary' : 'text-foreground'}`}>
                        {stage.name}
                      </h4>
                      <Badge className={getStageStatusClass(stage.status)}>
                        {stage.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium ml-2">${stage.tokenPrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium ml-2">{progress.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Stage Editor */}
      <Card className="glass-card rounded-xl" data-testid="card-stage-editor">
        <CardHeader>
          <CardTitle className="text-xl">Edit Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedStage ? (
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2">Stage Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedStage.name}
                  className="w-full"
                  data-testid="input-stage-name"
                />
              </div>
              <div>
                <Label htmlFor="tokenPrice" className="text-sm font-medium mb-2">Token Price (USD)</Label>
                <Input
                  id="tokenPrice"
                  name="tokenPrice"
                  type="number"
                  step="0.001"
                  defaultValue={selectedStage.tokenPrice}
                  className="w-full"
                  data-testid="input-token-price"
                />
              </div>
              <div>
                <Label htmlFor="totalTokens" className="text-sm font-medium mb-2">Total Tokens</Label>
                <Input
                  id="totalTokens"
                  name="totalTokens"
                  type="number"
                  defaultValue={selectedStage.totalTokens}
                  className="w-full"
                  data-testid="input-total-tokens"
                />
              </div>
              <div>
                <Label htmlFor="soldTokens" className="text-sm font-medium mb-2">Tokens Sold</Label>
                <Input
                  id="soldTokens"
                  name="soldTokens"
                  type="number"
                  defaultValue={selectedStage.soldTokens}
                  className="w-full"
                  data-testid="input-sold-tokens"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase" className="text-sm font-medium mb-2">Min Purchase (USD)</Label>
                  <Input
                    id="minPurchase"
                    name="minPurchase"
                    type="number"
                    defaultValue={selectedStage.minPurchase}
                    className="w-full"
                    data-testid="input-min-purchase"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPurchase" className="text-sm font-medium mb-2">Max Purchase (USD)</Label>
                  <Input
                    id="maxPurchase"
                    name="maxPurchase"
                    type="number"
                    defaultValue={selectedStage.maxPurchase}
                    className="w-full"
                    data-testid="input-max-purchase"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground transition-colors"
                disabled={updateStageMutation.isPending}
                data-testid="button-save-stage"
              >
                {updateStageMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a stage from the list to edit
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
