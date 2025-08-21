import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Trash2, Plus, CheckCircle2, Circle, ListTodo, Loader2, AlertCircle } from "lucide-react";
import { todoService } from "@/services/todoService";
import type { Todo } from "@/types/todo";
import { Alert, AlertDescription } from "./ui/alert";

const TodoAppSupabase: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase에서 할일 목록 불러오기
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.getAll();
      setTodos(data);
    } catch (err) {
      setError("할일 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 및 실시간 구독 설정
  useEffect(() => {
    fetchTodos();

    // 실시간 구독 설정
    const unsubscribe = todoService.subscribeToChanges(() => {
      fetchTodos();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 새로운 할일 추가
  const addTodo = async () => {
    if (inputValue.trim() === "") return;

    setSaving(true);
    setError(null);
    try {
      await todoService.create({
        text: inputValue,
        completed: false,
      });
      setInputValue("");
      await fetchTodos();
    } catch (err) {
      setError("할일 추가에 실패했습니다.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // 할일 삭제
  const deleteTodo = async (id: string) => {
    setError(null);
    try {
      await todoService.delete(id);
      await fetchTodos();
    } catch (err) {
      setError("할일 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  // 할일 완료 상태 토글
  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    setError(null);
    try {
      await todoService.toggleComplete(id, !todo.completed);
      await fetchTodos();
    } catch (err) {
      setError("할일 상태 변경에 실패했습니다.");
      console.error(err);
    }
  };

  // 필터링된 할일 목록
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // 통계 정보
  const stats = {
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  // 모든 완료된 할일 삭제
  const clearCompleted = async () => {
    setError(null);
    const completedTodos = todos.filter((todo) => todo.completed);
    
    try {
      await Promise.all(
        completedTodos.map((todo) => todoService.delete(todo.id))
      );
      await fetchTodos();
    } catch (err) {
      setError("완료된 할일 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2 pt-8">
          <div className="flex items-center justify-center gap-2">
            <ListTodo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Todo App
            </h1>
          </div>
          <p className="text-muted-foreground">
            Supabase와 연동된 실시간 할일 관리
          </p>
        </div>

        {/* 에러 알림 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">전체</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">완료</p>
            </CardContent>
          </Card>
        </div>

        {/* 메인 카드 */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>할일 목록</CardTitle>
            <CardDescription>
              새로운 할일을 추가하고 관리하세요 (실시간 동기화)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 입력 폼 */}
            <div className="flex gap-2">
              <Input
                placeholder="할일을 입력하세요..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !saving && addTodo()}
                className="flex-1"
                disabled={saving}
              />
              <Button onClick={addTodo} size="icon" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* 필터 버튼 */}
            <div className="flex gap-2 justify-center">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}>
                전체 ({stats.total})
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}>
                진행 중 ({stats.active})
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}>
                완료 ({stats.completed})
              </Button>
            </div>

            {/* 할일 목록 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">불러오는 중...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {filter === "completed"
                    ? "완료된 할일이 없습니다"
                    : filter === "active"
                    ? "진행 중인 할일이 없습니다"
                    : "할일을 추가해보세요"}
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <div className="flex-1">
                      <p
                        className={`${
                          todo.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}>
                        {todo.text}
                      </p>
                      {todo.created_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(todo.created_at).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {todo.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 완료된 항목 모두 삭제 */}
            {stats.completed > 0 && (
              <div className="flex justify-end pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  className="text-destructive hover:text-destructive">
                  완료된 항목 모두 삭제 ({stats.completed})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 푸터 */}
        <div className="text-center text-sm text-muted-foreground">
          Made with ❤️ using shadcn/ui & Supabase
        </div>
      </div>
    </div>
  );
};

export default TodoAppSupabase;