<?php

namespace App\Http\Controllers;

use App\Models\Task; // Asegúrate de que el modelo Task esté importado
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Importa ValidationException para manejar errores de validación
use Illuminate\Support\Facades\Auth; // Asegúrate de importar Auth

class TaskController extends Controller
{
    public function index()
    {
        // Retorna solo las tareas del usuario autenticado
        return Auth::user()->tasks()->get();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|string|in:pending,completed'
        ]);

        // Asigna la tarea al usuario autenticado
        $task = Auth::user()->tasks()->create($validatedData);

        return response()->json($task, 201);
    }

    public function show(Task $task)
    {
        // Verifica si la tarea pertenece al usuario autenticado
        if ($task->user_id !== Auth::id()) {
            abort(403, 'No autorizado para ver esta tarea.');
        }
        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        // Verifica si la tarea pertenece al usuario autenticado
        if ($task->user_id !== Auth::id()) {
            abort(403, 'No autorizado para actualizar esta tarea.');
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'required|string|in:pending,completed'
        ]);

        $task->update($validatedData);
        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        // Verifica si la tarea pertenece al usuario autenticado
        if ($task->user_id !== Auth::id()) {
            abort(403, 'No autorizado para eliminar esta tarea.');
        }

        $task->delete();
        return response()->noContent();
    }
}