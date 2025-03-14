
// Classe base para simular um banco de dados usando localStorage
class LocalDatabase {
  private storagePrefix: string;

  constructor(prefix: string = 'appDB') {
    this.storagePrefix = prefix;
  }

  private getKey(table: string): string {
    return `${this.storagePrefix}_${table}`;
  }

  // Salvar dados em uma "tabela"
  saveTable<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getKey(table), JSON.stringify(data));
  }

  // Recuperar todos os dados de uma "tabela"
  getTable<T>(table: string): T[] {
    const data = localStorage.getItem(this.getKey(table));
    return data ? JSON.parse(data) : [];
  }

  // Inserir um item em uma "tabela"
  insert<T extends { id?: string }>(table: string, item: T): T {
    const data = this.getTable<T>(table);
    
    // Gerar ID se não existir
    const newItem = { 
      ...item, 
      id: item.id || crypto.randomUUID() 
    };
    
    data.push(newItem as T);
    this.saveTable(table, data);
    return newItem as T;
  }

  // Atualizar um item em uma "tabela"
  update<T extends { id: string }>(table: string, id: string, updates: Partial<T>): T | null {
    const data = this.getTable<T>(table);
    const index = data.findIndex(item => (item as any).id === id);
    
    if (index === -1) return null;
    
    const updatedItem = { ...data[index], ...updates };
    data[index] = updatedItem;
    this.saveTable(table, data);
    
    return updatedItem;
  }

  // Excluir um item de uma "tabela"
  delete<T extends { id: string }>(table: string, id: string): boolean {
    const data = this.getTable<T>(table);
    const filteredData = data.filter(item => (item as any).id !== id);
    
    if (filteredData.length === data.length) return false;
    
    this.saveTable(table, filteredData);
    return true;
  }

  // Buscar por um item específico
  findById<T extends { id: string }>(table: string, id: string): T | null {
    const data = this.getTable<T>(table);
    const item = data.find(item => (item as any).id === id);
    return item || null;
  }

  // Buscar por um critério específico
  findBy<T>(table: string, field: keyof T, value: any): T[] {
    const data = this.getTable<T>(table);
    return data.filter(item => (item as any)[field] === value);
  }

  // Limpar uma "tabela"
  clearTable(table: string): void {
    localStorage.removeItem(this.getKey(table));
  }

  // Verificar se uma "tabela" existe
  tableExists(table: string): boolean {
    return localStorage.getItem(this.getKey(table)) !== null;
  }
}

// Instância única do banco de dados
export const localDB = new LocalDatabase();
