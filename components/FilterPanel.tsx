'use client';

import { CITY_COLORS, MAJOR_CITIES, PROVINCES } from '@/lib/constants';

interface FilterPanelProps {
    indexType: string;
    setIndexType: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    selectedCities: string[];
    setSelectedCities: (cities: string[]) => void;
    availableCities: string[];
    onResetDates: () => void;
}

export default function FilterPanel({
                                        indexType,
                                        setIndexType,
                                        startDate,
                                        setStartDate,
                                        endDate,
                                        setEndDate,
                                        selectedCities,
                                        setSelectedCities,
                                        availableCities,
                                        onResetDates,
                                    }: FilterPanelProps) {
    const toggleCity = (city: string) => {
        setSelectedCities(
            selectedCities.includes(city)
                ? selectedCities.filter((c) => c !== city)
                : [...selectedCities, city]
        );
    };

    // Filter out provinces to get only cities
    const allCities = availableCities.filter(city => !PROVINCES.includes(city));

    // Generate year and month options
    const startYear = parseInt(startDate.split('-')[0]);
    const endYear = parseInt(endDate.split('-')[0]);
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const startParts = startDate.split('-');
    const endParts = endDate.split('-');

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* Controls Row */}
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Index Type
                    </label>
                    <select
                        value={indexType}
                        onChange={(e) => setIndexType(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium"
                    >
                        <option value="Total (house and land)">Total (House + Land)</option>
                        <option value="House only">House Only</option>
                        <option value="Land only">Land Only</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">
                            Date Range
                        </label>
                        <button
                            onClick={onResetDates}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Reset to Full Range
                        </button>
                    </div>
                    <div className="space-y-3">
                        {/* Start Date */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">From</label>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={startParts[1]}
                                    onChange={(e) => setStartDate(`${startParts[0]}-${e.target.value}`)}
                                    className="px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium text-sm"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={startParts[0]}
                                    onChange={(e) => setStartDate(`${e.target.value}-${startParts[1]}`)}
                                    className="px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium text-sm"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">To</label>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={endParts[1]}
                                    onChange={(e) => setEndDate(`${endParts[0]}-${e.target.value}`)}
                                    className="px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium text-sm"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={endParts[0]}
                                    onChange={(e) => setEndDate(`${e.target.value}-${endParts[1]}`)}
                                    className="px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 font-medium text-sm"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* City & Province Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                        Cities & Provinces
                    </label>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <button
                            onClick={() => setSelectedCities(MAJOR_CITIES)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Major Cities
                        </button>
                        <button
                            onClick={() => setSelectedCities(PROVINCES)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            All Provinces
                        </button>
                        <button
                            onClick={() => setSelectedCities(allCities)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            All Cities
                        </button>
                        <button
                            onClick={() => setSelectedCities(availableCities)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => setSelectedCities([])}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                    {availableCities.map((city) => (
                        <button
                            key={city}
                            onClick={() => toggleCity(city)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                                selectedCities.includes(city)
                                    ? 'bg-blue-50 border-2 border-blue-500'
                                    : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                            }`}
                        >
                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CITY_COLORS[city] || '#94a3b8' }}
                            />
                            <span className="text-sm font-medium text-slate-700 truncate">
                {city}
              </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}