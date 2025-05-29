// src/utils/cityParser.js
export class CityParser {
  constructor() {
    this.cities = [];
    this.loaded = false;
  }

  async loadData() {
    try {
      const response = await fetch('/city.csv'); // Файл должен быть в public/
      const csvData = await response.text();
      this.parseCSV(csvData);
      this.loaded = true;
    } catch (error) {
      console.error('Ошибка загрузки городов:', error);
    }
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const addressIndex = headers.indexOf('address');
    
    const cities = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length > addressIndex && values[addressIndex]?.trim()) {
        const city = values[addressIndex].trim();
        if (!city.startsWith('"')) {
          cities.push(city);
        }
      }
    }
    
    this.cities = [...new Set(cities)]; // Удаляем дубликаты
  }

  searchCities(query, limit = 10) {
    if (!this.loaded || !query) return [];
    query = query.toLowerCase().trim();
    return this.cities
      .filter(city => city.toLowerCase().includes(query))
      .slice(0, limit);
  }
}