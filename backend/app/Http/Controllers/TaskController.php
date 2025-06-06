<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Importa Auth para obtener el usuario autenticado

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Obtener el usuario autenticado
        $user = Auth::user();

        // Obtener solo las tareas del usuario actual
        $tasks = $user->tasks(); // Esto devuelve un query builder, no una colección

        // Aplicar filtro por título si se proporciona un parámetro 'search' en la URL
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $tasks->where('title', 'like', '%' . $searchTerm . '%');
        }

        // Aplicar filtro por estado 'completed' si se proporciona 'completed'
        if ($request->has('completed')) {
            $completedFilter = $request->input('completed');
            if ($completedFilter === '1' || $completedFilter === '0') { // Asegurarse de que es 0 o 1
                $tasks->where('completed', (bool)$completedFilter);
            }
            // Podrías añadir un 'else if' para manejar valores como 'true'/'false' si los envías desde el frontend
        }
        
        // Ordenar las tareas (por ejemplo, por fecha de creación descendente)
        $tasks->orderBy('created_at', 'desc');

        // Obtener las tareas paginadas (opcional, pero buena práctica si tienes muchas tareas)
        // return response()->json($tasks->paginate(10)); // Si quieres paginación
        return response()->json($tasks->get()); // Si quieres todas las tareas filtradas
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
        ]);

        $task = new Task($request->all());
        $task->user_id = Auth::id(); // Asigna la tarea al usuario autenticado
        $task->save();

        return response()->json($task, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function show(Task $task)
    {
        // Asegúrate de que solo el propietario de la tarea pueda verla
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Task $task)
    {
        // Asegúrate de que solo el propietario de la tarea pueda actualizarla
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'boolean',
        ]);

        $task->update($request->all());
        return response()->json($task);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function destroy(Task $task)
    {
        // Asegúrate de que solo el propietario de la tarea pueda eliminarla
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $task->delete();
        return response()->json(null, 204);
    }
}