import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lookupItem, categoryList } from '../../shared/constants/itemList';
import { LookupItem } from '../../shared/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="item-list-container">
      <h1>Item List</h1>
      <p class="subtitle">Complete list of available items</p>
      
      <div class="controls-section">
        <div class="search-section">
          <label for="searchInput">Search by Name:</label>
          <input 
            type="text" 
            id="searchInput" 
            [(ngModel)]="searchTerm" 
            (input)="onSearchChange()" 
            placeholder="Enter item name..."
            class="search-input"
          >
        </div>
        <div class="filter-section">
          <label for="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="category-dropdown">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category.Name">{{ category.Name }}</option>
          </select>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <h3>Total Items</h3>
          <p>{{ filteredItems.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Categories</h3>
          <p>{{ categories.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Selected Category</h3>
          <p>{{ selectedCategory || 'All' }}</p>
        </div>
      </div>
      
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>MRP (₹)</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems; let i = index">
              <td>{{ item.Name }}</td>
              <td>
                <span class="category-badge" [class]="getCategoryClass(item.Category)">
                  {{ item.Category || 'N/A' }}
                </span>
              </td>
              <td class="text-center">{{ item.MRP || '0' }}</td>
              <td class="text-center">{{ item.Price || '0' }}</td>
            </tr>
            <tr *ngIf="filteredItems.length === 0" class="no-data-row">
              <td colspan="5" class="text-center">No items found matching your criteria</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent {
  items: LookupItem[] = lookupItem;
  filteredItems: LookupItem[] = [...this.items];
  selectedCategory = '';
  searchTerm = '';
  categories: any[] = categoryList;

  constructor() {
    this.initializeData();
  }

  initializeData() {
    this.filteredItems = [...this.items];
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.items];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (item) => item.Category === this.selectedCategory
      );
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.Name.toLowerCase().includes(searchLower)
      );
    }

    this.filteredItems = filtered;
  }

  getCategoryClass(category: string): string {
    if (!category) return 'category-default';

    // Generate consistent class names based on category
    const categoryClasses: { [key: string]: string } = {
      POPCORN: 'category-popcorn',
      FRYUMS: 'category-fryums',
      NAMKEEN: 'category-namkeen',
      WAFERS: 'category-wafers',
      CHIKKI: 'category-chikki',
      DERBY_JAR: 'category-derby',
      DERBY_POUCH: 'category-derby',
      '200GM': 'category-200gm',
      '400GM': 'category-400gm',
      '1KG': 'category-1kg',
    };

    return categoryClasses[category] || 'category-default';
  }
}
