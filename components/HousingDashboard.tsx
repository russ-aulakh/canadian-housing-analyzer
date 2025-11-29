'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchHousingData } from '@/lib/dataLoader';
import { CITY_COLORS, PROVINCES } from '@/lib/constants';
import { CityData } from '@/types';
import FilterPanel from './FilterPanel';
import StatsGrid from './StatsGrid';
import Charts from './Charts';

export default function HousingDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [cityData, setCityData] = useState<CityData>({});

    const [indexType, setIndexType] = useState('Total (house and land)');
    const [startDate, setStartDate] = useState('1981-01');
    const [endDate, setEndDate] = useState('2025-10');
    const [fullStartDate, setFullStartDate] = useState('1981-01');
    const [fullEndDate, setFullEndDate] = useState('2025-10');
    const [selectedCities, setSelectedCities] = useState<string[]>(PROVINCES);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (rawData.length > 0) {
            updateVisualization();
        }
    }, [indexType, startDate, endDate, selectedCities, rawData]);

    async function loadData() {
        try {
            setLoading(true);
            const data = await fetchHousingData();
            setRawData(data);

            const dates = data
                .map((row: any) => row.REF_DATE)
                .filter((date: string) => date?.match(/^\d{4}-\d{2}$/))
                .sort();

            if (dates.length > 0) {
                const earliestDate = dates[0];
                const latestDate = dates[dates.length - 1];

                setStartDate(earliestDate);
                setEndDate(latestDate);
                setFullStartDate(earliestDate);
                setFullEndDate(latestDate);
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to load housing data');
            setLoading(false);
        }
    }

    function updateVisualization() {
        const filtered = rawData.filter((row: any) => {
            return (
                row['New housing price indexes'] === indexType &&
                selectedCities.includes(row.GEO) &&
                row.REF_DATE >= startDate &&
                row.REF_DATE <= endDate &&
                row.VALUE &&
                row.VALUE !== '..'
            );
        });

        const organized: CityData = {};
        selectedCities.forEach((city) => {
            organized[city] = filtered
                .filter((row: any) => row.GEO === city)
                .map((row: any) => ({
                    date: row.REF_DATE,
                    value: parseFloat(row.VALUE),
                }))
                .sort((a, b) => a.date.localeCompare(b.date));
        });

        setCityData(organized);
    }

    const handleResetDates = useCallback(() => {
        setStartDate(fullStartDate);
        setEndDate(fullEndDate);
    }, [fullStartDate, fullEndDate]);

    const handleResetChart = useCallback(() => {
        setStartDate(fullStartDate);
        setEndDate(fullEndDate);
    }, [fullStartDate, fullEndDate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <p className="text-slate-600 font-medium">Loading housing data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
                        Canadian Housing Index
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Analyze housing price trends across Canada
                    </p>
                </div>

                {/* Filters */}
                <FilterPanel
                    indexType={indexType}
                    setIndexType={setIndexType}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    selectedCities={selectedCities}
                    setSelectedCities={setSelectedCities}
                    availableCities={Object.keys(CITY_COLORS).sort()}
                    onResetDates={handleResetDates}
                />

                {/* Charts - pass date range */}
                <Charts
                    cityData={cityData}
                    onResetChart={handleResetChart}
                    startDate={startDate}
                    endDate={endDate}
                />

                {/* Stats */}
                <StatsGrid cityData={cityData} />
            </div>
        </div>
    );
}