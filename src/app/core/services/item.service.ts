import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LookupItem } from '../../shared/models/item.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Category {
  id?: string;
  name: string;
  sequence: number;
  created_at?: string;
  updated_at?: string;
}

export interface Item {
  id?: string;
  name: string;
  code?: string;
  category: string;
  purchase: number;
  sale: number;
  mrp: number;
  sequence: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  constructor(private supabase: SupabaseService) {}

  getItems(): Observable<Item[]> {
    return from(
      this.supabase.client
        .from('items')
        .select('*')
        .order('sequence', { ascending: true })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }

  getItemById(id: string): Observable<Item | null> {
    return from(
      this.supabase.client
        .from('items')
        .select('*')
        .eq('id', id)
        .maybeSingle()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Observable<Item> {
    return from(
      this.supabase.client
        .from('items')
        .insert(item)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  updateItem(id: string, item: Partial<Item>): Observable<Item> {
    return from(
      this.supabase.client
        .from('items')
        .update(item)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  deleteItem(id: string): Observable<void> {
    return from(
      this.supabase.client
        .from('items')
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return;
      })
    );
  }

  getCategories(): Observable<Category[]> {
    return from(
      this.supabase.client
        .from('categories')
        .select('*')
        .order('sequence', { ascending: true })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }

  createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Observable<Category> {
    return from(
      this.supabase.client
        .from('categories')
        .insert(category)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return from(
      this.supabase.client
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      })
    );
  }
}
