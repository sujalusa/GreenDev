'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Recommendation, BeforeAfterState } from '@/types';

interface SimulatorProps {
  before: BeforeAfterState;
  recommendations: Recommendation[];
}

export function Simulator({ before, recommendations }: SimulatorProps) {
  const [activeRecs, setActiveRecs] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (activeRecs.size === recommendations.length) {
      setActiveRecs(new Set());
    } else {
      setActiveRecs(new Set(recommendations.map((r) => r.id)));
    }
  };

  const toggleRec = (id: string, checked: boolean) => {
    const next = new Set(activeRecs);
    if (checked) next.add(id);
    else next.delete(id);
    setActiveRecs(next);
  };

  const parseNum = (str?: string) => {
    if (!str) return 0;
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const baseCost = parseNum(before.estimatedMonthlyCost);
  const baseCO2 = parseNum(before.estimatedMonthlyCO2);

  let simulatedCost = baseCost;
  let simulatedCO2 = baseCO2;

  activeRecs.forEach((id) => {
    const rec = recommendations.find((r) => r.id === id);
    if (rec) {
      simulatedCost -= parseNum(rec.estimatedCostSaved);
      simulatedCO2 -= parseNum(rec.estimatedCO2Saved);
    }
  });

  simulatedCost = Math.max(0, simulatedCost);
  simulatedCO2 = Math.max(0, simulatedCO2);

  return (
    <Card className="p-5 space-y-5" elevated>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            What-If Simulator 🔮
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Toggle recommendations to see projected savings
          </p>
        </div>
        <Toggle
          checked={activeRecs.size === recommendations.length && recommendations.length > 0}
          onChange={toggleAll}
          labelOff="None"
          labelOn="All"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-4 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center transition-colors"
          style={{ background: 'var(--color-surface-offset)' }}
        >
          <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-faint)' }}>
            Est. Monthly Cost
          </span>
          <span
            className="text-3xl font-mono font-bold"
            style={{ color: Math.abs(simulatedCost - baseCost) > 0.01 ? 'var(--color-success)' : 'var(--color-text)' }}
          >
            ${simulatedCost.toFixed(2)}
          </span>
          {Math.abs(simulatedCost - baseCost) > 0.01 && (
            <span className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>
              -${(baseCost - simulatedCost).toFixed(2)} / mo
            </span>
          )}
        </div>
        <div
          className="p-4 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center transition-colors"
          style={{ background: 'var(--color-surface-offset)' }}
        >
          <span className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-faint)' }}>
            Est. Monthly CO₂
          </span>
          <span
            className="text-3xl font-mono font-bold"
            style={{ color: Math.abs(simulatedCO2 - baseCO2) > 0.01 ? 'var(--color-primary)' : 'var(--color-text)' }}
          >
            {simulatedCO2.toFixed(1)}kg
          </span>
          {Math.abs(simulatedCO2 - baseCO2) > 0.01 && (
            <span className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>
              -{Math.abs(baseCO2 - simulatedCO2).toFixed(1)}kg / mo
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] tabular-nums"
            style={{ background: 'var(--color-bg)' }}
          >
            <Toggle
              checked={activeRecs.has(rec.id)}
              onChange={(c) => toggleRec(rec.id, c)}
              labelOff=""
              labelOn=""
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{rec.title}</div>
              <div className="text-xs flex gap-2 mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {rec.estimatedCostSaved && <span>Saves {rec.estimatedCostSaved}</span>}
                {rec.estimatedCO2Saved && <span>Saves {rec.estimatedCO2Saved}</span>}
              </div>
            </div>
            <Badge variant="effort" level={rec.effort}>
              Effort: {rec.effort}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
