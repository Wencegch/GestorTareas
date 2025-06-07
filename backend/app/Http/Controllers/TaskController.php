<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Obtener solo las tareas del usuario autenticado
        $query = Task::where('user_id', $user->id);

        // Aplicar filtro por título o descripción
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($subQuery) use ($searchTerm) {
                $subQuery->where('title', 'like', '%' . $searchTerm . '%')
                        ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Aplicar filtro por estado (completadas o pendientes)
        if ($request->has('completed')) {
            $query->where('completed', $request->input('completed'));
        }

        $query->orderBy('created_at', 'desc');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date', // 'nullable' si no es siempre requerido
            'completed' => 'boolean',
            'priority' => 'required|in:low,medium,high', // Validar prioridad
        ]);

        $task = new Task($request->all());
        $task->user_id = Auth::id();
        $task->save();

        return response()->json($task, 201);
    }

    public function show(Task $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'completed' => 'boolean',
            'priority' => 'required|in:low,medium,high', // Validar prioridad
        ]);

        $task->update($request->all());
        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $task->delete();
        return response()->json(null, 204);
    }
}