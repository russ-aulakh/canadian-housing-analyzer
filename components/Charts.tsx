'use client';

import { useState, useEffect, useRef } from 'react';
import { CityData } from '@/types';
import { CITY_COLORS } from '@/lib/constants';
import { calculateTotalGrowth, calculateMaxDrawdown } from '@/lib/calculations';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface ChartsProps {
    cityData: CityData;
    onResetChart: () => void;
    startDate: string;
    endDate: string;
}

export default function Charts({ cityData, onResetChart, startDate, endDate }: ChartsProps) {
    const cities = Object.keys(cityData).filter(city => cityData[city].length > 0);

    const [visibleCities, setVisibleCities] = useState<Set<string>>(new Set(cities));
    const [priceHoverDate, setPriceHoverDate] = useState<string | null>(null);
    const [priceHoverValues, setPriceHoverValues] = useState<Map<string, number>>(new Map());
    const [growthHoverDate, setGrowthHoverDate] = useState<string | null>(null);
    const [growthHoverValues, setGrowthHoverValues] = useState<Map<string, number>>(new Map());

    const priceChartRef = useRef<HTMLDivElement>(null);
    const growthChartRef = useRef<HTMLDivElement>(null);

    // NEW YoY chart ref
    const yoyChartRef = useRef<HTMLDivElement>(null);
    const [yoyHoverDate, setYoyHoverDate] = useState<string | null>(null);
    const [yoyHoverValues, setYoyHoverValues] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        setVisibleCities(new Set(cities));
    }, [cities.join(',')]);

    // ---------- EXISTING HOVER LOGIC FOR PRICE CHART (unchanged) ----------
    useEffect(() => {
        const container = priceChartRef.current;
        if (!container || cities.length === 0) return;

        let plotDiv: any = null;
        let cleanupCalled = false;

        const setupListeners = () => {
            plotDiv = container.querySelector('.js-plotly-plot') as any;

            if (plotDiv && plotDiv.on && !cleanupCalled) {
                const handleHover = (data: any) => {
                    if (data?.points && data.points.length > 0) {
                        const date = data.points[0].x;
                        const valuesMap = new Map<string, number>();

                        data.points.forEach((point: any) => {
                            if (point.data && point.data.name && point.y !== undefined) {
                                valuesMap.set(point.data.name, point.y);
                            }
                        });

                        if (valuesMap.size === 0) {
                            cities.forEach(city => {
                                const cityPoints = cityData[city];
                                const point = cityPoints.find(d => d.date === date);
                                if (point) {
                                    valuesMap.set(city, point.value);
                                }
                            });
                        }

                        setPriceHoverDate(date);
                        setPriceHoverValues(valuesMap);
                    }
                };

                const handleUnhover = () => {
                    setPriceHoverDate(null);
                    setPriceHoverValues(new Map());
                };

                plotDiv.on('plotly_hover', handleHover);
                plotDiv.on('plotly_unhover', handleUnhover);
            }
        };

        setupListeners();
        const timer = setTimeout(setupListeners, 500);

        return () => {
            cleanupCalled = true;
            clearTimeout(timer);
            if (plotDiv) {
                try {
                    plotDiv.removeAllListeners?.('plotly_hover');
                    plotDiv.removeAllListeners?.('plotly_unhover');
                } catch (e) {}
            }
        };
    }, [cities, cityData]);

    // ---------- EXISTING HOVER LOGIC FOR GROWTH CHART (unchanged) ----------
    useEffect(() => {
        const container = growthChartRef.current;
        if (!container || cities.length === 0) return;

        let plotDiv: any = null;
        let cleanupCalled = false;

        const setupListeners = () => {
            plotDiv = container.querySelector('.js-plotly-plot') as any;

            if (plotDiv && plotDiv.on && !cleanupCalled) {
                const handleHover = (data: any) => {
                    if (data?.points && data.points.length > 0) {
                        const date = data.points[0].x;
                        const valuesMap = new Map<string, number>();

                        data.points.forEach((point: any) => {
                            if (point.data && point.data.name && point.y !== undefined) {
                                valuesMap.set(point.data.name, point.y);
                            }
                        });

                        if (valuesMap.size === 0) {
                            cities.forEach(city => {
                                const cityPoints = cityData[city];
                                const baseValue = cityPoints[0]?.value || 1;
                                const point = cityPoints.find(d => d.date === date);
                                if (point) {
                                    const growth = ((point.value - baseValue) / baseValue) * 100;
                                    valuesMap.set(city, growth);
                                }
                            });
                        }

                        setGrowthHoverDate(date);
                        setGrowthHoverValues(valuesMap);
                    }
                };

                const handleUnhover = () => {
                    setGrowthHoverDate(null);
                    setGrowthHoverValues(new Map());
                };

                plotDiv.on('plotly_hover', handleHover);
                plotDiv.on('plotly_unhover', handleUnhover);
            }
        };

        setupListeners();
        const timer = setTimeout(setupListeners, 500);

        return () => {
            cleanupCalled = true;
            clearTimeout(timer);
            if (plotDiv) {
                try {
                    plotDiv.removeAllListeners?.('plotly_hover');
                    plotDiv.removeAllListeners?.('plotly_unhover');
                } catch (e) {}
            }
        };
    }, [cities, cityData]);

    // ---------- NEW: YoY hover listeners ----------
    useEffect(() => {
        const container = yoyChartRef.current;
        if (!container || cities.length === 0) return;

        let plotDiv: any = null;
        let cleanupCalled = false;

        const setupListeners = () => {
            plotDiv = container.querySelector('.js-plotly-plot') as any;

            if (plotDiv && plotDiv.on && !cleanupCalled) {
                const handleHover = (data: any) => {
                    if (data?.points && data.points.length > 0) {
                        const date = data.points[0].x;
                        const valuesMap = new Map<string, number>();

                        data.points.forEach((point: any) => {
                            if (point.data?.name && point.y !== undefined) {
                                valuesMap.set(point.data.name, point.y);
                            }
                        });

                        setYoyHoverDate(date);
                        setYoyHoverValues(valuesMap);
                    }
                };

                const handleUnhover = () => {
                    setYoyHoverDate(null);
                    setYoyHoverValues(new Map());
                };

                plotDiv.on('plotly_hover', handleHover);
                plotDiv.on('plotly_unhover', handleUnhover);
            }
        };

        setupListeners();
        const timer = setTimeout(setupListeners, 500);

        return () => {
            cleanupCalled = true;
            clearTimeout(timer);
            if (plotDiv) {
                try {
                    plotDiv.removeAllListeners?.('plotly_hover');
                    plotDiv.removeAllListeners?.('plotly_unhover');
                } catch (e) {}
            }
        };
    }, [cities, cityData]);

    const toggleCity = (city: string) => {
        const newVisible = new Set(visibleCities);
        if (newVisible.has(city)) newVisible.delete(city);
        else newVisible.add(city);
        setVisibleCities(newVisible);
    };

    const handleResetChart = () => {
        setVisibleCities(new Set(cities));
        onResetChart();
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month] = dateStr.split('-');
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return `${months[parseInt(month) - 1]} ${year}`;
    };

    const formatDateRangeShort = (start: string, end: string) => {
        const short = (d: string) => {
            const [year, month] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(month) - 1]} ${year}`;
        };
        return `${short(start)} – ${short(end)}`;
    };

    if (cities.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                </div>
                <p className="text-slate-600">Select cities to view charts</p>
            </div>
        );
    }

    const visibleCitiesList = cities.filter(city => visibleCities.has(city));

    // ---------- EXISTING PRICE TRACES ----------
    const priceTraces = cities.map(city => ({
        x: cityData[city].map(d => d.date),
        y: cityData[city].map(d => d.value),
        name: city,
        type: 'scatter' as const,
        mode: 'lines' as const,
        visible: visibleCities.has(city) ? true : 'legendonly' as const,
        line: { width: 2.5, color: CITY_COLORS[city] || '#94a3b8' },
        hovertemplate: '%{y:.1f}<extra></extra>'
    }));

    // ---------- EXISTING CUMULATIVE GROWTH TRACES ----------
    const growthTraces = cities.map(city => {
        const data = cityData[city];
        const base = data[0]?.value || 1;
        return {
            x: data.map(d => d.date),
            y: data.map(d => ((d.value - base) / base) * 100),
            name: city,
            type: 'scatter' as const,
            mode: 'lines' as const,
            visible: visibleCities.has(city) ? true : 'legendonly' as const,
            line: { width: 2.5, color: CITY_COLORS[city] || '#94a3b8' },
            hovertemplate: '%{y:.1f}%<extra></extra>'
        };
    });

    // ---------- NEW: YoY TRACES ----------
    const yoyTraces = cities.map(city => {
        const data = cityData[city];
        const valueMap = new Map<string, number>();
        data.forEach(d => valueMap.set(d.date, d.value));

        const yoy = data.map(d => {
            const [y, m] = d.date.split('-').map(Number);
            const lastYearDate = `${y - 1}-${String(m).padStart(2, '0')}`;
            if (!valueMap.has(lastYearDate)) return null;
            const prev = valueMap.get(lastYearDate)!;
            if (prev === 0) return null;
            return ((d.value - prev) / prev) * 100;
        });

        return {
            x: data.map(d => d.date),
            y: yoy,
            name: city,
            type: 'scatter' as const,
            mode: 'lines' as const,
            connectgaps: false,
            visible: visibleCities.has(city) ? true : 'legendonly' as const,
            line: { width: 2.5, color: CITY_COLORS[city] || '#94a3b8' },
            hovertemplate: '%{y:.1f}%<extra></extra>'
        };
    });

    // ---------- EXISTING COMPARISON & DRAWDOWN ----------
    const comparisons = visibleCitiesList
        .map(city => ({ city, growth: calculateTotalGrowth(cityData[city]) }))
        .sort((a, b) => b.growth - a.growth);

    const comparisonTrace = {
        x: comparisons.map(c => c.city),
        y: comparisons.map(c => c.growth),
        type: 'bar' as const,
        marker: {
            color: comparisons.map(c => CITY_COLORS[c.city] || '#94a3b8'),
            line: { width: 0 }
        },
        hovertemplate: '<b>%{x}</b><br>Growth: %{y:.1f}%<extra></extra>',
        showlegend: false,
    };

    const drawdowns = visibleCitiesList
        .map(city => {
            const dd = calculateMaxDrawdown(cityData[city]);
            return {
                city,
                drawdown: dd.maxDrawdown,
                peakDate: dd.peakDate,
                troughDate: dd.troughDate,
                hoverText:
                    dd.maxDrawdown > 0
                        ? `<b>${city}</b><br>Max Drawdown: -${dd.maxDrawdown.toFixed(1)}%<br>Period: ${dd.peakDate} → ${dd.troughDate}`
                        : `<b>${city}</b><br>No drawdown`,
            };
        })
        .sort((a, b) => b.drawdown - a.drawdown);

    const drawdownTrace = {
        x: drawdowns.map(d => d.city),
        y: drawdowns.map(d => -d.drawdown),
        text: drawdowns.map(d => d.hoverText),
        hovertemplate: '%{text}<extra></extra>',
        type: 'bar' as const,
        marker: {
            color: drawdowns.map(d => CITY_COLORS[d.city] || '#94a3b8'),
            line: { width: 0 }
        },
        showlegend: false,
    };

    const commonLayout = {
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Inter, system-ui, sans-serif', size: 12, color: '#475569' },
        xaxis: { gridcolor: '#f1f5f9', showgrid: true, zeroline: false },
        yaxis: { gridcolor: '#f1f5f9', showgrid: true, zeroline: true, zerolinecolor: '#cbd5e1' },
    };

    return (
        <div className="space-y-6">

            {/* ---------------- PRICE INDEX CHART ---------------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-slate-900">
                            Price Index Over Time
                            {priceHoverDate && (
                                <span className="text-blue-600 ml-2">({formatDateDisplay(priceHoverDate)})</span>
                            )}
                        </h2>
                        <button
                            onClick={handleResetChart}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Reset Chart & Timeline
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-4 max-h-32 overflow-y-auto border-b border-slate-100">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {cities.map(city => {
                            const hoverValue = priceHoverValues.get(city);
                            const isVisible = visibleCities.has(city);
                            return (
                                <button
                                    key={city}
                                    onClick={() => toggleCity(city)}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                                        isVisible ? 'opacity-100 hover:bg-slate-50' : 'opacity-50 hover:opacity-70'
                                    }`}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                                    />
                                    <span className={`text-xs text-slate-600 ${!isVisible ? 'line-through' : ''}`}>
                                        {city}
                                        {hoverValue !== undefined && isVisible && (
                                            <span className="text-slate-500 ml-1">({hoverValue.toFixed(1)})</span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div ref={priceChartRef} className="px-6 pb-6">
                    <Plot
                        data={priceTraces as any}
                        layout={{
                            ...commonLayout,
                            margin: { t: 10, r: 20, l: 60, b: 60 },
                            yaxis: { ...commonLayout.yaxis, title: 'Index Value' },
                            hovermode: 'x',
                            showlegend: false,
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        className="w-full"
                        style={{ width: '100%', height: '450px' }}
                    />
                </div>
            </div>

            {/* ---------------- CUMULATIVE GROWTH ---------------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-slate-900">
                            Cumulative Growth
                            {growthHoverDate && (
                                <span className="text-blue-600 ml-2">({formatDateDisplay(growthHoverDate)})</span>
                            )}
                        </h2>
                        <button
                            onClick={handleResetChart}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Reset Chart & Timeline
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-4 max-h-32 overflow-y-auto border-b border-slate-100">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {cities.map(city => {
                            const hoverValue = growthHoverValues.get(city);
                            const isVisible = visibleCities.has(city);
                            return (
                                <button
                                    key={city}
                                    onClick={() => toggleCity(city)}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                                        isVisible ? 'opacity-100 hover:bg-slate-50' : 'opacity-50 hover:opacity-70'
                                    }`}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                                    />
                                    <span className={`text-xs text-slate-600 ${!isVisible ? 'line-through' : ''}`}>
                                        {city}
                                        {hoverValue !== undefined && isVisible && (
                                            <span className={`ml-1 ${hoverValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ({hoverValue >= 0 ? '+' : ''}{hoverValue.toFixed(1)}%)
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div ref={growthChartRef} className="px-6 pb-6">
                    <Plot
                        data={growthTraces as any}
                        layout={{
                            ...commonLayout,
                            margin: { t: 10, r: 20, l: 60, b: 60 },
                            yaxis: { ...commonLayout.yaxis, title: 'Growth (%)' },
                            hovermode: 'x',
                            showlegend: false,
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        className="w-full"
                        style={{ width: '100%', height: '450px' }}
                    />
                </div>
            </div>

            {/* ---------------- NEW YoY GROWTH CHART ---------------- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-slate-900">
                            Year-on-Year Growth
                            {yoyHoverDate && (
                                <span className="text-blue-600 ml-2">({formatDateDisplay(yoyHoverDate)})</span>
                            )}
                        </h2>
                        <button
                            onClick={handleResetChart}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Reset Chart & Timeline
                        </button>
                    </div>
                </div>

                <div className="px-6 pb-4 max-h-32 overflow-y-auto border-b border-slate-100">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {cities.map(city => {
                            const hoverValue = yoyHoverValues.get(city);
                            const isVisible = visibleCities.has(city);
                            return (
                                <button
                                    key={city}
                                    onClick={() => toggleCity(city)}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                                        isVisible ? 'opacity-100 hover:bg-slate-50' : 'opacity-50 hover:opacity-70'
                                    }`}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                                    />
                                    <span className={`text-xs text-slate-600 ${!isVisible ? 'line-through' : ''}`}>
                                        {city}
                                        {hoverValue !== undefined && hoverValue !== null && isVisible && (
                                            <span className={`ml-1 ${hoverValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ({hoverValue >= 0 ? '+' : ''}{hoverValue.toFixed(1)}%)
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div ref={yoyChartRef} className="px-6 pb-6">
                    <Plot
                        data={yoyTraces as any}
                        layout={{
                            ...commonLayout,
                            margin: { t: 10, r: 20, l: 60, b: 60 },
                            yaxis: { ...commonLayout.yaxis, title: 'YoY Growth (%)' },
                            hovermode: 'x',
                            showlegend: false,
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        className="w-full"
                        style={{ width: '100%', height: '450px' }}
                    />
                </div>
            </div>

            {/* ---------------- TOTAL GROWTH & DRAWDOWN ---------------- */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            Total Growth
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {formatDateRangeShort(startDate, endDate)}
                        </p>
                    </div>

                    <div className="mb-4 max-h-24 overflow-y-auto">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {cities.map(city => {
                                const isVisible = visibleCities.has(city);
                                return (
                                    <button
                                        key={city}
                                        onClick={() => toggleCity(city)}
                                        className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all ${
                                            isVisible ? 'opacity-100 hover:bg-slate-50' : 'opacity-50 hover:opacity-70'
                                        }`}
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                                        />
                                        <span className={`text-xs text-slate-600 ${!isVisible ? 'line-through' : ''}`}>{city}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full" style={{ minHeight: '300px' }}>
                        <Plot
                            data={[comparisonTrace] as any}
                            layout={{
                                ...commonLayout,
                                margin: { t: 10, r: 20, l: 60, b: 120 },
                                yaxis: { ...commonLayout.yaxis, title: 'Growth (%)' },
                                xaxis: { ...commonLayout.xaxis, tickangle: -45 },
                                showlegend: false,
                            }}
                            config={{ responsive: true, displayModeBar: false }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '300px' }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            Max Drawdown
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {formatDateRangeShort(startDate, endDate)}
                        </p>
                    </div>

                    <div className="mb-4 max-h-24 overflow-y-auto">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {cities.map(city => {
                                const isVisible = visibleCities.has(city);
                                return (
                                    <button
                                        key={city}
                                        onClick={() => toggleCity(city)}
                                        className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all ${
                                            isVisible ? 'opacity-100 hover:bg-slate-50' : 'opacity-50 hover:opacity-70'
                                        }`}
                                    >
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                                        />
                                        <span className={`text-xs text-slate-600 ${!isVisible ? 'line-through' : ''}`}>{city}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full" style={{ minHeight: '300px' }}>
                        <Plot
                            data={[drawdownTrace] as any}
                            layout={{
                                ...commonLayout,
                                margin: { t: 10, r: 20, l: 60, b: 120 },
                                yaxis: { ...commonLayout.yaxis, title: 'Drawdown (%)' },
                                xaxis: { ...commonLayout.xaxis, tickangle: -45 },
                                showlegend: false,
                            }}
                            config={{ responsive: true, displayModeBar: false }}
                            className="w-full h-full"
                            style={{ width: '100%', height: '300px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
