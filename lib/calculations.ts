import { HousingDataPoint, DrawdownInfo } from '@/types';

export function calculateCAGR(data: HousingDataPoint[]): number {
    if (data.length < 2) return 0;
    const years = data.length / 12;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100;
}

export function calculateTotalGrowth(data: HousingDataPoint[]): number {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
}

export function calculateMaxDrawdown(data: HousingDataPoint[]): DrawdownInfo {
    if (data.length < 2) {
        return {
            maxDrawdown: 0,
            peakDate: null,
            troughDate: null,
            recoveryDate: null,
            recovered: false,
            duration: 0,
        };
    }

    let maxDrawdown = 0;
    let maxDrawdownInfo: DrawdownInfo = {
        maxDrawdown: 0,
        peakDate: data[0].date,
        troughDate: data[0].date,
        recoveryDate: null,
        recovered: false,
        duration: 0,
    };

    let runningPeak = data[0].value;
    let runningPeakDate = data[0].date;

    for (let i = 1; i < data.length; i++) {
        const currentValue = data[i].value;
        const currentDate = data[i].date;

        if (currentValue > runningPeak) {
            runningPeak = currentValue;
            runningPeakDate = currentDate;
        }

        const currentDrawdown = ((currentValue - runningPeak) / runningPeak) * 100;

        if (currentDrawdown < maxDrawdown) {
            maxDrawdown = currentDrawdown;
            const duration = calculateMonthsDifference(runningPeakDate, currentDate);

            maxDrawdownInfo = {
                maxDrawdown: Math.abs(maxDrawdown),
                peakDate: runningPeakDate,
                troughDate: currentDate,
                recoveryDate: null,
                recovered: false,
                duration,
            };
        }

        if (maxDrawdownInfo.troughDate && !maxDrawdownInfo.recovered &&
            currentValue >= runningPeak &&
            currentDate > maxDrawdownInfo.troughDate) {
            maxDrawdownInfo.recoveryDate = currentDate;
            maxDrawdownInfo.recovered = true;
        }
    }

    return maxDrawdownInfo;
}

function calculateMonthsDifference(startDate: string, endDate: string): number {
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const [endYear, endMonth] = endDate.split('-').map(Number);
    return (endYear - startYear) * 12 + (endMonth - startMonth);
}