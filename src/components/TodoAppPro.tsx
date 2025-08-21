import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Circle, 
  ListTodo, 
  MoreVertical,
  Clock,
  Edit2,
  Star,
  StarOff,
  Loader2
} from "lucide-react";
import { supabase } from '@/lib/supabase';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  starred: boolean;
}

const TodoAppPro: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'starred'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('개인');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Supabase에서 todos 가져오기
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      // 에러 시 로컬 스토리지 폴백
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos.map((todo: any) => ({
          ...todo,
          priority: todo.priority || 'medium',
          category: todo.category || '개인',
          starred: todo.starred || false
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 및 실시간 구독
  useEffect(() => {
    fetchTodos();

    // 실시간 구독 설정
    const subscription = supabase
      .channel('todos-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로컬 스토리지 백업 (옵션)
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = async () => {
    if (inputValue.trim() === '') return;

    setSaving(true);
    const newTodo = {
      text: inputValue,
      completed: false,
      priority,
      category,
      starred: false
    };

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([newTodo])
        .select()
        .single();

      if (error) throw error;

      setTodos([data, ...todos]);
      setInputValue('');
      setShowAddDialog(false);
      setPriority('medium');
      setCategory('개인');
    } catch (error) {
      console.error('Error adding todo:', error);
      // 에러 시 로컬에만 추가
      const localTodo = {
        ...newTodo,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      setTodos([localTodo, ...todos]);
      setInputValue('');
      setShowAddDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      // 에러 시에도 로컬에서는 삭제
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      // 에러 시에도 로컬에서는 토글
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    }
  };

  const toggleStar = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ starred: !todo.starred })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(t =>
        t.id === id ? { ...t, starred: !t.starred } : t
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
      // 에러 시에도 로컬에서는 토글
      setTodos(todos.map(t =>
        t.id === id ? { ...t, starred: !t.starred } : t
      ));
    }
  };

  const updateTodo = async () => {
    if (!editingTodo || editText.trim() === '') return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          text: editText,
          priority: editPriority,
          category: editCategory
        })
        .eq('id', editingTodo.id);

      if (error) throw error;

      setTodos(todos.map(todo =>
        todo.id === editingTodo.id 
          ? { ...todo, text: editText, priority: editPriority, category: editCategory } 
          : todo
      ));
      setEditingTodo(null);
      setEditText('');
      setEditPriority('medium');
      setEditCategory('');
    } catch (error) {
      console.error('Error updating todo:', error);
      // 에러 시에도 로컬에서는 업데이트
      setTodos(todos.map(todo =>
        todo.id === editingTodo.id 
          ? { ...todo, text: editText, priority: editPriority, category: editCategory } 
          : todo
      ));
      setEditingTodo(null);
      setEditText('');
      setEditPriority('medium');
      setEditCategory('');
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    try {
      for (const todo of completedTodos) {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', todo.id);
        
        if (error) throw error;
      }
      
      setTodos(todos.filter(todo => !todo.completed));
    } catch (error) {
      console.error('Error clearing completed:', error);
      // 에러 시에도 로컬에서는 삭제
      setTodos(todos.filter(todo => !todo.completed));
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'starred') return todo.starred;
    return true;
  }).filter(todo => {
    if (selectedCategory === 'all') return true;
    return todo.category === selectedCategory;
  });

  const categories = Array.from(new Set(todos.map(todo => todo.category)));
  
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    starred: todos.filter(t => t.starred).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">높음</Badge>;
      case 'medium': return <Badge variant="secondary">보통</Badge>;
      case 'low': return <Badge variant="outline">낮음</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-8">
          <div className="flex items-center justify-center gap-2">
            <ListTodo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Todo App Pro
            </h1>
          </div>
          <p className="text-muted-foreground">고급 기능이 포함된 할일 관리</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">전체</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">{stats.active}</div>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">완료</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.starred}</div>
              <p className="text-xs text-muted-foreground">중요</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>할일 목록</CardTitle>
            <CardDescription>Supabase와 실시간 동기화되는 고급 할일 관리</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    새 할일 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 할일 추가</DialogTitle>
                    <DialogDescription>
                      할일의 내용과 우선순위, 카테고리를 설정하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="todo-text">할일 내용</Label>
                      <Input
                        id="todo-text"
                        placeholder="할일을 입력하세요..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !saving && addTodo()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">우선순위</Label>
                      <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">카테고리</Label>
                      <Input
                        id="category"
                        placeholder="카테고리 (예: 개인, 업무)"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTodo} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        '추가'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  전체 ({stats.total})
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  진행 중 ({stats.active})
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                >
                  완료 ({stats.completed})
                </Button>
                <Button
                  variant={filter === 'starred' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('starred')}
                >
                  중요 ({stats.starred})
                </Button>
              </div>
              
              {categories.length > 0 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 카테고리</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Separator />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  할일이 없습니다.
                </div>
              ) : (
                filteredTodos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.text}
                        </p>
                        {getPriorityBadge(todo.priority)}
                        {todo.category && (
                          <Badge variant="outline" className="text-xs">
                            {todo.category}
                          </Badge>
                        )}
                      </div>
                      {todo.created_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(todo.created_at).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStar(todo.id)}
                        className="h-8 w-8"
                      >
                        {todo.starred ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className={`h-4 w-4 ${getPriorityColor(todo.priority)}`} />
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTodo(todo);
                              setEditText(todo.text);
                              setEditPriority(todo.priority);
                              setEditCategory(todo.category);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteTodo(todo.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            {editingTodo && (
              <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>할일 수정</DialogTitle>
                    <DialogDescription>
                      할일의 내용, 우선순위, 카테고리를 수정하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-text">할일 내용</Label>
                      <Input
                        id="edit-text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="할일을 입력하세요..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-priority">우선순위</Label>
                      <Select value={editPriority} onValueChange={(value: any) => setEditPriority(value)}>
                        <SelectTrigger id="edit-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-category">카테고리</Label>
                      <Input
                        id="edit-category"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="카테고리 (예: 개인, 업무)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingTodo(null)}>
                      취소
                    </Button>
                    <Button onClick={updateTodo}>
                      저장
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {stats.completed > 0 && (
              <>
                <Separator />
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        완료된 항목 모두 삭제 ({stats.completed})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>완료된 항목 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          완료된 {stats.completed}개의 항목을 모두 삭제하시겠습니까?
                          이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={clearCompleted}>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodoAppPro;