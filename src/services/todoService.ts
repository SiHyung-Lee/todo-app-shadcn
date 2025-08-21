import { supabase } from '@/lib/supabase'
import type { Todo, TodoInsert, TodoUpdate } from '@/types/todo'

export const todoService = {
  async getAll(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
      throw error
    }

    return data || []
  },

  async create(todo: TodoInsert): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .insert([todo])
      .select()
      .single()

    if (error) {
      console.error('Error creating todo:', error)
      throw error
    }

    return data
  },

  async update(id: string, updates: TodoUpdate): Promise<Todo> {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating todo:', error)
      throw error
    }

    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  },

  async toggleComplete(id: string, completed: boolean): Promise<Todo> {
    return this.update(id, { completed })
  },

  subscribeToChanges(callback: () => void) {
    const subscription = supabase
      .channel('todos-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          callback()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}