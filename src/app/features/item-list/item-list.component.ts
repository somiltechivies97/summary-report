import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, Item, Category } from '../../core/services/item.service';
import { businessCategory } from '../../shared/constants/itemList';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  selectedCategory = '';
  searchTerm = '';
  categories: Category[] = [];
  businessCategories = businessCategory;

  showModal = false;
  isEditMode = false;
  currentItemId: string | null = null;

  itemForm: Partial<Item> = {
    name: '',
    code: '',
    business_category: '',
    category: '',
    purchase: 0,
    sale: 0,
    mrp: 0,
    sequence: 999
  };

  loading = false;
  errorMessage = '';
  importLoading = false;
  importMessage = '';
  showImportForm = false;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories() {
    this.itemService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  loadItems() {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.errorMessage = 'Failed to load items';
        this.loading = false;
      }
    });
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.items];

    if (this.selectedCategory) {
      filtered = filtered.filter(
        (item) => item.category === this.selectedCategory
      );
    }

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
      );
    }

    this.filteredItems = filtered;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentItemId = null;
    this.itemForm = {
      name: '',
      code: '',
      business_category: '',
      category: '',
      purchase: 0,
      sale: 0,
      mrp: 0,
      sequence: 999
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  openEditModal(item: Item) {
    this.isEditMode = true;
    this.currentItemId = item.id || null;
    this.itemForm = {
      name: item.name,
      code: item.code,
      business_category: item.business_category,
      category: item.category,
      purchase: item.purchase,
      sale: item.sale,
      mrp: item.mrp,
      sequence: item.sequence
    };
    this.showModal = true;
    this.errorMessage = '';
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
  }

  saveItem() {
    if (!this.itemForm.name || !this.itemForm.business_category || !this.itemForm.category || this.itemForm.purchase === undefined || this.itemForm.sale === undefined || this.itemForm.mrp === undefined || this.itemForm.sequence === undefined) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.currentItemId) {
      this.itemService.updateItem(this.currentItemId, this.itemForm).subscribe({
        next: () => {
          this.loadItems();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating item:', error);
          this.errorMessage = 'Failed to update item';
          this.loading = false;
        }
      });
    } else {
      this.itemService.createItem(this.itemForm as Omit<Item, 'id' | 'created_at' | 'updated_at'>).subscribe({
        next: () => {
          this.loadItems();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating item:', error);
          this.errorMessage = 'Failed to create item';
          this.loading = false;
        }
      });
    }
  }

  deleteItem(item: Item) {
    if (!item.id) return;

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.loading = true;
      this.itemService.deleteItem(item.id).subscribe({
        next: () => {
          this.loadItems();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.errorMessage = 'Failed to delete item';
          this.loading = false;
        }
      });
    }
  }

  getCategoryClass(category: string): string {
    if (!category) return 'category-default';

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

  downloadTemplate() {
    const csv = [
      ['name', 'code', 'category', 'business_category', 'mrp', 'purchase', 'sale', 'sequence'],
      ['Item Name', 'ITEM001', 'POPCORN', 'Anand Jolliz', '50', '40', '42', '1'],
      ['', '', '', '', '', '', '', '']
    ];

    let csvContent = csv.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = 'items-template.csv';
    link.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.importFile(file);
  }

  importFile(file: File) {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      this.importMessage = 'Please upload an Excel (.xlsx, .xls) or CSV file';
      return;
    }

    this.importLoading = true;
    this.importMessage = '';

    const formData = new FormData();
    formData.append('file', file);

    const supabaseUrl = 'https://xiwgrqsrrvoxhcgqhrdk.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aWdycXNycnZveGhjZ3FocmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUwNzAxOTgsImV4cCI6MTk4MDY0NjE5OH0.x1B7xz4Z7V_7WRsXrJFbj6nZEUxR9FzN0E0n3jqXw0s';

    fetch(`${supabaseUrl}/functions/v1/import-items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
      },
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        this.importLoading = false;
        if (data.success) {
          this.importMessage = `Success! Imported ${data.count} items`;
          this.showImportForm = false;
          setTimeout(() => this.loadItems(), 1000);
        } else {
          this.importMessage = data.error || 'Import failed';
        }
      })
      .catch(error => {
        this.importLoading = false;
        this.importMessage = 'Import failed: ' + error.message;
      });
  }
}
