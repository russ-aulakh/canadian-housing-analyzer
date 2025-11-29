export async function fetchHousingData() {
    const response = await fetch('/api/housing-data');
    if (!response.ok) {
        throw new Error('Failed to fetch housing data');
    }
    return response.json();
}