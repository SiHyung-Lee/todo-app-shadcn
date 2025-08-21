export interface Todo {
  id: string
  text: string
  completed: boolean
  created_at?: string
  updated_at?: string
}

export type TodoInsert = Omit<Todo, 'id' | 'created_at' | 'updated_at'>
export type TodoUpdate = Partial<TodoInsert>