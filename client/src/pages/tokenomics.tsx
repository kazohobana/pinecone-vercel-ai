import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TokenomicsChart from "@/components/charts/tokenomics-chart";

export default function Tokenomics() {
  const tokenDetails = [
    { label: "Total Supply", value: "1,000,000,000 SAI" },
    { label: "ICO Allocation", value: "30% (300M SAI)" },
    { label: "Team & Development", value: "20% (200M SAI)" },
    { label: "Ecosystem & Rewards", value: "25% (250M SAI)" },
    { label: "Marketing & Partners", value: "15% (150M SAI)" },
    { label: "Reserve Fund", value: "10% (100M SAI)" }
  ];

  const icoStages: any[] = [];

  return (
    <div className="space-y-8">
      <Card className="glass-card rounded-xl border-primary/10" data-testid="card-tokenomics">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            $SAI Tokenomics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Token Distribution</h3>
              <div className="relative">
                <TokenomicsChart />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Token Details</h3>
              <div className="space-y-4">
                {tokenDetails.map((detail, index) => (
                  <Card key={index} className="glass-card border-border/50" data-testid={`detail-${index}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{detail.label}</span>
                        <span className="font-bold">{detail.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold mb-2">ICO Stages</h4>
                <div className="space-y-2">
                  {icoStages.map((stage, index) => (
                    <div key={index} className="flex justify-between text-sm" data-testid={`stage-${index}`}>
                      <span>{stage.name}</span>
                      <span className={stage.statusColor}>
                        {stage.price} - {stage.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
