'use client';

import { CityData } from '@/types';
import { calculateCAGR, calculateTotalGrowth, calculateMaxDrawdown } from '@/lib/calculations';
import { CITY_COLORS } from '@/lib/constants';

interface StatsGridProps {
    cityData: CityData;
}

export default function StatsGrid({ cityData }: StatsGridProps) {
    const cities = Object.keys(cityData).filter(city => cityData[city].length >= 2);

    if (cities.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => {
                const data = cityData[city];
                const lastValue = data[data.length - 1].value;
                const growth = calculateTotalGrowth(data);
                const cagr = calculateCAGR(data);
                const drawdown = calculateMaxDrawdown(data);

                return (
                    <div
                        key={city}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4"
                        style={{ borderLeftColor: CITY_COLORS[city] || '#94a3b8' }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                                    {city}
                                </h3>
                                <div className="text-3xl font-bold text-slate-900">
                                    {lastValue.toFixed(1)}
                                </div>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8', opacity: 0.2 }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Growth</span>
                                <span
                                    className={`text-sm font-semibold ${
                                        growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}
                                >
                  {growth >= 0 ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}%
                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">CAGR</span>
                                <span className="text-sm font-semibold text-slate-900">
                  {cagr.toFixed(2)}%
                </span>
                            </div>

                            {drawdown.maxDrawdown > 0 && (
                                <div className="pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-500">Max Drawdown</span>
                                        <span className="text-xs font-semibold text-red-600">
                      -{drawdown.maxDrawdown.toFixed(1)}%
                    </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {drawdown.peakDate} → {drawdown.troughDate}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}