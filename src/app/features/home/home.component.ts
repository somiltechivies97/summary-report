   import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { lookupItem } from '../../shared/constants/itemList';
import { categoryList } from '../../shared/constants/itemList';
// import { LookupItem } from '../../shared/models/item.model';
import * as XLSX from 'xlsx';

type AOA = any[][];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <h1>Welcome to Angular</h1>
      <p class="subtitle">A modern web development framework</p>
      
      <div class="controls-section">
        <div>
          <input type="file" #fileInput (change)="onFileSelected($event)" accept=".xlsx,.xls,.csv" multiple="false" style="display: none;">
          <button class="upload-btn mr-2" (click)="fileInput.click()" *ngIf="!items.length">Upload</button>
          <button class="clear-btn mr-2" (click)="onClearData()" *ngIf="items.length > 0">Clear</button>
          <button class="upload-btn" (click)="onExportPDF()" *ngIf="items.length > 0">Export</button>
        </div>
        
        <div class="filter-section">
          <label for="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="category-dropdown">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category.Name">{{ category.Name }}</option>
          </select>
        </div>
      </div>
      <div class="table-section">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <!-- <th>Unit</th> -->
              <th>Sales Qty</th>
              <th>Sales Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems">
              <td>{{ item.Name }}</td>
             <td>{{ item.Category || 'N/A' }}</td>
             <!-- <td>{{ item.Unit || 'N/A' }}</td> -->
              <td class="text-center">{{ item.SalesQty || 0 }}</td>
              <td class="text-center">₹{{ item.SalesAmt || 0 }}</td>
            </tr>
            <tr style="height: 60px" *ngIf="filteredItems?.length">
              <td colspan="3"><b>Total</b></td>
              <td class="text-center"><b>₹{{totalSalesAmt}}</b></td>
            </tr>
            <tr style="height: 100px" *ngIf="!filteredItems?.length">
              <td class="text-center" colspan="4">No Record Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  items: any = [];
  filteredItems = [...this.items];
  selectedCategory = '';
  categories: any = [];
  itemList = lookupItem;
  totalSalesAmt: any;

  data: AOA = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';

  constructor() {
    this.initializeCategories();
    console.log('this.filteredItems', this.filteredItems);
  }

  initializeCategories() {
    this.categories = categoryList;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (
        fileExtension === 'csv' ||
        fileExtension === 'xlsx' ||
        fileExtension === 'xls'
      ) {
      } else {
        alert('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      }
    }

    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
      const filteredRows = this.data.filter((row: any, index: number) => {
        const itemName = row[0]?.toString().trim();
        // Skip header row (assumed to be first row)
        if (index === 0) return false;
        // Skip blank or empty item names
        if (!itemName) return false;
        // Skip total or footer rows
        if (itemName.toLowerCase().includes('total')) return false;
        return true;
      });
      console.log('test', this.data);
      const mappedData = filteredRows.map((row: any) => {
        const itemName = row[0] || '';
        // Find matching item in itemList to get category
        const matchingItem = this.itemList.find(
          (item) => item.Name.toLowerCase() === itemName.toLowerCase()
        );

        return {
          Name: itemName,
          SalesQty: row[1],
          SalesAmt: row[2],
          Category: matchingItem ? matchingItem.Category : 'N/A',
          CategorySeq:
            this.categories.find((f: any) => f.Name === matchingItem?.Category)
              ?.Sequence || 0,
          Sequence: matchingItem?.Sequence || 999,
          // Unit: row[1] || '',
          // SalesAmt: matchingItem
          //   ? row[2] * parseInt(matchingItem.Price || '0')
          //   : 0,
          // Price: matchingItem ? parseInt(matchingItem.Price || '0') : 0,
        };
      });

      // Sort by CategorySeq first, then by Sequence within each category
      this.items = mappedData.sort((a, b) => {
        // First sort by CategorySeq
        if (a.CategorySeq !== b.CategorySeq) {
          return a.CategorySeq - b.CategorySeq;
        }
        // Within same category, sort by Sequence
        // Items without Sequence (999) will appear at bottom
        return a.Sequence - b.Sequence;
      });

      this.filteredItems = [...this.items];

      this.salesAmtCalc();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  readCSVFile(file: File) {
    // const reader = new FileReader();
    // reader.onload = (e: any) => {
    //   try {
    //     const csvData = e.target.result;
    //     console.log('this.csvData', csvData);
    //     const lines = csvData.split('\n');
    //     if (lines.length < 2) {
    //       alert('CSV file must have at least a header row and one data row.');
    //       return;
    //     }
    //     // Parse header row
    //     const headers = lines[0]
    //       .split(',')
    //       .map((header: string) => header.trim().replace(/"/g, ''));
    //     // Parse data rows
    //     const jsonData: any[] = [];
    //     for (let i = 1; i < lines.length; i++) {
    //       const line = lines[i].trim();
    //       if (line) {
    //         const values = line
    //           .split(',')
    //           .map((value: string) => value.trim().replace(/"/g, ''));
    //         const rowData: any = {};
    //         headers.forEach((header: string, index: number) => {
    //           rowData[header] = values[index] || '';
    //         });
    //         jsonData.push(rowData);
    //       }
    //     }
    //     console.log('this.items', jsonData);
    //     const mappedData = jsonData.map((row: any) => {
    //       const itemName = row['Item Name'] || '';
    //       // Find matching item in itemList to get category
    //       const matchingItem = this.itemList.find(
    //         (item) => item.Name.toLowerCase() === itemName.toLowerCase()
    //       );
    //       return {
    //         Name: itemName,
    //         Category: matchingItem ? matchingItem.Category : '',
    //         Unit: row['Unit'] || '',
    //         SalesQty: parseInt(row['Sales Quantity']) || 0,
    //       };
    //     });
    //     Update items and filtered items
    //     this.items = mappedData;
    //     this.filteredItems = [...this.items];
    //     console.log('this.items', this.items);
    //     console.log('CSV data converted to JSON:', mappedData);
    //     alert(
    //       `Successfully uploaded ${mappedData.length} items from CSV file!`
    //     );
    //   } catch (error) {
    //     console.error('Error reading CSV file:', error);
    //     alert(
    //       "Error reading CSV file. Please make sure it's a valid CSV file."
    //     );
    //   }
    // };
    // reader.readAsText(file);
  }

  readExcelFile(file: File) {
    // const reader = new FileReader();
    // reader.onload = (e: any) => {
    //   try {
    //     const data = new Uint8Array(e.target.result);
    //     const workbook = XLSX.read(data, { type: 'array' });
    //     // Get the first worksheet
    //     const firstSheetName = workbook.SheetNames[0];
    //     const worksheet = workbook.Sheets[firstSheetName];
    //     // Convert to JSON
    //     const jsonData = XLSX.utils.sheet_to_json(worksheet);
    //     const mappedData = jsonData.map((row: any) => ({
    //       Name: row['Item Name'] || '',
    //       Unit: row['Unit'] || '',
    //       SalesQty: parseInt(row['Sales Quantity']) || 0,
    //     }));
    //     // Update items and filtered items
    //     this.items = mappedData;
    //     this.filteredItems = [...this.items];
    //     console.log('Excel data converted to JSON:', mappedData);
    //     alert(
    //       `Successfully uploaded ${mappedData.length} items from Excel file!`
    //     );
    //   } catch (error) {
    //     console.error('Error reading Excel file:', error);
    //     alert(
    //       "Error reading Excel file. Please make sure it's a valid Excel file."
    //     );
    //   }
    // };
    // reader.readAsArrayBuffer(file);
  }

  updateCategoriesFromData() {
    // const categorySet = new Set<string>();
    // this.items.forEach(item => {
    //   if (item.Category && item.Category.trim()) {
    //     categorySet.add(item.Category);
    //   }
    // });
    // // Combine existing categories with new ones from uploaded data
    // const existingCategories = categoryList.map(cat => cat.Name);
    // const newCategories = Array.from(categorySet).filter(cat => !existingCategories.includes(cat));
    // if (newCategories.length > 0) {
    //   const additionalCategories = newCategories.map((name, index) => ({
    //     Id: categoryList.length + index + 1,
    //     Name: name,
    //     Sequence: categoryList.length + index + 1
    //   }));
    //   this.categories = [...categoryList, ...additionalCategories];
    // }
  }

  onExportExcel() {
    // Export functionality - convert current data to Excel
    // if (this.filteredItems.length === 0) {
    //   alert('No data to export. Please upload a file first or check your filters.');
    //   return;
    // }
    // const worksheet = XLSX.utils.json_to_sheet(this.filteredItems);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
    // // Save the file
    // XLSX.writeFile(workbook, 'exported_items.xlsx');
  }

  onExportPDF() {
    if (this.filteredItems.length === 0) {
      alert(
        'No data to export. Please upload a file first or check your filters.'
      );
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    const titleY = 30;
    let currentY = 20;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Items Summary Report', pageWidth / 2, currentY, {
      align: 'center',
    });

    // Date (placed below title)
    currentY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const dateY = titleY + 12;
    doc.text(
      `Generated on: ${this.getCurrentDate()}`,
      pageWidth / 2,
      currentY,
      {
        align: 'center',
      }
    );

    // Category Filter (optional)
    let categoryY = dateY;
    if (this.selectedCategory) {
      categoryY = dateY + 12;
      currentY += 12;
      doc.setFontSize(10);
      doc.text(
        `Category Filter: ${this.selectedCategory}`,
        pageWidth / 2,
        currentY,
        {
          align: 'center',
        }
      );
    }

    // ---------- TABLE SECTION ----------
    const startY = this.selectedCategory ? categoryY + 10 : dateY + 10;
    const tableStartY = currentY + 8;
    const totalSalesQty = this.filteredItems.reduce(
      (sum, item) => sum + (item.SalesQty || 0),
      0
    );

    const tableData = this.filteredItems.map((item) => [
      item.Name,
      item.Category,
      item.SalesQty?.toString() || '0',
      `${item.SalesAmt || 0}`,
    ]);
    tableData.push(['Total', '', `${totalSalesQty}`, `${this.totalSalesAmt}`]);

    autoTable(doc, {
      head: [['Name', 'Category', 'Sales Qty', 'Sales Amt']],
      body: tableData,
      startY: tableStartY,
      styles: {
        fontSize: 9,
        cellPadding: { top: 1, bottom: 1, left: 0, right: 0 },
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
        textColor: [0, 0, 0],
        fillColor: false,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        cellPadding: { top: 1, bottom: 1, left: 1, right: 1 },
        lineWidth: { top: 0.5, right: 0, bottom: 0.5, left: 0 },
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: false,
        lineColor: [180, 180, 180],
        lineWidth: { top: 0, right: 0, bottom: 0.2, left: 0 },
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
      },
      didParseCell: (data) => {
        if (
          data.section === 'head' &&
          (data.column.index === 1 || data.column.index === 2)
        ) {
          data.cell.styles.halign = 'center';
        }
        if (
          data.section === 'body' &&
          data.row.index === tableData.length - 1
        ) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 0, 0];
        }
      },
      theme: 'plain',
      showHead: 'firstPage',
    });

    // Save the PDF
    doc.save('items_report.pdf');
  }

  onCategoryChange() {
    if (this.selectedCategory) {
      this.filteredItems = this.items.filter(
        (item: any) => item.Category === this.selectedCategory
      );
    } else {
      this.filteredItems = [...this.items];
    }

    this.salesAmtCalc();
  }

  salesAmtCalc() {
    this.totalSalesAmt = this.filteredItems.reduce((sum, item) => {
      return sum + Number(item.SalesAmt);
    }, 0);
  }

  public onClearData() {
    this.items = [];
    this.filteredItems = [];
    this.selectedCategory = '';
    this.totalSalesAmt = 0;
  }

  public getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}
