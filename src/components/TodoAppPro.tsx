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
  Calendar,
  Clock,
  Edit2,
  Archive,
  Star,
  StarOff
} from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
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
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      setTodos(parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        priority: todo.priority || 'medium',
        category: todo.category || '개인',
        starred: todo.starred || false
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue,
      completed: false,
      createdAt: new Date(),
      priority: priority,
      category: category,
      starred: false
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setPriority('medium');
    setCategory('개인');
    setShowAddDialog(false);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const toggleStar = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, starred: !todo.starred } : todo
    ));
  };

  const updateTodo = (id: string, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    setEditingTodo(null);
    setEditText('');
  };

  const categories = ['all', ...Array.from(new Set(todos.map(t => t.category)))];

  const filteredTodos = todos.filter(todo => {
    const categoryMatch = selectedCategory === 'all' || todo.category === selectedCategory;
    
    if (filter === 'active') return !todo.completed && categoryMatch;
    if (filter === 'completed') return todo.completed && categoryMatch;
    if (filter === 'starred') return todo.starred && categoryMatch;
    return categoryMatch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    starred: todos.filter(t => t.starred).length
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

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
          <p className="text-muted-foreground">고급 기능으로 할 일을 완벽하게 관리하세요</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">전체</p>
                </div>
                <ListTodo className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-500">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">진행 중</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">완료</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{stats.starred}</div>
                  <p className="text-xs text-muted-foreground">중요</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>할일 목록</CardTitle>
                <CardDescription>새로운 할일을 추가하고 관리하세요</CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    새 할일
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>새 할일 추가</DialogTitle>
                    <DialogDescription>
                      새로운 할일의 세부 정보를 입력하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task" className="text-right">
                        할일
                      </Label>
                      <Input
                        id="task"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="col-span-3"
                        placeholder="할일을 입력하세요..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        우선순위
                      </Label>
                      <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="우선순위 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        카테고리
                      </Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="col-span-3"
                        placeholder="카테고리 입력..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTodo}>추가</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
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
              
              <Separator orientation="vertical" className="h-9" />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? '모든 카테고리' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sortedTodos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {filter === 'completed' ? '완료된 할일이 없습니다' :
                   filter === 'active' ? '진행 중인 할일이 없습니다' :
                   filter === 'starred' ? '중요한 할일이 없습니다' :
                   '할일을 추가해보세요'}
                </div>
              ) : (
                sortedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleStar(todo.id)}
                    >
                      {todo.starred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>

                    <div className="flex-1">
                      {editingTodo?.id === todo.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateTodo(todo.id, editText);
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => updateTodo(todo.id, editText)}
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTodo(null);
                              setEditText('');
                            }}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className={`${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                              {todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {todo.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(todo.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
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
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleStar(todo.id)}
                          >
                            {todo.starred ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                중요 해제
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                중요 표시
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                <span className="text-destructive">삭제</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  이 작업은 되돌릴 수 없습니다. 할일이 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteTodo(todo.id)}>
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            {stats.completed > 0 && (
              <>
                <Separator />
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        완료된 항목 모두 삭제 ({stats.completed})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>완료된 항목을 모두 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {stats.completed}개의 완료된 할일이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={clearCompleted}>
                          모두 삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Made with ❤️ using shadcn/ui
        </div>
      </div>
    </div>
  );
};

export default TodoAppPro;