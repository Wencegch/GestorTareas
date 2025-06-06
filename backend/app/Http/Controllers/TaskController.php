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

        // Obtener solo las tareas del usuario actual.
        // Importante: $user->tasks() devuelve la relación, debes llamar a 'query()' en ella
        // o usar Task::where('user_id', $user->id) directamente para empezar una consulta.
        // La forma más directa es usar $user->tasks() como un Query Builder si ya lo tienes definido
        // en el modelo User (ej. public function tasks() { return $this->hasMany(Task::class); }).
        $query = $user->tasks(); // Esto ya es un Query Builder

        // Aplicar filtro por título
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%'); // Opcional: buscar también en descripción
        }

        if ($request->has('completed')) {
            $query->where('completed', $request->input('completed'));
        }
        // Si $request->has('completed') es falso, significa que el frontend no envió el parámetro,
        // por lo que no se aplicará este filtro, y se devolverán todas las tareas
        // (pendientes y completadas) para el usuario. Esto es perfecto para la opción 'all' del frontend.

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