export interface HousingDataPoint {
    date: string;
    value: number;
}

export interface CityData {
    [city: string]: HousingDataPoint[];
}

export interface DrawdownInfo {
    maxDrawdown: number;
    peakDate: string | null;
    troughDate: string | null;
    recoveryDate: string | null;
    recovered: boolean;
    duration: number;
}

export interface CityStats {
    city: string;
    currentValue: number;
    growth: number;
    cagr: number;
    drawdown: DrawdownInfo;
    years: number;
}